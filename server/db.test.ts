import { beforeEach, describe, expect, it, vi } from "vitest";

type SelectState = {
  fields: unknown;
  table: { tableName: string } | null;
  whereArg: unknown;
  orderByArgs: unknown[];
  limitArg: number | null;
};

type InsertState = {
  table: { tableName: string } | null;
  data: unknown;
  duplicateSet: unknown;
};

type UpdateState = {
  table: { tableName: string } | null;
  data: unknown;
  whereArg: unknown;
};

const mocks = vi.hoisted(() => ({
  drizzle: vi.fn(),
  and: vi.fn((...parts: unknown[]) => ({ kind: "and", parts })),
  or: vi.fn((...parts: unknown[]) => ({ kind: "or", parts })),
  count: vi.fn(() => ({ kind: "count" })),
  desc: vi.fn((value: unknown) => ({ kind: "desc", value })),
  eq: vi.fn((left: unknown, right: unknown) => ({ kind: "eq", left, right })),
  gt: vi.fn((left: unknown, right: unknown) => ({ kind: "gt", left, right })),
  gte: vi.fn((left: unknown, right: unknown) => ({ kind: "gte", left, right })),
  lt: vi.fn((left: unknown, right: unknown) => ({ kind: "lt", left, right })),
  sql: vi.fn((strings: TemplateStringsArray, ...values: unknown[]) => ({
    kind: "sql",
    text: String.raw({ raw: strings }, ...values.map((value) => String(value))),
  })),
}));

vi.mock("drizzle-orm/mysql2", () => ({
  drizzle: mocks.drizzle,
}));

vi.mock("drizzle-orm", () => ({
  and: mocks.and,
  or: mocks.or,
  count: mocks.count,
  desc: mocks.desc,
  eq: mocks.eq,
  gt: mocks.gt,
  gte: mocks.gte,
  lt: mocks.lt,
  sql: mocks.sql,
}));

vi.mock("../drizzle/schema", () => {
  const makeTable = (tableName: string) =>
    new Proxy({ tableName }, {
      get(_target, prop) {
        if (prop === "tableName") return tableName;
        if (prop === Symbol.toStringTag) return tableName;
        return `${tableName}.${String(prop)}`;
      },
    });

  return {
    activities: makeTable("activities"),
    challenges: makeTable("challenges"),
    collectiveMembers: makeTable("collectiveMembers"),
    collectives: makeTable("collectives"),
    feedItems: makeTable("feedItems"),
    influenceEdges: makeTable("influenceEdges"),
    leaderboardEntries: makeTable("leaderboardEntries"),
    leaderboardSeasons: makeTable("leaderboardSeasons"),
    peerSnapshots: makeTable("peerSnapshots"),
    stories: makeTable("stories"),
    users: makeTable("users"),
  };
});

function createDbHarness() {
  const selectQueue: Array<unknown> = [];
  const insertQueue: Array<unknown> = [];
  const updateQueue: Array<unknown> = [];

  const calls = {
    select: [] as SelectState[],
    insert: [] as InsertState[],
    update: [] as UpdateState[],
  };

  const takeQueuedValue = <T>(queue: Array<unknown>, state: unknown, fallback: T): T => {
    const next = queue.shift();
    if (typeof next === "function") {
      return (next as (value: unknown) => T)(state);
    }
    return (next ?? fallback) as T;
  };

  const makeThenable = <T>(resolver: () => T) => ({
    then(onFulfilled?: (value: T) => unknown, onRejected?: (reason: unknown) => unknown) {
      return Promise.resolve(resolver()).then(onFulfilled, onRejected);
    },
  });

  const db = {
    select(fields?: unknown) {
      const state: SelectState = {
        fields,
        table: null,
        whereArg: null,
        orderByArgs: [],
        limitArg: null,
      };
      calls.select.push(state);

      const chain: any = {
        from(table: { tableName: string }) {
          state.table = table;
          return chain;
        },
        where(condition: unknown) {
          state.whereArg = condition;
          return chain;
        },
        orderBy(...args: unknown[]) {
          state.orderByArgs = args;
          return chain;
        },
        limit(limitArg: number) {
          state.limitArg = limitArg;
          return makeThenable(() => takeQueuedValue(selectQueue, state, []));
        },
        then(onFulfilled?: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) {
          return Promise.resolve(takeQueuedValue(selectQueue, state, [])).then(onFulfilled, onRejected);
        },
      };

      return chain;
    },
    insert(table: { tableName: string }) {
      const state: InsertState = { table, data: null, duplicateSet: null };
      calls.insert.push(state);

      return {
        values(data: unknown) {
          state.data = data;
          const terminal = {
            onDuplicateKeyUpdate(options: { set: unknown }) {
              state.duplicateSet = options.set;
              return Promise.resolve(takeQueuedValue(insertQueue, state, [{ insertId: 1 }]));
            },
            then(onFulfilled?: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) {
              return Promise.resolve(takeQueuedValue(insertQueue, state, [{ insertId: 1 }])).then(onFulfilled, onRejected);
            },
          };
          return terminal;
        },
      };
    },
    update(table: { tableName: string }) {
      const state: UpdateState = { table, data: null, whereArg: null };
      calls.update.push(state);

      return {
        set(data: unknown) {
          state.data = data;
          const terminal = {
            where(condition: unknown) {
              state.whereArg = condition;
              return Promise.resolve(takeQueuedValue(updateQueue, state, undefined));
            },
            then(onFulfilled?: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) {
              return Promise.resolve(takeQueuedValue(updateQueue, state, undefined)).then(onFulfilled, onRejected);
            },
          };
          return terminal;
        },
      };
    },
  };

  return {
    db,
    calls,
    queueSelect: (...items: Array<unknown>) => selectQueue.push(...items),
    queueInsert: (...items: Array<unknown>) => insertQueue.push(...items),
    queueUpdate: (...items: Array<unknown>) => updateQueue.push(...items),
  };
}

async function loadDbModule(options: { databaseUrl?: string; ownerOpenId?: string } = {}) {
  vi.resetModules();
  process.env.NODE_ENV = "test";
  if ("databaseUrl" in options) {
    if (options.databaseUrl === undefined) delete process.env.DATABASE_URL;
    else process.env.DATABASE_URL = options.databaseUrl;
  } else {
    process.env.DATABASE_URL = "mysql://test";
  }
  process.env.OWNER_OPEN_ID = options.ownerOpenId ?? "owner-open-id";
  return import("./db");
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("server/db", () => {
  it("returns null when the database URL is missing", async () => {
    const harness = createDbHarness();
    mocks.drizzle.mockReturnValue(harness.db);

    const { getDb } = await loadDbModule({ databaseUrl: undefined });
    await expect(getDb()).resolves.toBeNull();
    expect(mocks.drizzle).not.toHaveBeenCalled();
  });

  it("caches the database connection", async () => {
    const harness = createDbHarness();
    mocks.drizzle.mockReturnValue(harness.db);

    const { getDb } = await loadDbModule();
    await expect(getDb()).resolves.toBe(harness.db);
    await expect(getDb()).resolves.toBe(harness.db);
    expect(mocks.drizzle).toHaveBeenCalledTimes(1);
  });

  it("covers user and activity helpers", async () => {
    const harness = createDbHarness();
    const byOpenId = [{ id: 7, openId: "demo" }];
    const byId = [{ id: 8, name: "Member" }];
    const allUsers = [{ id: 1, name: "A" }, { id: 2, name: "B" }];
    const activityRows = [
      { id: 1, category: "transport", carbonKg: 1.5 },
      { id: 2, category: "meals", carbonKg: 0.5 },
    ];
    const weekRows = [{ id: 3, category: "transport", carbonKg: 2 }];
    const monthRows = [{ id: 4, category: "energy", carbonKg: 3 }];
    const summaryRows = [
      { id: 5, category: "transport", carbonKg: 1.1 },
      { id: 6, category: "energy", carbonKg: 2.2 },
    ];

    harness.queueSelect(byOpenId, byId, allUsers, activityRows, weekRows, weekRows, monthRows, summaryRows);
    harness.queueInsert([{ insertId: 11 }], [{ insertId: 12 }], [{ insertId: 13 }]);
    harness.queueUpdate(undefined, undefined);
    mocks.drizzle.mockReturnValue(harness.db);

    const db = await loadDbModule();

    await db.upsertUser({ openId: "demo", name: "Demo", email: null, loginMethod: "email_otp" } as any);
    expect(harness.calls.insert[0]?.data).toMatchObject({ openId: "demo", name: "Demo", email: null, loginMethod: "email_otp" });

    await db.upsertUser({ openId: "owner-open-id" } as any);
    expect((harness.calls.insert[1]?.data as any).role).toBe("admin");

    await expect(db.getUserByOpenId("demo")).resolves.toEqual(byOpenId[0]);
    await expect(db.getUserById(8)).resolves.toEqual(byId[0]);

    await db.updateUserProfile(8, { preferredLanguage: "hi" } as any);
    expect(harness.calls.update.at(-1)?.data).toEqual({ preferredLanguage: "hi" });

    await expect(db.getAllUsersForLeaderboard()).resolves.toEqual(allUsers);

    const logged = await db.logActivity({
      userId: 8,
      category: "transport",
      subcategory: "car_km",
      label: "Commute",
      carbonKg: 1.5,
    } as any);
    expect(logged).toEqual({ insertId: 13 });
    expect(harness.calls.update.at(-1)?.data).toEqual({
      totalCarbonKg: expect.objectContaining({ kind: "sql" }),
    });

    await expect(db.getUserActivities(8, 10)).resolves.toEqual(activityRows);
    await expect(db.getUserActivitiesByDateRange(8, new Date("2025-01-01"), new Date("2025-01-08"))).resolves.toEqual(weekRows);
    await expect(db.getUserCarbonSummary(8)).resolves.toMatchObject({
      weeklyKg: 2,
      monthlyKg: 3,
      totalKg: 3.3,
      recentActivities: summaryRows,
    });
  });

  it("covers challenge and story helpers", async () => {
    const harness = createDbHarness();
    const activeChallenge = {
      id: 1,
      userId: 9,
      status: "active",
      title: "Bike more",
      carbonSavingKg: 4,
      pointsReward: 120,
    };
    const completedChallenge = { ...activeChallenge, status: "completed" };
    const storyRows = [{ id: 1, userId: 9, headline: "Story", narrative: "Great work" }];

    harness.queueSelect([activeChallenge], [activeChallenge], [completedChallenge], [], storyRows);
    harness.queueUpdate(undefined, undefined, undefined);
    mocks.drizzle.mockReturnValue(harness.db);

    const db = await loadDbModule();

    await expect(db.getUserChallenges(9, 4, 2026)).resolves.toEqual([activeChallenge]);

    await db.createChallenge({
      userId: 9,
      title: "Bike more",
      description: "Swap one car trip",
      category: "transport",
      difficulty: "easy",
      carbonSavingKg: 4,
      pointsReward: 120,
      weekNumber: 4,
      year: 2026,
    } as any);

    await db.completeChallenge(1, 9);
    await expect(db.completeChallenge(1, 9)).rejects.toThrow("Challenge already completed");
    await expect(db.completeChallenge(99, 9)).rejects.toThrow("Challenge not found");

    await db.saveStory({
      userId: 9,
      headline: "Story",
      narrative: "Great work",
      carbonSavedKg: 11,
      period: "week",
      aiProvider: "groq",
    } as any);

    await expect(db.getUserStories(9, 5)).resolves.toEqual(storyRows);
    await db.incrementStoryShares(1);
  });

  it("covers collective and leaderboard helpers", async () => {
    const harness = createDbHarness();
    const collective = { id: 44, name: "Neighbors", inviteCode: "ABC123", memberCount: 2 };
    const membership = [{ id: 5, collectiveId: 44, userId: 9 }];
    const memberRows = [{ id: 9, userId: 9, role: "member" }];
    const activeSeason = { id: 1, seasonNumber: 1, year: 2026, weekNumber: 24, isActive: true };
    const createdSeason = { ...activeSeason, id: 2 };
    const leaderboardRows = [{ id: 1, userId: 9, eloScore: 1200 }];
    const leaderboardUser = [{ id: 9, name: "Member", archetype: "eco_pioneer", archetypeLabel: "Eco Pioneer" }];

    harness.queueSelect(
      [collective],
      [collective],
      [collective],
      [membership],
      [collective],
      memberRows,
      [{ id: 9, name: "Member", archetype: "eco_pioneer", eloScore: 1234 }],
      [{ id: 5 }],
      [activeSeason],
      [],
      [createdSeason],
      leaderboardRows,
      leaderboardUser,
      [{ id: 99 }],
      [],
    );
    harness.queueInsert([{ insertId: 1 }, { insertId: 2 }, { insertId: 3 }]);
    harness.queueUpdate(undefined);
    mocks.drizzle.mockReturnValue(harness.db);

    const db = await loadDbModule();

    await db.createCollective("Neighbors", "local", 9, "ABC123");
    await expect(db.getCollectiveByInviteCode("ABC123")).resolves.toEqual(collective);
    await expect(db.getCollectiveById(44)).resolves.toEqual(collective);
    await expect(db.getUserCollectives(9)).resolves.toEqual([collective]);
    await expect(db.getCollectiveMembers(44)).resolves.toEqual([
      { id: 9, userId: 9, role: "member", user: { id: 9, name: "Member", archetype: "eco_pioneer", eloScore: 1234 } },
    ]);
    await db.joinCollective(44, 9);

    await expect(db.getOrCreateActiveSeason()).resolves.toEqual(activeSeason);
    await expect(db.getOrCreateActiveSeason()).resolves.toEqual(createdSeason);

    await expect(db.getLeaderboard(1, 10)).resolves.toEqual([
      {
        id: 1,
        userId: 9,
        eloScore: 1200,
        user: { id: 9, name: "Member", archetype: "eco_pioneer", archetypeLabel: "Eco Pioneer" },
      },
    ]);

    await db.upsertLeaderboardEntry(1, 9, { eloScore: 1300 });
    await db.upsertLeaderboardEntry(1, 10, { eloScore: 1400 });
  });

  it("covers feed, influence, peer and public collective helpers", async () => {
    const harness = createDbHarness();
    const feedRows = [{ id: 1, userId: 9, type: "activity" }];
    const feedUser = [{ id: 9, name: "Member", archetype: "eco_pioneer", influenceScore: 33 }];
    const influencerRows = [{ id: 9, name: "Member", archetype: "eco_pioneer", archetypeLabel: "Eco Pioneer", influenceScore: 33 }];
    const peerRows = [{ id: 7, totalCarbonKg: 11, archetype: "eco_pioneer" }];

    harness.queueSelect(
      feedRows,
      feedUser,
      influencerRows,
      [{ n: 2 }],
      [{ n: 1 }],
      [{ n: 3 }],
      [{ id: 1, userId: 9, totalCarbonKg: 11, archetype: "eco_pioneer" }],
      peerRows,
      [{ id: 1, totalCarbonKg: 42, isPublic: true }],
    );
    harness.queueInsert([{ insertId: 1 }, { insertId: 2 }]);
    harness.queueUpdate(undefined, undefined);
    mocks.drizzle.mockReturnValue(harness.db);

    const db = await loadDbModule();

    await db.createFeedItem({ userId: 9, type: "activity", title: "Logged" } as any);
    await expect(db.getCommunityFeed(10)).resolves.toEqual([
      { id: 1, userId: 9, type: "activity", user: { id: 9, name: "Member", archetype: "eco_pioneer", influenceScore: 33 } },
    ]);
    await db.likeFeedItem(1);
    await expect(db.getTopInfluencers(5)).resolves.toEqual([
      { id: 9, name: "Member", archetype: "eco_pioneer", archetypeLabel: "Eco Pioneer", influenceScore: 33 },
    ]);
    await db.updateUserInfluenceScore(9, 99);
    await expect(db.getUserLiveStats(9)).resolves.toEqual({ activityCount: 2, completedChallenges: 1, followersCount: 3 });
    await db.savePeerSnapshot({ userId: 9, archetype: "eco_pioneer", userCarbonKg: 11, peerAvgKg: 42, percentileRank: 75 } as any);
    await expect(db.getLatestPeerSnapshot(9)).resolves.toEqual({ id: 1, userId: 9, totalCarbonKg: 11, archetype: "eco_pioneer" });
    await expect(db.getArchetypePeers("eco_pioneer", 9)).resolves.toEqual(peerRows);
    await expect(db.getPublicCollectives(10)).resolves.toEqual([{ id: 1, totalCarbonKg: 42, isPublic: true }]);
  });
});
