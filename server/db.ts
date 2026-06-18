import { db } from "./firebase";
import { ENV } from "./_core/env";
import type { 
  User, InsertUser, Activity, InsertActivity, Challenge, Story, Collective, 
  CollectiveMember, LeaderboardSeason, LeaderboardEntry, InfluenceEdge, FeedItem, 
  PeerSnapshot, AgentNegotiation 
} from "./types/db";

// Helper to generate string IDs
const generateId = () => Math.random().toString(36).substring(2, 15);

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const usersRef = db.collection('users');
  const snapshot = await usersRef.where('openId', '==', user.openId).limit(1).get();
  
  const role = user.role || (user.openId === ENV.ownerOpenId ? "admin" : "user");
  const now = new Date();
  
  if (snapshot.empty) {
    // Insert new
    const id = generateId();
    await usersRef.doc(id).set({
      id,
      openId: user.openId,
      name: user.name || "",
      email: user.email || "",
      loginMethod: user.loginMethod || "manus",
      archetype: "urban_commuter",
      totalCarbonKg: 0,
      weeklyBudgetKg: 70,
      eloScore: 1000,
      influenceScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      preferredLanguage: "en",
      onboardingCompleted: false,
      role,
      createdAt: now,
      updatedAt: now,
      lastSignedIn: user.lastSignedIn || now,
    });
  } else {
    // Update existing
    const doc = snapshot.docs[0];
    const updateData: any = { updatedAt: now, lastSignedIn: user.lastSignedIn || now };
    if (user.name !== undefined) updateData.name = user.name;
    if (user.email !== undefined) updateData.email = user.email;
    if (user.loginMethod !== undefined) updateData.loginMethod = user.loginMethod;
    if (user.role !== undefined) updateData.role = user.role;
    
    await usersRef.doc(doc.id).update(updateData);
  }
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const snapshot = await db.collection('users').where('openId', '==', openId).limit(1).get();
  if (snapshot.empty) return undefined;
  const data = snapshot.docs[0].data() as any;
  // Firestore timestamps need to be converted to JS Dates
  return { ...data, createdAt: data.createdAt?.toDate(), updatedAt: data.updatedAt?.toDate(), lastSignedIn: data.lastSignedIn?.toDate() } as User;
}

export async function getUserById(id: string): Promise<User | undefined> {
  const doc = await db.collection('users').doc(id).get();
  if (!doc.exists) return undefined;
  const data = doc.data() as any;
  return { ...data, createdAt: data.createdAt?.toDate(), updatedAt: data.updatedAt?.toDate(), lastSignedIn: data.lastSignedIn?.toDate() } as User;
}

export async function updateUserProfile(userId: string, data: Partial<InsertUser>) {
  await db.collection('users').doc(userId).update({ ...data, updatedAt: new Date() });
}

export async function getAllUsersForLeaderboard() {
  const snapshot = await db.collection('users').orderBy('eloScore', 'desc').limit(100).get();
  return snapshot.docs.map(doc => {
    const data = doc.data() as any;
    return {
      id: data.id,
      name: data.name,
      archetype: data.archetype,
      archetypeLabel: data.archetypeLabel || "Urban Commuter",
      eloScore: data.eloScore,
      influenceScore: data.influenceScore,
      totalCarbonKg: data.totalCarbonKg,
      currentStreak: data.currentStreak,
    };
  });
}

export async function logActivity(data: InsertActivity) {
  const id = generateId();
  const now = new Date();
  await db.collection('activities').doc(id).set({
    id,
    userId: data.userId,
    category: data.category,
    subcategory: data.subcategory || null,
    label: data.label || null,
    carbonKg: data.carbonKg,
    quantity: data.quantity || null,
    unit: data.unit || null,
    inputMethod: data.inputMethod || "tap",
    voiceTranscript: data.voiceTranscript || null,
    notes: data.notes || null,
    loggedAt: data.loggedAt || now,
    createdAt: now,
  });
  
  // Update user's total carbon
  const userRef = db.collection('users').doc(data.userId);
  await db.runTransaction(async (t) => {
    const doc = await t.get(userRef);
    if (doc.exists) {
      const current = doc.data()?.totalCarbonKg || 0;
      t.update(userRef, { totalCarbonKg: current + data.carbonKg, updatedAt: now });
    }
  });
  
  return { insertId: id };
}

export async function getUserActivities(userId: string, limit = 50) {
  const snapshot = await db.collection('activities').where('userId', '==', userId).orderBy('loggedAt', 'desc').limit(limit).get();
  return snapshot.docs.map(doc => {
    const data = doc.data() as any;
    return { ...data, loggedAt: data.loggedAt?.toDate(), createdAt: data.createdAt?.toDate() } as Activity;
  });
}

export async function getUserActivitiesByDateRange(userId: string, from: Date, to: Date) {
  const snapshot = await db.collection('activities')
    .where('userId', '==', userId)
    .where('loggedAt', '>=', from)
    .where('loggedAt', '<', to)
    .orderBy('loggedAt', 'desc')
    .get();
  return snapshot.docs.map(doc => {
    const data = doc.data() as any;
    return { ...data, loggedAt: data.loggedAt?.toDate(), createdAt: data.createdAt?.toDate() } as Activity;
  });
}

export async function getUserCarbonSummary(userId: string) {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const [weekActs, monthActs, allActs] = await Promise.all([
    getUserActivitiesByDateRange(userId, weekAgo, now),
    getUserActivitiesByDateRange(userId, monthAgo, now),
    getUserActivities(userId, 500)
  ]);
  
  const sumCarbon = (acts: any[]) => acts.reduce((s, a) => s + (Number(a.carbonKg) ?? 0), 0);
  const byCategory = (acts: any[]) => { 
    const cats: Record<string, number> = {}; 
    acts.forEach(a => { cats[a.category] = (cats[a.category] ?? 0) + (Number(a.carbonKg) ?? 0); }); 
    return cats; 
  };
  
  return { 
    weeklyKg: +sumCarbon(weekActs).toFixed(2), 
    monthlyKg: +sumCarbon(monthActs).toFixed(2), 
    totalKg: +sumCarbon(allActs).toFixed(2), 
    weeklyByCategory: byCategory(weekActs), 
    monthlyByCategory: byCategory(monthActs), 
    recentActivities: allActs.slice(0, 10) 
  };
}

export async function getUserChallenges(userId: string, weekNumber?: number, year?: number) {
  let query: any = db.collection('challenges').where('userId', '==', userId);
  if (weekNumber !== undefined) query = query.where('weekNumber', '==', weekNumber);
  if (year !== undefined) query = query.where('year', '==', year);
  
  const snapshot = await query.orderBy('createdAt', 'desc').get();
  return snapshot.docs.map((doc: any) => {
    const data = doc.data() as any;
    return { ...data, completedAt: data.completedAt?.toDate(), createdAt: data.createdAt?.toDate() } as Challenge;
  });
}

export async function createChallenge(data: Omit<Challenge, 'id' | 'createdAt'>) {
  const id = generateId();
  await db.collection('challenges').doc(id).set({
    id,
    ...data,
    createdAt: new Date(),
  });
}

export async function completeChallenge(challengeId: string, userId: string) {
  const ref = db.collection('challenges').doc(challengeId);
  const userRef = db.collection('users').doc(userId);
  let challengeData: any;
  
  await db.runTransaction(async (t) => {
    const doc = await t.get(ref);
    if (!doc.exists) throw new Error("Challenge not found");
    challengeData = doc.data();
    if (challengeData.userId !== userId) throw new Error("Unauthorized");
    if (challengeData.status !== "active") throw new Error("Challenge already completed");
    
    t.update(ref, { status: "completed", completedAt: new Date() });
    
    const uDoc = await t.get(userRef);
    if (uDoc.exists) {
      const uData = uDoc.data()!;
      t.update(userRef, { 
        eloScore: (uData.eloScore || 1000) + (challengeData.pointsReward || 50),
        currentStreak: (uData.currentStreak || 0) + 1,
        updatedAt: new Date()
      });
    }
  });
  
  return challengeData;
}

export async function saveStory(data: Omit<Story, 'id' | 'generatedAt' | 'shareCount'>) {
  const id = generateId();
  await db.collection('stories').doc(id).set({
    id,
    ...data,
    shareCount: 0,
    generatedAt: new Date(),
  });
}

export async function getUserStories(userId: string, limit = 10) {
  const snapshot = await db.collection('stories').where('userId', '==', userId).orderBy('generatedAt', 'desc').limit(limit).get();
  return snapshot.docs.map(doc => {
    const data = doc.data() as any;
    return { ...data, generatedAt: data.generatedAt?.toDate() } as Story;
  });
}

export async function incrementStoryShares(storyId: string) {
  const ref = db.collection('stories').doc(storyId);
  await db.runTransaction(async (t) => {
    const doc = await t.get(ref);
    if (doc.exists) {
      t.update(ref, { shareCount: (doc.data()?.shareCount || 0) + 1 });
    }
  });
}

export async function createCollective(name: string, description: string | undefined, creatorId: string, inviteCode: string) {
  const id = generateId();
  const now = new Date();
  
  const colRef = db.collection('collectives').doc(id);
  const memRef = db.collection('collective_members').doc(generateId());
  
  const batch = db.batch();
  
  const colData = {
    id,
    name,
    description: description || null,
    creatorId,
    inviteCode,
    totalCarbonKg: 0,
    memberCount: 1,
    isPublic: true,
    createdAt: now,
    updatedAt: now,
  };
  
  batch.set(colRef, colData);
  batch.set(memRef, {
    id: memRef.id,
    collectiveId: id,
    userId: creatorId,
    contributionKg: 0,
    role: "admin",
    joinedAt: now,
  });
  
  await batch.commit();
  return colData;
}

export async function getCollectiveByInviteCode(code: string): Promise<Collective | null> {
  const snapshot = await db.collection('collectives').where('inviteCode', '==', code).limit(1).get();
  if (snapshot.empty) return null;
  const data = snapshot.docs[0].data() as any;
  return { ...data, createdAt: data.createdAt?.toDate(), updatedAt: data.updatedAt?.toDate() } as Collective;
}

export async function getCollectiveById(id: string): Promise<Collective | null> {
  const doc = await db.collection('collectives').doc(id).get();
  if (!doc.exists) return null;
  const data = doc.data() as any;
  return { ...data, createdAt: data.createdAt?.toDate(), updatedAt: data.updatedAt?.toDate() } as Collective;
}

export async function getUserCollectives(userId: string) {
  const snapshot = await db.collection('collective_members').where('userId', '==', userId).get();
  if (snapshot.empty) return [];
  const collectiveIds = snapshot.docs.map(doc => doc.data().collectiveId);
  
  // Note: Firestore limits 'in' queries to 30 items
  const chunks = [];
  for (let i = 0; i < collectiveIds.length; i += 30) {
    chunks.push(collectiveIds.slice(i, i + 30));
  }
  
  let collectives: any[] = [];
  for (const chunk of chunks) {
    const colSnap = await db.collection('collectives').where('id', 'in', chunk).get();
    collectives.push(...colSnap.docs.map(d => {
      const data = d.data() as any;
      return { ...data, createdAt: data.createdAt?.toDate(), updatedAt: data.updatedAt?.toDate() } as Collective;
    }));
  }
  
  return collectives;
}

export async function getCollectiveMembers(collectiveId: string) {
  const snapshot = await db.collection('collective_members').where('collectiveId', '==', collectiveId).get();
  const members = snapshot.docs.map(doc => doc.data() as CollectiveMember);
  
  const result = [];
  for (const m of members) {
    const u = await getUserById(m.userId);
    if (u) result.push({ ...m, joinedAt: (m.joinedAt as any)?.toDate ? (m.joinedAt as any).toDate() : m.joinedAt, user: { id: u.id, name: u.name, archetype: u.archetype, eloScore: u.eloScore } });
  }
  return result;
}

export async function joinCollective(collectiveId: string, userId: string) {
  const existing = await db.collection('collective_members')
    .where('collectiveId', '==', collectiveId)
    .where('userId', '==', userId)
    .limit(1).get();
    
  if (!existing.empty) return;
  
  const id = generateId();
  const now = new Date();
  
  const batch = db.batch();
  batch.set(db.collection('collective_members').doc(id), {
    id,
    collectiveId,
    userId,
    contributionKg: 0,
    role: "member",
    joinedAt: now,
  });
  
  const colRef = db.collection('collectives').doc(collectiveId);
  batch.update(colRef, {
    memberCount: require('firebase-admin/firestore').FieldValue.increment(1),
    updatedAt: now
  });
  
  await batch.commit();
}

export async function getOrCreateActiveSeason(): Promise<LeaderboardSeason> {
  const snapshot = await db.collection('leaderboard_seasons').where('isActive', '==', true).limit(1).get();
  if (!snapshot.empty) {
    const data = snapshot.docs[0].data() as any;
    return { ...data, startDate: data.startDate?.toDate(), endDate: data.endDate?.toDate(), createdAt: data.createdAt?.toDate() } as LeaderboardSeason;
  }
  
  const now = new Date();
  const weekNumber = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const id = generateId();
  const seasonData = {
    id,
    seasonNumber: 1,
    year: now.getFullYear(),
    weekNumber,
    startDate: now,
    endDate,
    isActive: true,
    createdAt: now,
  };
  
  await db.collection('leaderboard_seasons').doc(id).set(seasonData);
  return seasonData as LeaderboardSeason;
}

export async function getLeaderboard(seasonId: string, limit = 50) {
  const snapshot = await db.collection('leaderboard_entries').where('seasonId', '==', seasonId).orderBy('eloScore', 'desc').limit(limit).get();
  
  const result = [];
  for (const doc of snapshot.docs) {
    const e = doc.data() as LeaderboardEntry;
    const u = await getUserById(e.userId);
    if (u) result.push({ ...e, updatedAt: (e.updatedAt as any)?.toDate ? (e.updatedAt as any).toDate() : e.updatedAt, user: { id: u.id, name: u.name, archetype: u.archetype, archetypeLabel: u.archetypeLabel } });
  }
  return result;
}

export async function upsertLeaderboardEntry(seasonId: string, userId: string, data: Partial<Omit<LeaderboardEntry, 'id'|'seasonId'|'userId'>>) {
  const snapshot = await db.collection('leaderboard_entries').where('seasonId', '==', seasonId).where('userId', '==', userId).limit(1).get();
  const now = new Date();
  
  if (!snapshot.empty) {
    await db.collection('leaderboard_entries').doc(snapshot.docs[0].id).update({ ...data, updatedAt: now });
  } else {
    const id = generateId();
    await db.collection('leaderboard_entries').doc(id).set({
      id,
      seasonId,
      userId,
      eloScore: 1000,
      carbonSavedKg: 0,
      activitiesLogged: 0,
      challengesCompleted: 0,
      influenceScore: 0,
      ...data,
      updatedAt: now
    });
  }
}

export async function createFeedItem(data: Omit<FeedItem, 'id'|'createdAt'|'likeCount'>) {
  const id = generateId();
  await db.collection('feed_items').doc(id).set({
    id,
    ...data,
    likeCount: 0,
    createdAt: new Date(),
  });
}

export async function getCommunityFeed(limit = 30) {
  const snapshot = await db.collection('feed_items').orderBy('createdAt', 'desc').limit(limit).get();
  
  const result = [];
  for (const doc of snapshot.docs) {
    const item = doc.data() as FeedItem;
    const u = await getUserById(item.userId);
    if (u) result.push({ ...item, createdAt: (item.createdAt as any)?.toDate(), user: { id: u.id, name: u.name, archetype: u.archetype, influenceScore: u.influenceScore } });
  }
  return result;
}

export async function likeFeedItem(feedItemId: string) {
  const ref = db.collection('feed_items').doc(feedItemId);
  await db.runTransaction(async (t) => {
    const doc = await t.get(ref);
    if (doc.exists) {
      t.update(ref, { likeCount: (doc.data()?.likeCount || 0) + 1 });
    }
  });
}

export async function getTopInfluencers(limit = 10) {
  const snapshot = await db.collection('users').orderBy('influenceScore', 'desc').limit(limit).get();
  return snapshot.docs.map(doc => {
    const u = doc.data() as any;
    return {
      id: u.id,
      name: u.name,
      archetype: u.archetype,
      archetypeLabel: u.archetypeLabel || "Urban Commuter",
      influenceScore: u.influenceScore,
      totalCarbonKg: u.totalCarbonKg,
      currentStreak: u.currentStreak,
      eloScore: u.eloScore,
    };
  });
}

export async function updateUserInfluenceScore(userId: string, score: number) {
  await db.collection('users').doc(userId).update({ influenceScore: score, updatedAt: new Date() });
}

export async function getUserLiveStats(userId: string) {
  const actsSnap = await db.collection('activities').where('userId', '==', userId).get();
  const chalsSnap = await db.collection('challenges').where('userId', '==', userId).where('status', '==', 'completed').get();
  const follsSnap = await db.collection('influence_edges').where('targetUserId', '==', userId).get();
  
  return {
    activityCount: actsSnap.size,
    completedChallenges: chalsSnap.size,
    followersCount: follsSnap.size,
  };
}

export async function savePeerSnapshot(data: Omit<PeerSnapshot, 'id'|'snapshotDate'>) {
  const id = generateId();
  await db.collection('peer_snapshots').doc(id).set({
    id,
    ...data,
    snapshotDate: new Date(),
  });
}

export async function getLatestPeerSnapshot(userId: string) {
  const snapshot = await db.collection('peer_snapshots').where('userId', '==', userId).orderBy('snapshotDate', 'desc').limit(1).get();
  if (snapshot.empty) return null;
  const data = snapshot.docs[0].data() as any;
  return { ...data, snapshotDate: data.snapshotDate?.toDate() } as PeerSnapshot;
}

export async function getArchetypePeers(archetype: string, excludeUserId: string) {
  const snapshot = await db.collection('users').where('archetype', '==', archetype).limit(101).get();
  return snapshot.docs
    .filter(doc => doc.id !== excludeUserId)
    .slice(0, 100)
    .map(doc => {
      const u = doc.data() as any;
      return { id: u.id, totalCarbonKg: u.totalCarbonKg, archetype: u.archetype };
    });
}

export async function getPublicCollectives(limit = 20) {
  const snapshot = await db.collection('collectives').where('isPublic', '==', true).orderBy('totalCarbonKg', 'desc').limit(limit).get();
  return snapshot.docs.map(doc => {
    const data = doc.data() as any;
    return { ...data, createdAt: data.createdAt?.toDate(), updatedAt: data.updatedAt?.toDate() } as Collective;
  });
}
