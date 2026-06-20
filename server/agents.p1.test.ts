import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mockDocs: any[] = [];

const mockCollection = vi.fn((colName: string) => {
  const chain: any = {
    where: vi.fn((field, op, val) => {
      return {
        get: vi.fn(async () => {
          // simple filter
          const docs = mockDocs.filter(d => d._col === colName && d[field] === val);
          return {
            docs: docs.map(d => ({
              data: () => d,
              id: d.id
            })),
            empty: docs.length === 0
          };
        }),
        limit: vi.fn((num) => ({
          get: vi.fn(async () => {
            const docs = mockDocs.filter(d => d._col === colName && d[field] === val).slice(0, num);
            return {
              docs: docs.map(d => ({
                data: () => d,
                id: d.id
              })),
              empty: docs.length === 0
            };
          })
        }))
      };
    }),
    limit: vi.fn((num) => {
      return {
        get: vi.fn(async () => {
          const docs = mockDocs.filter(d => d._col === colName).slice(0, num);
          return {
            docs: docs.map(d => ({
              data: () => d,
              id: d.id
            })),
            empty: docs.length === 0
          };
        })
      };
    }),
    get: vi.fn(async () => {
      const docs = mockDocs.filter(d => d._col === colName);
      return {
        docs: docs.map(d => ({
          data: () => d,
          id: d.id
        })),
        empty: docs.length === 0
      };
    }),
    doc: vi.fn((id: string) => {
      return {
        get: vi.fn(async () => {
          const found = mockDocs.find(d => d.id === id && d._col === colName);
          return {
            exists: !!found,
            data: () => found,
            id
          };
        }),
        set: vi.fn(async (data) => {
          const existingIdx = mockDocs.findIndex(d => d.id === id && d._col === colName);
          if (existingIdx !== -1) {
            mockDocs[existingIdx] = { ...mockDocs[existingIdx], ...data };
          } else {
            mockDocs.push({ ...data, id, _col: colName });
          }
        }),
        update: vi.fn(async (data) => {
          const existingIdx = mockDocs.findIndex(d => d.id === id && d._col === colName);
          if (existingIdx !== -1) {
            mockDocs[existingIdx] = { ...mockDocs[existingIdx], ...data };
          }
        })
      };
    })
  };
  return chain;
});

const dbMocks = vi.hoisted(() => ({
  getUserById: vi.fn(),
}));

const aiMocks = vi.hoisted(() => ({
  routeAI: vi.fn(),
}));

// Mock the firebase-admin modules directly
vi.mock("firebase-admin/app", () => ({
  initializeApp: vi.fn(() => ({})),
  cert: vi.fn(),
  getApps: vi.fn(() => []),
}));

vi.mock("firebase-admin/firestore", () => ({
  getFirestore: vi.fn(() => ({
    collection: mockCollection
  })),
}));

vi.mock("firebase-admin/auth", () => ({
  getAuth: vi.fn(() => ({})),
}));

vi.mock("./db", () => ({
  getUserById: dbMocks.getUserById,
}));

vi.mock("./services/aiRouter", () => ({
  routeAI: aiMocks.routeAI,
}));

function makeCtx(): TrpcContext {
  return {
    user: {
      id: "7",
      openId: "agent-user",
      email: "agent@rebon.app",
      name: "Agent User",
      loginMethod: "otp",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      archetype: "eco_pioneer",
      weeklyBudgetKg: 55,
      totalCarbonKg: 0,
      influenceScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      preferredLanguage: "en",
      onboardingCompleted: true
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mockDocs.length = 0;
});

async function loadAgentsRouter() {
  vi.resetModules();
  return import("./routers/agents");
}

describe("server/routers/agents", () => {
  it("returns safe defaults when the database is empty or unavailable", async () => {
    // When no docs exist, should return empty arrays/null/0s
    const { agentsRouter } = await loadAgentsRouter();
    const caller = agentsRouter.createCaller(makeCtx());

    await expect(caller.list()).resolves.toEqual([]);
    await expect(caller.getPeers()).resolves.toEqual([]);
    await expect(caller.get({ id: "1" })).resolves.toBeNull();
    await expect(caller.stats()).resolves.toEqual({ total: 0, agreed: 0, totalKgPledged: 0 });
  });

  it("lists, filters, and aggregates agent rows", async () => {
    // Push test data into mockDocs
    mockDocs.push(
      { id: "1", initiatorId: "7", targetId: "8", category: "transport", status: "pending", _col: "agent_negotiations", createdAt: { toDate: () => new Date() } },
      { id: "7", openId: "agent-user", name: "Agent User", archetype: "eco_pioneer", eloScore: 1200, role: "user", _col: "users" },
      { id: "8", name: "Other", archetype: "urban_commuter", eloScore: 1100, role: "user", _col: "users" },
      { id: "99", initiatorId: "7", targetId: "8", turns: JSON.stringify([{ speaker: "initiator", message: "hi" }]), status: "agreed", agreedKg: "10", _col: "agent_negotiations", createdAt: { toDate: () => new Date() } }
    );

    dbMocks.getUserById.mockImplementation(async (id) => {
      return mockDocs.find(d => d.id === id && d._col === "users");
    });

    const { agentsRouter } = await loadAgentsRouter();
    const caller = agentsRouter.createCaller(makeCtx());

    const listRes = await caller.list();
    expect(listRes.map(n => n.id)).toContain("1");
    expect(listRes.map(n => n.id)).toContain("99");

    const peersRes = await caller.getPeers();
    expect(peersRes).toEqual([
      { id: "8", name: "Other", archetype: "urban_commuter", eloScore: 1100 }
    ]);

    const singleRes = await caller.get({ id: "99" });
    expect(singleRes).toMatchObject({
      id: "99",
      turns: [{ speaker: "initiator", message: "hi" }],
    });

    const statsRes = await caller.stats();
    expect(statsRes).toEqual({
      total: 2,
      agreed: 1,
      totalKgPledged: 10,
    });
  });

  it("creates an agreed negotiation when the target accepts", async () => {
    mockDocs.push(
      { id: "7", name: "Agent User", archetype: "eco_pioneer", weeklyBudgetKg: 55, _col: "users" },
      { id: "8", name: "Target User", archetype: "urban_commuter", weeklyBudgetKg: 60, _col: "users" }
    );

    dbMocks.getUserById.mockImplementation(async (id) => {
      return mockDocs.find(d => d.id === id && d._col === "users");
    });

    aiMocks.routeAI.mockResolvedValue({
      content: "AGREED: 10kg",
    });

    const { agentsRouter } = await loadAgentsRouter();
    const caller = agentsRouter.createCaller(makeCtx());
    const result = await caller.initiate({
      targetUserId: "8",
      category: "transport",
      proposedKg: 10,
      message: "Let's do this.",
    });

    expect(result).toMatchObject({
      status: "agreed",
      agreedKg: 10,
    });
  });

  it("falls back to a rejected negotiation after counter-offers", async () => {
    mockDocs.push(
      { id: "7", name: "Agent User", archetype: "eco_pioneer", weeklyBudgetKg: 55, _col: "users" },
      { id: "8", name: "Target User", archetype: "urban_commuter", weeklyBudgetKg: 60, _col: "users" }
    );

    dbMocks.getUserById.mockImplementation(async (id) => {
      return mockDocs.find(d => d.id === id && d._col === "users");
    });

    aiMocks.routeAI
      .mockResolvedValueOnce({ content: "Too ambitious." })
      .mockResolvedValueOnce({ content: "Still too high." });

    const { agentsRouter } = await loadAgentsRouter();
    const caller = agentsRouter.createCaller(makeCtx());
    const result = await caller.initiate({
      targetUserId: "8",
      category: "meals",
      proposedKg: 12,
    });

    expect(result).toMatchObject({
      status: "rejected",
      agreedKg: null,
    });
  });
});
