import { and, count, desc, eq, gte, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  activities, challenges, collectiveMembers, collectives,
  feedItems, influenceEdges, InsertActivity, InsertUser,
  leaderboardEntries, leaderboardSeasons, peerSnapshots, stories, users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field]; if (value === undefined) return;
      const normalized = value ?? null; values[field] = normalized; updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb(); if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: Partial<InsertUser>) {
  const db = await getDb(); if (!db) return;
  await db.update(users).set(data as any).where(eq(users.id, userId));
}

export async function getAllUsersForLeaderboard() {
  const db = await getDb(); if (!db) return [];
  return db.select({ id: users.id, name: users.name, archetype: users.archetype, archetypeLabel: users.archetypeLabel, eloScore: users.eloScore, influenceScore: users.influenceScore, totalCarbonKg: users.totalCarbonKg, currentStreak: users.currentStreak }).from(users).orderBy(desc(users.eloScore)).limit(100);
}

export async function logActivity(data: InsertActivity) {
  const db = await getDb(); if (!db) throw new Error("Database not available");
  const [result] = await db.insert(activities).values(data);
  await db.update(users).set({ totalCarbonKg: sql`totalCarbonKg + ${data.carbonKg}` }).where(eq(users.id, data.userId));
  return result;
}

export async function getUserActivities(userId: number, limit = 50) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(activities).where(eq(activities.userId, userId)).orderBy(desc(activities.loggedAt)).limit(limit);
}

export async function getUserActivitiesByDateRange(userId: number, from: Date, to: Date) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(activities).where(and(eq(activities.userId, userId), gte(activities.loggedAt, from), lt(activities.loggedAt, to))).orderBy(desc(activities.loggedAt));
}

export async function getUserCarbonSummary(userId: number) {
  const db = await getDb(); if (!db) return null;
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const [weekActs, monthActs, allActs] = await Promise.all([getUserActivitiesByDateRange(userId, weekAgo, now), getUserActivitiesByDateRange(userId, monthAgo, now), getUserActivities(userId, 500)]);
  const sumCarbon = (acts: typeof allActs) => acts.reduce((s, a) => s + (a.carbonKg ?? 0), 0);
  const byCategory = (acts: typeof allActs) => { const cats: Record<string, number> = {}; acts.forEach(a => { cats[a.category] = (cats[a.category] ?? 0) + (a.carbonKg ?? 0); }); return cats; };
  return { weeklyKg: +sumCarbon(weekActs).toFixed(2), monthlyKg: +sumCarbon(monthActs).toFixed(2), totalKg: +sumCarbon(allActs).toFixed(2), weeklyByCategory: byCategory(weekActs), monthlyByCategory: byCategory(monthActs), recentActivities: allActs.slice(0, 10) };
}

export async function getUserChallenges(userId: number, weekNumber?: number, year?: number) {
  const db = await getDb(); if (!db) return [];
  const conditions: any[] = [eq(challenges.userId, userId)];
  if (weekNumber !== undefined) conditions.push(eq(challenges.weekNumber, weekNumber));
  if (year !== undefined) conditions.push(eq(challenges.year, year));
  return db.select().from(challenges).where(and(...conditions)).orderBy(desc(challenges.createdAt));
}

export async function createChallenge(data: typeof challenges.$inferInsert) {
  const db = await getDb(); if (!db) throw new Error("Database not available");
  await db.insert(challenges).values(data);
}

export async function completeChallenge(challengeId: number, userId: number) {
  const db = await getDb(); if (!db) throw new Error("Database not available");
  const [challenge] = await db.select().from(challenges).where(and(eq(challenges.id, challengeId), eq(challenges.userId, userId))).limit(1);
  if (!challenge) throw new Error("Challenge not found");
  // Idempotency guard: only award points once
  if (challenge.status !== "active") throw new Error("Challenge already completed");
  await db.update(challenges).set({ status: "completed", completedAt: new Date() }).where(and(eq(challenges.id, challengeId), eq(challenges.status, "active")));
  await db.update(users).set({ eloScore: sql`eloScore + ${challenge.pointsReward}`, currentStreak: sql`currentStreak + 1` }).where(eq(users.id, userId));
  return challenge;
}

export async function saveStory(data: typeof stories.$inferInsert) {
  const db = await getDb(); if (!db) throw new Error("Database not available");
  await db.insert(stories).values(data);
}

export async function getUserStories(userId: number, limit = 10) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(stories).where(eq(stories.userId, userId)).orderBy(desc(stories.generatedAt)).limit(limit);
}

export async function incrementStoryShares(storyId: number) {
  const db = await getDb(); if (!db) return;
  await db.update(stories).set({ shareCount: sql`shareCount + 1` }).where(eq(stories.id, storyId));
}

export async function createCollective(name: string, description: string | undefined, creatorId: number, inviteCode: string) {
  const db = await getDb(); if (!db) throw new Error("Database not available");
  await db.insert(collectives).values({ name, description, creatorId, inviteCode });
  const [created] = await db.select().from(collectives).where(eq(collectives.inviteCode, inviteCode)).limit(1);
  if (created) await db.insert(collectiveMembers).values({ collectiveId: created.id, userId: creatorId, role: "admin" });
  return created;
}

export async function getCollectiveByInviteCode(code: string) {
  const db = await getDb(); if (!db) return null;
  const result = await db.select().from(collectives).where(eq(collectives.inviteCode, code)).limit(1);
  return result[0] ?? null;
}

export async function getCollectiveById(id: number) {
  const db = await getDb(); if (!db) return null;
  const result = await db.select().from(collectives).where(eq(collectives.id, id)).limit(1);
  return result[0] ?? null;
}

export async function getUserCollectives(userId: number) {
  const db = await getDb(); if (!db) return [];
  const memberships = await db.select().from(collectiveMembers).where(eq(collectiveMembers.userId, userId));
  if (memberships.length === 0) return [];
  const results = [];
  for (const m of memberships) { const c = await getCollectiveById(m.collectiveId); if (c) results.push(c); }
  return results;
}

export async function getCollectiveMembers(collectiveId: number) {
  const db = await getDb(); if (!db) return [];
  const members = await db.select().from(collectiveMembers).where(eq(collectiveMembers.collectiveId, collectiveId));
  const result = [];
  for (const m of members) { const u = await getUserById(m.userId); if (u) result.push({ ...m, user: { id: u.id, name: u.name, archetype: u.archetype, eloScore: u.eloScore } }); }
  return result;
}

export async function joinCollective(collectiveId: number, userId: number) {
  const db = await getDb(); if (!db) throw new Error("Database not available");
  // Idempotency guard: skip if already a member to prevent duplicate rows and inflated counts
  const existing = await db.select({ id: collectiveMembers.id }).from(collectiveMembers)
    .where(and(eq(collectiveMembers.collectiveId, collectiveId), eq(collectiveMembers.userId, userId)))
    .limit(1);
  if (existing.length > 0) return; // already a member — no-op
  await db.insert(collectiveMembers).values({ collectiveId, userId, role: "member" });
  await db.update(collectives).set({ memberCount: sql`memberCount + 1` }).where(eq(collectives.id, collectiveId));
}

export async function getOrCreateActiveSeason() {
  const db = await getDb(); if (!db) return null;
  const active = await db.select().from(leaderboardSeasons).where(eq(leaderboardSeasons.isActive, true)).limit(1);
  if (active.length > 0) return active[0];
  const now = new Date();
  const weekNumber = Math.ceil((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
  const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  await db.insert(leaderboardSeasons).values({ seasonNumber: 1, year: now.getFullYear(), weekNumber, startDate: now, endDate, isActive: true });
  const created = await db.select().from(leaderboardSeasons).where(eq(leaderboardSeasons.isActive, true)).limit(1);
  return created[0] ?? null;
}

export async function getLeaderboard(seasonId: number, limit = 50) {
  const db = await getDb(); if (!db) return [];
  const entries = await db.select().from(leaderboardEntries).where(eq(leaderboardEntries.seasonId, seasonId)).orderBy(desc(leaderboardEntries.eloScore)).limit(limit);
  const result = [];
  for (const e of entries) { const u = await getUserById(e.userId); if (u) result.push({ ...e, user: { id: u.id, name: u.name, archetype: u.archetype, archetypeLabel: u.archetypeLabel } }); }
  return result;
}

export async function upsertLeaderboardEntry(seasonId: number, userId: number, data: Partial<typeof leaderboardEntries.$inferInsert>) {
  const db = await getDb(); if (!db) return;
  const existing = await db.select().from(leaderboardEntries).where(and(eq(leaderboardEntries.seasonId, seasonId), eq(leaderboardEntries.userId, userId))).limit(1);
  if (existing.length > 0) { await db.update(leaderboardEntries).set(data as any).where(eq(leaderboardEntries.id, existing[0].id)); }
  else { await db.insert(leaderboardEntries).values({ seasonId, userId, eloScore: 1000, ...data } as any); }
}

export async function createFeedItem(data: typeof feedItems.$inferInsert) {
  const db = await getDb(); if (!db) return;
  await db.insert(feedItems).values(data);
}

export async function getCommunityFeed(limit = 30) {
  const db = await getDb(); if (!db) return [];
  const items = await db.select().from(feedItems).orderBy(desc(feedItems.createdAt)).limit(limit);
  const result = [];
  for (const item of items) { const u = await getUserById(item.userId); if (u) result.push({ ...item, user: { id: u.id, name: u.name, archetype: u.archetype, influenceScore: u.influenceScore } }); }
  return result;
}

export async function likeFeedItem(feedItemId: number) {
  const db = await getDb(); if (!db) return;
  await db.update(feedItems).set({ likeCount: sql`likeCount + 1` }).where(eq(feedItems.id, feedItemId));
}

export async function getTopInfluencers(limit = 10) {
  const db = await getDb(); if (!db) return [];
  return db.select({ id: users.id, name: users.name, archetype: users.archetype, archetypeLabel: users.archetypeLabel, influenceScore: users.influenceScore, totalCarbonKg: users.totalCarbonKg, currentStreak: users.currentStreak, eloScore: users.eloScore }).from(users).orderBy(desc(users.influenceScore)).limit(limit);
}

export async function updateUserInfluenceScore(userId: number, score: number) {
  const db = await getDb(); if (!db) return;
  await db.update(users).set({ influenceScore: score }).where(eq(users.id, userId));
}

/** Returns live counters needed for influence score calculation. */
export async function getUserLiveStats(userId: number) {
  const db = await getDb();
  if (!db) return { activityCount: 0, completedChallenges: 0, followersCount: 0 };
  const [[actRow], [chalRow], [follRow]] = await Promise.all([
    db.select({ n: count() }).from(activities).where(eq(activities.userId, userId)),
    db.select({ n: count() }).from(challenges).where(and(eq(challenges.userId, userId), eq(challenges.status, "completed"))),
    db.select({ n: count() }).from(influenceEdges).where(eq(influenceEdges.targetUserId, userId)),
  ]);
  return {
    activityCount: actRow?.n ?? 0,
    completedChallenges: chalRow?.n ?? 0,
    followersCount: follRow?.n ?? 0,
  };
}

export async function savePeerSnapshot(data: typeof peerSnapshots.$inferInsert) {
  const db = await getDb(); if (!db) return;
  await db.insert(peerSnapshots).values(data);
}

export async function getLatestPeerSnapshot(userId: number) {
  const db = await getDb(); if (!db) return null;
  const result = await db.select().from(peerSnapshots).where(eq(peerSnapshots.userId, userId)).orderBy(desc(peerSnapshots.snapshotDate)).limit(1);
  return result[0] ?? null;
}

export async function getArchetypePeers(archetype: string, excludeUserId: number) {
  const db = await getDb(); if (!db) return [];
  return db.select({ id: users.id, totalCarbonKg: users.totalCarbonKg, archetype: users.archetype }).from(users).where(and(eq(users.archetype, archetype as any), sql`${users.id} != ${excludeUserId}`)).limit(100);
}

export async function getPublicCollectives(limit = 20) {
  const db = await getDb(); if (!db) return [];
  return db.select().from(collectives).where(eq(collectives.isPublic, true)).orderBy(desc(collectives.totalCarbonKg)).limit(limit);
}
