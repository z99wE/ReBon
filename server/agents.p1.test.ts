import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  getDb: vi.fn(),
  invokeLLM: vi.fn(),
  and: vi.fn((...parts: unknown[]) => ({ kind: "and", parts })),
  desc: vi.fn((value: unknown) => ({ kind: "desc", value })),
  eq: vi.fn((left: unknown, right: unknown) => ({ kind: "eq", left, right })),
  or: vi.fn((...parts: unknown[]) => ({ kind: "or", parts })),
}));

vi.mock("./db", () => ({
  getDb: mocks.getDb,
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: mocks.invokeLLM,
}));

vi.mock("drizzle-orm", () => ({
  and: mocks.and,
  desc: mocks.desc,
  eq: mocks.eq,
  or: mocks.or,
}));

vi.mock("../../drizzle/schema", () => {
  const makeTable = (tableName: string) =>
    new Proxy({ tableName }, {
      get(_target, prop) {
        if (prop === "tableName") return tableName;
        return `${tableName}.${String(prop)}`;
      },
    });

  return {
    agentNegotiations: makeTable("agentNegotiations"),
    users: makeTable("users"),
  };
});

function makeCtx(): TrpcContext {
  return {
    user: {
      id: 7,
      openId: "agent-user",
      email: "agent@rebon.app",
      name: "Agent User",
      loginMethod: "otp",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createHarness() {
  const selectQueue: Array<unknown> = [];
  const insertQueue: Array<unknown> = [];

  const makeThenable = <T>(resolver: () => T) => ({
    then(onFulfilled?: (value: T) => unknown, onRejected?: (reason: unknown) => unknown) {
      return Promise.resolve(resolver()).then(onFulfilled, onRejected);
    },
  });

  const db = {
    select(fields?: unknown) {
      const state: Record<string, unknown> = { fields };
      const chain: any = {
        from(table: { tableName: string }) {
          state.table = table;
          return chain;
        },
        leftJoin(table: { tableName: string }, condition: unknown) {
          state.leftJoin = { table, condition };
          return chain;
        },
        where(condition: unknown) {
          state.where = condition;
          return chain;
        },
        orderBy(...args: unknown[]) {
          state.orderBy = args;
          return chain;
        },
        limit(limitArg: number) {
          state.limit = limitArg;
          return makeThenable(() => selectQueue.shift() ?? []);
        },
        then(onFulfilled?: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) {
          return Promise.resolve(selectQueue.shift() ?? []).then(onFulfilled, onRejected);
        },
      };
      return chain;
    },
    insert(table: { tableName: string }) {
      const state: Record<string, unknown> = { table };
      return {
        values(data: unknown) {
          state.data = data;
          return {
            then(onFulfilled?: (value: unknown) => unknown, onRejected?: (reason: unknown) => unknown) {
              return Promise.resolve(insertQueue.shift() ?? [{ insertId: 1 }]).then(onFulfilled, onRejected);
            },
          };
        },
      };
    },
  };

  return {
    db,
    queueSelect: (...items: Array<unknown>) => selectQueue.push(...items),
    queueInsert: (...items: Array<unknown>) => insertQueue.push(...items),
  };
}

beforeEach(() => {
  vi.resetAllMocks();
});

async function loadAgentsRouter() {
  vi.resetModules();
  return import("./routers/agents");
}

describe("server/routers/agents", () => {
  it("returns safe defaults when the database is unavailable", async () => {
    mocks.getDb.mockResolvedValue(null);
    const { agentsRouter } = await loadAgentsRouter();
    const caller = agentsRouter.createCaller(makeCtx());

    await expect(caller.list()).resolves.toEqual([]);
    await expect(caller.getPeers()).resolves.toEqual([]);
    await expect(caller.get({ id: 1 })).resolves.toBeNull();
    await expect(caller.stats()).resolves.toEqual({ total: 0, agreed: 0, totalKgPledged: 0 });
  });

  it("lists, filters, and aggregates agent rows", async () => {
    const harness = createHarness();
    mocks.getDb.mockResolvedValue(harness.db);
    harness.queueSelect(
      [{ id: 1, category: "transport", status: "pending" }],
      [
        { id: 7, name: "Agent User", archetype: "eco_pioneer", eloScore: 1200 },
        { id: 8, name: "Other", archetype: "urban_commuter", eloScore: 1100 },
      ],
      [{ id: 99, turns: JSON.stringify([{ speaker: "initiator", message: "hi" }]) }],
      [
        { status: "agreed", agreedKg: "10" },
        { status: "pending", agreedKg: null },
        { status: "agreed", agreedKg: "6" },
      ],
    );

    const { agentsRouter } = await loadAgentsRouter();
    const caller = agentsRouter.createCaller(makeCtx());
    await expect(caller.list()).resolves.toEqual([{ id: 1, category: "transport", status: "pending" }]);
    await expect(caller.getPeers()).resolves.toEqual([
      { id: 8, name: "Other", archetype: "urban_commuter", eloScore: 1100 },
    ]);
    await expect(caller.get({ id: 99 })).resolves.toMatchObject({
      id: 99,
      turns: [{ speaker: "initiator", message: "hi" }],
    });
    await expect(caller.stats()).resolves.toEqual({
      total: 3,
      agreed: 2,
      totalKgPledged: 16,
    });
  });

  it("creates an agreed negotiation when the target accepts", async () => {
    const harness = createHarness();
    mocks.getDb.mockResolvedValue(harness.db);
    harness.queueSelect(
      [{ name: "Agent User", archetype: "eco_pioneer", weeklyBudgetKg: 55 }],
      [{ name: "Target User", archetype: "urban_commuter", weeklyBudgetKg: 60 }],
    );
    harness.queueInsert([{ insertId: 17 }]);
    mocks.invokeLLM.mockResolvedValue({
      choices: [{ message: { content: "AGREED: 10kg" } }],
    });

    const { agentsRouter } = await loadAgentsRouter();
    const caller = agentsRouter.createCaller(makeCtx());
    const result = await caller.initiate({
      targetUserId: 8,
      category: "transport",
      proposedKg: 10,
      message: "Let's do this.",
    });

    expect(result).toMatchObject({
      id: 17,
      status: "agreed",
      agreedKg: 10,
    });
  });

  it("falls back to a rejected negotiation after counter-offers", async () => {
    const harness = createHarness();
    mocks.getDb.mockResolvedValue(harness.db);
    harness.queueSelect(
      [{ name: "Agent User", archetype: "eco_pioneer", weeklyBudgetKg: 55 }],
      [{ name: "Target User", archetype: "urban_commuter", weeklyBudgetKg: 60 }],
    );
    harness.queueInsert([{ insertId: 18 }]);
    mocks.invokeLLM
      .mockResolvedValueOnce({ choices: [{ message: { content: "Too ambitious." } }] })
      .mockResolvedValueOnce({ choices: [{ message: { content: "Still too high." } }] });

    const { agentsRouter } = await loadAgentsRouter();
    const caller = agentsRouter.createCaller(makeCtx());
    const result = await caller.initiate({
      targetUserId: 8,
      category: "meals",
      proposedKg: 12,
    });

    expect(result).toMatchObject({
      id: 18,
      status: "rejected",
      agreedKg: null,
    });
  });
});
