import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockDocs, mockCollection, mockRunTransaction, mockTimestamp, mockBatch } = vi.hoisted(() => {
  const mockDocs: any[] = [];

  const mockTimestamp = (date = new Date()) => ({
    toDate: () => date,
    seconds: Math.floor(date.getTime() / 1000),
    nanoseconds: 0,
  });

  const convertDatesToTimestamps = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Date) {
      return mockTimestamp(obj);
    }
    if (Array.isArray(obj)) {
      return obj.map(convertDatesToTimestamps);
    }
    if (typeof obj === "object" && obj.constructor === Object) {
      const res: any = {};
      for (const key of Object.keys(obj)) {
        res[key] = convertDatesToTimestamps(obj[key]);
      }
      return res;
    }
    return obj;
  };

  const mockCollection = vi.fn((colName: string) => {
    const makeQueryChain = (filters: any[] = [], limitNum?: number) => {
      const getFilteredDocs = () => {
        let docs = mockDocs.filter(d => d._col === colName);
        for (const f of filters) {
          docs = docs.filter(d => {
            const docVal = d[f.field];
            if (f.op === "==") return docVal === f.val;
            if (f.op === ">=") return docVal >= f.val;
            if (f.op === "<") return docVal < f.val;
            return false;
          });
        }
        if (limitNum !== undefined) {
          docs = docs.slice(0, limitNum);
        }
        return docs;
      };

      const chain: any = {
        where: (field: string, op: string, val: any) => {
          return makeQueryChain([...filters, { field, op, val }], limitNum);
        },
        orderBy: () => {
          return chain;
        },
        limit: (num: number) => {
          return makeQueryChain(filters, num);
        },
        get: async () => {
          const docs = getFilteredDocs();
          return {
            docs: docs.map(d => ({
              data: () => convertDatesToTimestamps(d),
              id: d.id
            })),
            empty: docs.length === 0
          };
        }
      };
      return chain;
    };

    const collectionRef = {
      doc: (id: string) => {
        return {
          get: async () => {
            const found = mockDocs.find(d => d.id === id && d._col === colName);
            return {
              exists: !!found,
              data: () => convertDatesToTimestamps(found),
              id
            };
          },
          set: async (data: any) => {
            const existingIdx = mockDocs.findIndex(d => d.id === id && d._col === colName);
            if (existingIdx !== -1) {
              mockDocs[existingIdx] = { ...mockDocs[existingIdx], ...data };
            } else {
              mockDocs.push({ ...data, id, _col: colName });
            }
          },
          update: async (data: any) => {
            const existingIdx = mockDocs.findIndex(d => d.id === id && d._col === colName);
            if (existingIdx !== -1) {
              mockDocs[existingIdx] = { ...mockDocs[existingIdx], ...data };
            }
          }
        };
      },
      where: (field: string, op: string, val: any) => {
        return makeQueryChain([{ field, op, val }]);
      },
      limit: (num: number) => {
        return makeQueryChain([], num);
      },
      orderBy: () => {
        return makeQueryChain([]);
      },
      get: async () => {
        return makeQueryChain([]).get();
      }
    };
    return collectionRef;
  });

  const mockTransaction = {
    get: vi.fn(async (ref: any) => ref.get()),
    set: vi.fn(async (ref: any, data: any) => ref.set(data)),
    update: vi.fn(async (ref: any, data: any) => ref.update(data)),
  };

  const mockRunTransaction = vi.fn(async (cb) => {
    return cb(mockTransaction);
  });

  const mockBatch = {
    set: vi.fn((ref: any, data: any) => ref.set(data)),
    update: vi.fn((ref: any, data: any) => ref.update(data)),
    commit: vi.fn(async () => {}),
  };

  return { mockDocs, mockCollection, mockRunTransaction, mockTimestamp, mockBatch };
});

// Mock firebase-admin packages
vi.mock("firebase-admin/app", () => ({
  initializeApp: vi.fn(() => ({})),
  cert: vi.fn(),
  getApps: vi.fn(() => []),
}));

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(() => ({
    collection: mockCollection,
    runTransaction: mockRunTransaction,
    batch: vi.fn(() => mockBatch),
  })),
}));

vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(() => ({})),
}));

// Load the Firestore db module
import * as db from "./db";

beforeEach(() => {
  vi.clearAllMocks();
  mockDocs.length = 0;
});

describe("server/db (Firestore Edition)", () => {
  it("covers user and activity helpers", async () => {
    // 1. upsertUser (new user)
    await db.upsertUser({
      openId: "test-user-001",
      name: "Demo User",
      email: "demo@rebon.app",
      loginMethod: "otp",
    });

    const user = mockDocs.find(d => d.openId === "test-user-001");
    expect(user).toBeDefined();
    expect(user.name).toBe("Demo User");
    expect(user.role).toBe("user");

    // 2. getUserByOpenId
    const foundByOpenId = await db.getUserByOpenId("test-user-001");
    expect(foundByOpenId).toBeDefined();
    expect(foundByOpenId?.id).toBe(user.id);

    // 3. getUserById
    const foundById = await db.getUserById(user.id);
    expect(foundById?.name).toBe("Demo User");

    // 4. updateUserProfile
    await db.updateUserProfile(user.id, { preferredLanguage: "es" });
    const updated = await db.getUserById(user.id);
    expect(updated?.preferredLanguage).toBe("es");

    // 5. logActivity
    const activityResult = await db.logActivity({
      userId: user.id,
      category: "transport",
      subcategory: "car_petrol_km",
      label: "Commute",
      carbonKg: 4.5,
      inputMethod: "tap",
      loggedAt: new Date(),
    });
    expect(activityResult.insertId).toBeDefined();

    // Verify user total carbon is updated
    const userAfterAct = await db.getUserById(user.id);
    expect(userAfterAct?.totalCarbonKg).toBe(4.5);

    // 6. getUserActivities
    const activities = await db.getUserActivities(user.id);
    expect(activities).toHaveLength(1);
    expect(activities[0]?.carbonKg).toBe(4.5);
  });

  it("covers challenge and story helpers", async () => {
    // Seed user
    const userId = "u123";
    mockDocs.push({
      id: userId,
      openId: "open123",
      name: "Tester",
      _col: "users"
    });

    // 1. createChallenge
    await db.createChallenge({
      userId,
      title: "Walk to school",
      description: "Walk instead of driving",
      category: "transport",
      difficulty: "easy",
      carbonSavingKg: 2,
      pointsReward: 50,
      weekNumber: 25,
      year: 2026,
      status: "active",
    });

    const chal = mockDocs.find(d => d._col === "challenges");
    expect(chal).toBeDefined();
    expect(chal.title).toBe("Walk to school");
    expect(chal.status).toBe("active");

    // 2. getUserChallenges
    const chals = await db.getUserChallenges(userId, 25, 2026);
    expect(chals).toHaveLength(1);

    // 3. completeChallenge
    const completeRes = await db.completeChallenge(chal.id, userId);
    expect(completeRes.title).toBe("Walk to school");

    const chalAfter = mockDocs.find(d => d.id === chal.id);
    expect(chalAfter.status).toBe("completed");

    // 4. saveStory and getUserStories
    await db.saveStory({
      userId,
      headline: "Headline Test",
      narrative: "Narrative details...",
      carbonSavedKg: 10,
      period: "week",
      aiProvider: "groq",
    });

    const stories = await db.getUserStories(userId);
    expect(stories).toHaveLength(1);
    expect(stories[0]?.headline).toBe("Headline Test");
  });

  it("covers collective and leaderboard helpers", async () => {
    // 1. createCollective
    const col = await db.createCollective("Green Warriors", "Eco tribe", "u1", "INV123");
    expect(col.inviteCode).toBe("INV123");

    // 2. getCollectiveByInviteCode
    const foundCol = await db.getCollectiveByInviteCode("INV123");
    expect(foundCol?.name).toBe("Green Warriors");

    // 3. joinCollective
    mockDocs.push({ id: "u2", openId: "open2", name: "Joiner", _col: "users" });
    await db.joinCollective(col.id, "u2");

    const member = mockDocs.find(d => d._col === "collective_members" && d.userId === "u2");
    expect(member).toBeDefined();
    expect(member.role).toBe("member");

    // 4. getOrCreateActiveSeason
    const season = await db.getOrCreateActiveSeason();
    expect(season.seasonNumber).toBe(1);

    // 5. upsertLeaderboardEntry and getLeaderboard
    await db.upsertLeaderboardEntry(season.id, "u2", { eloScore: 1200, carbonSavedKg: 15 });
    const entries = await db.getLeaderboard(season.id);
    expect(entries).toHaveLength(1);
    expect(entries[0]?.eloScore).toBe(1200);
  });
});
