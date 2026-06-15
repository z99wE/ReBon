import {
  boolean,
  float,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  archetype: mysqlEnum("archetype", ["urban_commuter","conscious_consumer","energy_heavy","eco_pioneer","suburban_family","digital_nomad"]),
  archetypeLabel: varchar("archetypeLabel", { length: 64 }),
  onboardingCompleted: boolean("onboardingCompleted").default(false).notNull(),
  onboardingAnswers: json("onboardingAnswers"),
  roadmap: json("roadmap"),
  totalCarbonKg: float("totalCarbonKg").default(0).notNull(),
  weeklyBudgetKg: float("weeklyBudgetKg").default(70).notNull(),
  eloScore: int("eloScore").default(1000).notNull(),
  influenceScore: float("influenceScore").default(0).notNull(),
  currentStreak: int("currentStreak").default(0).notNull(),
  longestStreak: int("longestStreak").default(0).notNull(),
  preferredLanguage: varchar("preferredLanguage", { length: 10 }).default("en"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

// ─── Carbon Activities ────────────────────────────────────────────────────────
export const activities = mysqlTable(
  "activities",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    category: mysqlEnum("category", ["transport", "meals", "energy", "shopping", "other"]).notNull(),
    subcategory: varchar("subcategory", { length: 64 }).notNull(),
    label: varchar("label", { length: 128 }).notNull(),
    carbonKg: float("carbonKg").notNull(),
    quantity: float("quantity").default(1),
    unit: varchar("unit", { length: 32 }),
    inputMethod: mysqlEnum("inputMethod", ["tap", "voice", "manual"]).default("tap").notNull(),
    voiceTranscript: text("voiceTranscript"),
    notes: text("notes"),
    loggedAt: timestamp("loggedAt").defaultNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    idxUserId: index("idx_activity_user_id").on(table.userId),
    idxCreatedAt: index("idx_activity_created_at").on(table.createdAt),
    idxUserCreated: index("idx_user_created").on(table.userId, table.createdAt),
  })
);

// ─── AI Challenges ────────────────────────────────────────────────────────────
export const challenges = mysqlTable(
  "challenges",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    title: varchar("title", { length: 256 }).notNull(),
    description: text("description").notNull(),
    category: mysqlEnum("category", ["transport", "meals", "energy", "shopping", "lifestyle"]).notNull(),
    difficulty: mysqlEnum("difficulty", ["easy", "medium", "hard"]).default("medium").notNull(),
    carbonSavingKg: float("carbonSavingKg").notNull(),
    pointsReward: int("pointsReward").default(100).notNull(),
    weekNumber: int("weekNumber").notNull(),
    year: int("year").notNull(),
    status: mysqlEnum("status", ["active", "completed", "skipped", "expired"]).default("active").notNull(),
    completedAt: timestamp("completedAt"),
    aiProvider: varchar("aiProvider", { length: 32 }),
    trendingTopic: varchar("trendingTopic", { length: 128 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    idxUserId: index("idx_challenge_user_id").on(table.userId),
    idxWeekYear: index("idx_week_year").on(table.weekNumber, table.year),
    idxStatus: index("idx_status").on(table.status),
  })
);

// ─── Carbon Stories (NLG) ─────────────────────────────────────────────────────
export const stories = mysqlTable("stories", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  narrative: text("narrative").notNull(),
  headline: varchar("headline", { length: 256 }).notNull(),
  carbonSavedKg: float("carbonSavedKg").notNull(),
  equivalents: json("equivalents"),
  period: mysqlEnum("period", ["week","month","alltime"]).default("week").notNull(),
  shareCount: int("shareCount").default(0).notNull(),
  aiProvider: varchar("aiProvider", { length: 32 }),
  generatedAt: timestamp("generatedAt").defaultNow().notNull(),
});

// ─── Collectives (Groups/Tribes) ──────────────────────────────────────────────
export const collectives = mysqlTable("collectives", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  creatorId: int("creatorId").notNull(),
  inviteCode: varchar("inviteCode", { length: 16 }).notNull().unique(),
  totalCarbonKg: float("totalCarbonKg").default(0).notNull(),
  memberCount: int("memberCount").default(1).notNull(),
  isPublic: boolean("isPublic").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

// ─── Collective Members ───────────────────────────────────────────────────────
export const collectiveMembers = mysqlTable(
  "collective_members",
  {
    id: int("id").autoincrement().primaryKey(),
    collectiveId: int("collectiveId").notNull(),
    userId: int("userId").notNull(),
    contributionKg: float("contributionKg").default(0).notNull(),
    role: mysqlEnum("role", ["admin", "member"]).default("member").notNull(),
    joinedAt: timestamp("joinedAt").defaultNow().notNull(),
  },
  (table) => ({
    uniqueCollectiveMember: unique().on(table.collectiveId, table.userId),
    idxCollectiveId: index("idx_collective_id").on(table.collectiveId),
    idxUserId: index("idx_user_id").on(table.userId),
  })
);

// ─── Leaderboard Seasons ──────────────────────────────────────────────────────
export const leaderboardSeasons = mysqlTable("leaderboard_seasons", {
  id: int("id").autoincrement().primaryKey(),
  seasonNumber: int("seasonNumber").notNull(),
  year: int("year").notNull(),
  weekNumber: int("weekNumber").notNull(),
  startDate: timestamp("startDate").notNull(),
  endDate: timestamp("endDate").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Leaderboard Entries ──────────────────────────────────────────────────────
export const leaderboardEntries = mysqlTable(
  "leaderboard_entries",
  {
    id: int("id").autoincrement().primaryKey(),
    seasonId: int("seasonId").notNull(),
    userId: int("userId").notNull(),
    rank: int("rank"),
    eloScore: int("eloScore").default(1000).notNull(),
    carbonSavedKg: float("carbonSavedKg").default(0).notNull(),
    activitiesLogged: int("activitiesLogged").default(0).notNull(),
    challengesCompleted: int("challengesCompleted").default(0).notNull(),
    influenceScore: float("influenceScore").default(0).notNull(),
    rivalUserId: int("rivalUserId"),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    uniqueSeasonUser: unique().on(table.seasonId, table.userId),
    idxSeasonId: index("idx_season_id").on(table.seasonId),
    idxRank: index("idx_rank").on(table.rank),
  })
);

// ─── Influence Edges ──────────────────────────────────────────────────────────
export const influenceEdges = mysqlTable("influence_edges", {
  id: int("id").autoincrement().primaryKey(),
  sourceUserId: int("sourceUserId").notNull(),
  targetUserId: int("targetUserId").notNull(),
  weight: float("weight").default(1.0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Community Feed ───────────────────────────────────────────────────────────
export const feedItems = mysqlTable(
  "feed_items",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    type: mysqlEnum("type", ["activity", "challenge_complete", "story", "milestone", "collective_join"]).notNull(),
    title: varchar("title", { length: 256 }).notNull(),
    body: text("body"),
    carbonKg: float("carbonKg"),
    isInfluencer: boolean("isInfluencer").default(false).notNull(),
    amplified: boolean("amplified").default(false).notNull(),
    likeCount: int("likeCount").default(0).notNull(),
    metadata: json("metadata"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    idxCreatedAt: index("idx_feed_created_at").on(table.createdAt),
    idxUserId: index("idx_feed_user_id").on(table.userId),
  })
);

// ─── Peer Comparison Snapshots ────────────────────────────────────────────────
export const peerSnapshots = mysqlTable(
  "peer_snapshots",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    archetype: varchar("archetype", { length: 64 }).notNull(),
    userCarbonKg: float("userCarbonKg").notNull(),
    peerAvgKg: float("peerAvgKg").notNull(),
    percentileRank: float("percentileRank").notNull(),
    categoryBreakdown: json("categoryBreakdown"),
    peerCategoryBreakdown: json("peerCategoryBreakdown"),
    snapshotDate: timestamp("snapshotDate").defaultNow().notNull(),
  },
  (table) => ({
    idxUserId: index("idx_snapshot_user_id").on(table.userId),
    idxSnapshotDate: index("idx_snapshot_date").on(table.snapshotDate),
  })
);

// ─── OTP Auth Sessions ────────────────────────────────────────────────────────
export const otpSessions = mysqlTable("otp_sessions", {
  id: int("id").autoincrement().primaryKey(),
  identifier: varchar("identifier", { length: 320 }).notNull(), // email or phone
  identifierType: mysqlEnum("identifierType", ["email", "phone"]).notNull(),
  otpHash: varchar("otpHash", { length: 128 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  attempts: int("attempts").default(0).notNull(),
  verified: boolean("verified").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

// ─── Agent-to-Agent Negotiations ────────────────────────────────────────────
export const agentNegotiations = mysqlTable("agent_negotiations", {
  id: int("id").autoincrement().primaryKey(),
  initiatorId: int("initiatorId").notNull(),
  targetId: int("targetId").notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  proposedKg: varchar("proposedKg", { length: 16 }).notNull(),
  agreedKg: varchar("agreedKg", { length: 16 }),
  status: mysqlEnum("status", ["pending", "agreed", "rejected"]).default("pending").notNull(),
  turns: text("turns").notNull(), // JSON array of NegotiationTurn
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;
export type Challenge = typeof challenges.$inferSelect;
export type Story = typeof stories.$inferSelect;
export type Collective = typeof collectives.$inferSelect;
export type CollectiveMember = typeof collectiveMembers.$inferSelect;
export type LeaderboardEntry = typeof leaderboardEntries.$inferSelect;
export type FeedItem = typeof feedItems.$inferSelect;
export type PeerSnapshot = typeof peerSnapshots.$inferSelect;
