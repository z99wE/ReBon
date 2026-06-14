/**
 * Integration / smoke tests for the two most critical user flows:
 *   1. Auth flow — sendOtp → verifyOtp → session cookie
 *   2. Activity logging flow — log activity → carbon calculated → stored
 *
 * These tests exercise the tRPC router layer end-to-end using createCaller()
 * with a mocked database context. No real DB or external API calls are made.
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ── Shared mock helpers ──────────────────────────────────────────────────────

function makePublicCtx(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function makeAuthCtx(overrides?: Partial<TrpcContext["user"]>): TrpcContext {
  return {
    user: {
      id: 42,
      openId: "test-open-id",
      email: "demo@rebon.app",
      name: "Demo User",
      loginMethod: "otp",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      ...overrides,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

// ── Mock the database layer so tests run without a real DB ───────────────────

vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn().mockResolvedValue(undefined),
  getUserByOpenId: vi.fn().mockResolvedValue(undefined),
  getUserById: vi.fn().mockResolvedValue(null),
  updateUserProfile: vi.fn().mockResolvedValue(undefined),
  getAllUsersForLeaderboard: vi.fn().mockResolvedValue([]),
  logActivity: vi.fn().mockResolvedValue({ id: 1 }),
  getUserActivities: vi.fn().mockResolvedValue([]),
  getUserActivitiesByDateRange: vi.fn().mockResolvedValue([]),
  getUserCarbonSummary: vi.fn().mockResolvedValue({ weeklyKg: 0, monthlyKg: 0, byCategory: {} }),
  getUserChallenges: vi.fn().mockResolvedValue([]),
  createChallenge: vi.fn().mockResolvedValue({ id: 1 }),
  completeChallenge: vi.fn().mockResolvedValue(undefined),
  saveStory: vi.fn().mockResolvedValue({ id: 1 }),
  getUserStories: vi.fn().mockResolvedValue([]),
  incrementStoryShares: vi.fn().mockResolvedValue(undefined),
  createCollective: vi.fn().mockResolvedValue({ id: 1, inviteCode: "TEST123" }),
  getCollectiveByInviteCode: vi.fn().mockResolvedValue(null),
  getCollectiveById: vi.fn().mockResolvedValue(null),
  getUserCollectives: vi.fn().mockResolvedValue([]),
  getCollectiveMembers: vi.fn().mockResolvedValue([]),
  joinCollective: vi.fn().mockResolvedValue(undefined),
  getOrCreateActiveSeason: vi.fn().mockResolvedValue({ id: 1, name: "Season 1", startDate: new Date(), endDate: new Date() }),
  getLeaderboard: vi.fn().mockResolvedValue([]),
  upsertLeaderboardEntry: vi.fn().mockResolvedValue(undefined),
  createFeedItem: vi.fn().mockResolvedValue(undefined),
  getCommunityFeed: vi.fn().mockResolvedValue([]),
  likeFeedItem: vi.fn().mockResolvedValue(undefined),
  getTopInfluencers: vi.fn().mockResolvedValue([]),
  updateUserInfluenceScore: vi.fn().mockResolvedValue(undefined),
}));

// Mock OTP auth service so no real emails/SMS are sent
vi.mock("./services/otpAuth", () => ({
  generateOtp: vi.fn().mockReturnValue("123456"),
  hashOtp: vi.fn().mockReturnValue("hashed-otp"),
  verifyOtpHash: vi.fn().mockReturnValue(true),
  createOtpSession: vi.fn().mockResolvedValue({ preview: "dev-otp:123456" }),
  verifyOtpSession: vi.fn().mockResolvedValue({ success: true, identifier: "demo@rebon.app" }),
  sendEmailOtp: vi.fn().mockResolvedValue({ preview: "dev-otp:123456" }),
  sendPhoneOtp: vi.fn().mockResolvedValue({ preview: "dev-otp:123456" }),
}));

// ── Flow 1: Auth — sendOtp ────────────────────────────────────────────────────

describe("Auth flow — sendOtp", () => {
  it("accepts a valid email address and returns sent:true", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.auth.sendOtp({
      identifier: "demo@rebon.app",
      identifierType: "email",
    });
    // Router returns { sent: true, preview? } — not { success }
    expect(result).toHaveProperty("sent", true);
  });

  it("accepts a valid phone number and returns sent:true", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.auth.sendOtp({
      identifier: "+919876543210",
      identifierType: "phone",
    });
    expect(result).toHaveProperty("sent", true);
  });

  it("rejects an empty identifier", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.auth.sendOtp({ identifier: "", identifierType: "email" })
    ).rejects.toThrow();
  });

  it("rejects an identifier that is too long (> 320 chars)", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const longEmail = "a".repeat(321) + "@example.com";
    await expect(
      caller.auth.sendOtp({ identifier: longEmail, identifierType: "email" })
    ).rejects.toThrow();
  });
});

// ── Flow 2: Auth — verifyOtp ──────────────────────────────────────────────────

describe("Auth flow — verifyOtp", () => {
  it("accepts a valid 6-digit OTP and returns a token", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.verifyOtp({
      identifier: "demo@rebon.app",
      otp: "123456",
    });
    expect(result).toHaveProperty("success", true);
    // Cookie should have been set
    expect((ctx.res.cookie as ReturnType<typeof vi.fn>).mock.calls.length).toBeGreaterThan(0);
  });

  it("rejects an OTP that is not 6 digits", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.auth.verifyOtp({ identifier: "demo@rebon.app", otp: "12345" })
    ).rejects.toThrow();
  });

  it("rejects an OTP with non-numeric characters", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.auth.verifyOtp({ identifier: "demo@rebon.app", otp: "12345x" })
    ).rejects.toThrow();
  });
});

// ── Flow 3: Auth — me (session check) ────────────────────────────────────────

describe("Auth flow — me", () => {
  it("returns null for unauthenticated users", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const user = await caller.auth.me();
    expect(user).toBeNull();
  });

  it("returns the user object for authenticated users", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    const user = await caller.auth.me();
    expect(user).not.toBeNull();
    expect(user?.email).toBe("demo@rebon.app");
    expect(user?.id).toBe(42);
  });
});

// ── Flow 4: Activity logging — input validation ───────────────────────────────

describe("Activity logging — input validation", () => {
  it("rejects negative carbon values", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    // carbonKg must be positive (z.number().positive())
    await expect(
      caller.activities.log({
        category: "transport",
        subcategory: "car_km",
        carbonKg: -5,
        label: "Drove to work",
      })
    ).rejects.toThrow();
  });

  it("rejects zero carbonKg", async () => {
    const caller = appRouter.createCaller(makeAuthCtx());
    await expect(
      caller.activities.log({
        category: "meals",
        subcategory: "beef_meal",
        carbonKg: 0,
        label: "Beef burger",
      })
    ).rejects.toThrow();
  });

  it("rejects unauthenticated activity logging", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    await expect(
      caller.activities.log({
        category: "transport",
        subcategory: "car_km",
        carbonKg: 2.1,
        label: "Drove to work",
      })
    ).rejects.toThrow();
  });
});

// ── Flow 5: Leaderboard — public access ──────────────────────────────────────

describe("Leaderboard — public access", () => {
  it("returns season and entries without authentication", async () => {
    const caller = appRouter.createCaller(makePublicCtx());
    const result = await caller.leaderboard.current();
    expect(result).toHaveProperty("entries");
    expect(Array.isArray(result.entries)).toBe(true);
  });
});
// ── Agent Arena (A2A) Tests ──────────────────────────────────────────────────
describe("Agent Arena (A2A)", () => {
  it("requires authentication to initiate a negotiation", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.agents.initiate({
        targetUserId: 99,
        category: "transport",
        proposedKg: 20,
      })
    ).rejects.toThrow();
  });

  it("requires authentication to list negotiations", async () => {
    const ctx = makePublicCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.agents.list()).rejects.toThrow();
  });

  it("validates proposedKg must be positive and ≤ 200", async () => {
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.agents.initiate({
        targetUserId: 2,
        category: "transport",
        proposedKg: -5, // invalid: must be positive
      })
    ).rejects.toThrow();
    await expect(
      caller.agents.initiate({
        targetUserId: 2,
        category: "transport",
        proposedKg: 999, // invalid: must be <= 200
      })
    ).rejects.toThrow();
  });

  it("validates category must be a non-empty string", async () => {
    const ctx = makeAuthCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.agents.initiate({
        targetUserId: 2,
        category: "", // invalid: min length 1
        proposedKg: 20,
      })
    ).rejects.toThrow();
  });
});
