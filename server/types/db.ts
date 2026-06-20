export type JsonRecord = Record<string, unknown>;

export type StoryEquivalents = {
  trees: number;
  km_not_driven: number;
  flights_avoided: number;
  phone_charges: number;
  meals_saved: number;
  lightbulb_hours: number;
};

export interface User {
  id: string;
  openId: string;
  name: string | null;
  email: string | null;
  loginMethod: string | null;
  role: "user" | "admin";
  archetype: string | null;
  archetypeLabel: string | null;
  onboardingCompleted: boolean;
  onboardingAnswers?: Record<string, string>;
  roadmap?: {
    phases: Array<{
      phase: number;
      title: string;
      actions: Array<{ action: string; carbonSavingKg: number }>;
    }>;
  };
  totalCarbonKg: number;
  weeklyBudgetKg: number;
  eloScore: number;
  influenceScore: number;
  currentStreak: number;
  longestStreak: number;
  preferredLanguage: string;
  createdAt: Date;
  updatedAt: Date;
  lastSignedIn: Date;
}

export type InsertUser = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>> & { openId: string };

export interface Activity {
  id: string;
  userId: string;
  category: "transport" | "meals" | "energy" | "shopping" | "other";
  subcategory: string;
  label: string;
  carbonKg: number;
  quantity?: number | null;
  unit?: string | null;
  inputMethod: "tap" | "voice" | "manual";
  voiceTranscript?: string | null;
  notes?: string | null;
  loggedAt: Date;
  createdAt: Date;
}

export type InsertActivity = Omit<Activity, 'id' | 'createdAt'>;

export interface Challenge {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: "transport" | "meals" | "energy" | "shopping" | "lifestyle";
  difficulty: "easy" | "medium" | "hard";
  carbonSavingKg: number;
  pointsReward: number;
  weekNumber: number;
  year: number;
  status: "active" | "completed" | "skipped" | "expired";
  completedAt?: Date | null;
  aiProvider?: string | null;
  trendingTopic?: string | null;
  createdAt: Date;
}

export interface Story {
  id: string;
  userId: string;
  narrative: string;
  headline: string;
  carbonSavedKg: number;
  equivalents?: StoryEquivalents;
  period: "week" | "month" | "alltime";
  shareCount: number;
  aiProvider?: string | null;
  generatedAt: Date;
}

export interface Collective {
  id: string;
  name: string;
  description?: string | null;
  creatorId: string;
  inviteCode: string;
  totalCarbonKg: number;
  memberCount: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectiveMember {
  id: string;
  collectiveId: string;
  userId: string;
  contributionKg: number;
  role: "admin" | "member";
  joinedAt: Date;
}

export interface LeaderboardSeason {
  id: string;
  seasonNumber: number;
  year: number;
  weekNumber: number;
  name?: string | null;
  startDate: Date;
  endDate: Date;
  endsAt?: Date;
  isActive: boolean;
  createdAt: Date;
}

export interface LeaderboardEntry {
  id: string;
  seasonId: string;
  userId: string;
  rank?: number | null;
  eloScore: number;
  carbonSavedKg: number;
  activitiesLogged: number;
  challengesCompleted: number;
  influenceScore: number;
  rivalUserId?: string | null;
  streakDays?: number;
  updatedAt: Date;
}

export interface InfluenceEdge {
  id: string;
  sourceUserId: string;
  targetUserId: string;
  weight: number;
  createdAt: Date;
}

export interface FeedItem {
  id: string;
  userId: string;
  type: "activity" | "challenge_complete" | "story" | "milestone" | "collective_join";
  title: string;
  body?: string | null;
  carbonKg?: number | null;
  isInfluencer: boolean;
  amplified: boolean;
  likeCount: number;
  metadata?: JsonRecord;
  createdAt: Date;
}

export interface PeerSnapshot {
  id: string;
  userId: string;
  archetype: string;
  userCarbonKg: number;
  peerAvgKg: number;
  percentileRank: number;
  categoryBreakdown?: Record<string, number>;
  peerCategoryBreakdown?: Record<string, number>;
  snapshotDate: Date;
}

export interface AgentNegotiation {
  id: string;
  initiatorId: string;
  targetId: string;
  category: string;
  proposedKg: string;
  agreedKg?: string | null;
  status: "pending" | "agreed" | "rejected";
  turns: string;
  createdAt: Date;
}
