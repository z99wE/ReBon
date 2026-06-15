import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const dbMocks = vi.hoisted(() => ({
  completeChallenge: vi.fn(),
  createChallenge: vi.fn(),
  createCollective: vi.fn(),
  createFeedItem: vi.fn(),
  getArchetypePeers: vi.fn(),
  getCommunityFeed: vi.fn(),
  getCollectiveById: vi.fn(),
  getCollectiveByInviteCode: vi.fn(),
  getLatestPeerSnapshot: vi.fn(),
  getLeaderboard: vi.fn(),
  getOrCreateActiveSeason: vi.fn(),
  getPublicCollectives: vi.fn(),
  getTopInfluencers: vi.fn(),
  getUserActivities: vi.fn(),
  getUserCarbonSummary: vi.fn(),
  getUserById: vi.fn(),
  getUserChallenges: vi.fn(),
  getUserCollectives: vi.fn(),
  getUserStories: vi.fn(),
  getUserLiveStats: vi.fn(),
  incrementStoryShares: vi.fn(),
  joinCollective: vi.fn(),
  likeFeedItem: vi.fn(),
  logActivity: vi.fn(),
  savePeerSnapshot: vi.fn(),
  saveStory: vi.fn(),
  updateUserInfluenceScore: vi.fn(),
  updateUserProfile: vi.fn(),
  upsertLeaderboardEntry: vi.fn(),
}));

const aiMocks = vi.hoisted(() => ({
  routeAI: vi.fn(),
  transcribeWithDeepgram: vi.fn(),
}));

vi.mock("./db", () => dbMocks);
vi.mock("./services/aiRouter", () => ({
  routeAI: aiMocks.routeAI,
  transcribeWithDeepgram: aiMocks.transcribeWithDeepgram,
}));

function makeCtx(overrides?: Partial<TrpcContext["user"]>): TrpcContext {
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
      currentStreak: 4,
      eloScore: 1110,
      influenceScore: 88,
      preferredLanguage: "en",
      ...overrides,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

beforeEach(() => {
  vi.resetAllMocks();
});

describe("server/routers", () => {
  it("parses onboarding JSON and persists the profile", async () => {
    aiMocks.routeAI.mockResolvedValueOnce({
      content:
        "```json\n{\"phases\":[{\"phase\":1,\"title\":\"Start small\",\"actions\":[{\"action\":\"Walk to work\",\"carbonSavingKg\":1,\"difficulty\":\"easy\"}]}]}\n```",
      provider: "groq",
      latencyMs: 12,
    });
    dbMocks.updateUserProfile.mockResolvedValue(undefined);

    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.user.completeOnboarding({
      answers: {
        travel: "walk",
      },
    });

    expect(result.roadmap.phases).toHaveLength(1);
    expect(dbMocks.updateUserProfile).toHaveBeenCalledWith(
      42,
      expect.objectContaining({
        onboardingCompleted: true,
        roadmap: expect.objectContaining({
          phases: expect.any(Array),
        }),
      })
    );
  });

  it("logs an activity and updates leaderboard + influence state", async () => {
    dbMocks.logActivity.mockResolvedValue({ id: 1 });
    dbMocks.createFeedItem.mockResolvedValue(undefined);
    dbMocks.getOrCreateActiveSeason.mockResolvedValue({ id: 7, isActive: true });
    dbMocks.getUserCarbonSummary.mockResolvedValue({ totalKg: 12 });
    dbMocks.getUserLiveStats.mockResolvedValue({
      activityCount: 3,
      completedChallenges: 2,
      followersCount: 1,
    });
    dbMocks.upsertLeaderboardEntry.mockResolvedValue(undefined);
    dbMocks.updateUserInfluenceScore.mockResolvedValue(undefined);

    const caller = appRouter.createCaller(makeCtx({ influenceScore: 120 }));
    const result = await caller.activities.log({
      category: "transport",
      subcategory: "car_km",
      label: "Commute",
      carbonKg: 2.5,
    });

    expect(result).toEqual({ success: true });
    expect(dbMocks.logActivity).toHaveBeenCalledWith(
      expect.objectContaining({ userId: 42, carbonKg: 2.5 })
    );
    expect(dbMocks.upsertLeaderboardEntry).toHaveBeenCalledWith(
      7,
      42,
      expect.objectContaining({ activitiesLogged: 3 })
    );
    expect(dbMocks.updateUserInfluenceScore).toHaveBeenCalledWith(42, expect.any(Number));
    expect(dbMocks.createFeedItem).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Logged: Commute",
        isInfluencer: true,
      })
    );
  });

  it("transcribes voice logs and parses extracted activities", async () => {
    aiMocks.transcribeWithDeepgram.mockResolvedValueOnce("Bike 5 km and eat vegan");
    aiMocks.routeAI.mockResolvedValueOnce({
      content:
        "```json\n[{\"category\":\"transport\",\"subcategory\":\"bike_km\",\"label\":\"Bike ride\",\"carbonKg\":0.2,\"quantity\":5,\"unit\":\"km\"}]\n```",
      provider: "groq",
      latencyMs: 8,
    });

    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.activities.logVoice({
      audioBase64: Buffer.from("audio").toString("base64"),
    });

    expect(result.transcript).toContain("Bike 5 km");
    expect(result.activities).toEqual([
      expect.objectContaining({
        category: "transport",
        label: "Bike ride",
      }),
    ]);
  });

  it("generates challenges and stories from the AI and stores them", async () => {
    dbMocks.getUserById.mockResolvedValue({ id: 42, archetypeLabel: "Eco Pioneer", name: "Demo User" });
    const generatedChallenges = [
      { title: "Bike once", description: "Swap one drive", difficulty: "easy", carbonSavingKg: 1, pointsReward: 50 },
      { title: "Eat plant-based", description: "One meal", category: "meals", difficulty: "medium", carbonSavingKg: 2, pointsReward: 75 },
      { title: "Power down", description: "Reduce energy", category: "energy", difficulty: "hard", carbonSavingKg: 3, pointsReward: 100 },
    ];
    dbMocks.getUserChallenges
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(generatedChallenges as any);
    dbMocks.createChallenge.mockResolvedValue(undefined);
    dbMocks.getUserCarbonSummary.mockResolvedValue({
      weeklyKg: 4,
      monthlyKg: 12,
      totalKg: 24,
    });
    dbMocks.saveStory.mockResolvedValue(undefined);

    aiMocks.routeAI
      .mockResolvedValueOnce({
        content:
          "[{\"title\":\"Bike once\",\"description\":\"Swap one drive\",\"difficulty\":\"easy\",\"carbonSavingKg\":1,\"pointsReward\":50},{\"title\":\"Eat plant-based\",\"description\":\"One meal\",\"category\":\"meals\",\"difficulty\":\"medium\",\"carbonSavingKg\":2,\"pointsReward\":75},{\"title\":\"Power down\",\"description\":\"Reduce energy\",\"category\":\"energy\",\"difficulty\":\"hard\",\"carbonSavingKg\":3,\"pointsReward\":100}]",
        provider: "groq",
        latencyMs: 10,
      })
      .mockResolvedValueOnce({
        content:
          "```json\n{\"headline\":\"You cut 24 kg CO₂\",\"narrative\":\"Small actions added up.\"}\n```",
        provider: "groq",
        latencyMs: 11,
      });

    const caller = appRouter.createCaller(makeCtx());
    const challenges = await caller.challenges.generate();
    const story = await caller.stories.generate({ period: "month" });

    expect(challenges).toHaveLength(3);
    expect(dbMocks.createChallenge).toHaveBeenCalledTimes(3);
    expect(story).toMatchObject({
      headline: "You cut 24 kg CO₂",
      narrative: "Small actions added up.",
      carbonSavedKg: 12,
    });
    expect(dbMocks.saveStory).toHaveBeenCalledWith(
      expect.objectContaining({
        period: "month",
        carbonSavedKg: 12,
      })
    );
  });

  it("compares peers, creates collectives, and answers what-if scenarios", async () => {
    dbMocks.getUserById.mockResolvedValue({ id: 42, archetype: "eco_pioneer", archetypeLabel: "Eco Pioneer", currentStreak: 4 });
    dbMocks.getUserCarbonSummary.mockResolvedValue({ weeklyKg: 8, weeklyByCategory: { transport: 4 } });
    dbMocks.getArchetypePeers.mockResolvedValue([
      { id: 1, totalCarbonKg: 10, archetype: "eco_pioneer" },
      { id: 2, totalCarbonKg: 6, archetype: "eco_pioneer" },
    ]);
    dbMocks.savePeerSnapshot.mockResolvedValue(undefined);
    dbMocks.createCollective.mockResolvedValue({ id: 21, inviteCode: "TEAM123" });
    dbMocks.getCollectiveByInviteCode.mockResolvedValue({ id: 21, inviteCode: "TEAM123", name: "Team" });
    dbMocks.getCollectiveById.mockResolvedValue({ id: 21, name: "Team", memberCount: 4 });
    dbMocks.joinCollective.mockResolvedValue(undefined);

    aiMocks.routeAI
      .mockResolvedValueOnce({
        content: "{\"insights\":[\"Keep going\",\"Walk more\"]}",
        provider: "nvidia_nim",
        latencyMs: 14,
      })
      .mockResolvedValueOnce({
        content: "{\"perMemberWeeklyKg\":2,\"totalWeeklyKg\":8,\"equivalent\":\"one tree\",\"insight\":\"Small wins compound\"}",
        provider: "groq",
        latencyMs: 9,
      });

    const caller = appRouter.createCaller(makeCtx());
    const mirror = await caller.mirror.compare();
    const collective = await caller.collective.create({
      name: "Team",
      description: "Neighbors",
    });
    const joined = await caller.collective.join({ inviteCode: "team123" });
    const whatIf = await caller.collective.whatIf({
      collectiveId: 21,
      scenario: "Everyone bikes one day per week",
    });

    expect(mirror.peerCount).toBe(2);
    expect(dbMocks.savePeerSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({ percentileRank: expect.any(Number) })
    );
    expect(collective).toEqual({ id: 21, inviteCode: "TEAM123" });
    expect(joined).toEqual({ id: 21, inviteCode: "TEAM123", name: "Team" });
    expect(whatIf).toMatchObject({
      totalWeeklyKg: 8,
      collective: { id: 21, name: "Team", memberCount: 4 },
    });
  });

  it("answers assistant chat with the user context", async () => {
    dbMocks.getUserById.mockResolvedValue({
      id: 42,
      name: "Demo User",
      archetypeLabel: "Eco Pioneer",
      currentStreak: 4,
      preferredLanguage: "en",
    });
    dbMocks.getUserCarbonSummary.mockResolvedValue({ weeklyKg: 9.5 });
    aiMocks.routeAI.mockResolvedValueOnce({
      content: "Try one car-free commute this week.",
      provider: "groq",
      latencyMs: 7,
    });

    const caller = appRouter.createCaller(makeCtx());
    const result = await caller.assistant.chat({
      message: "What is one thing I should do this week?",
      history: [{ role: "user", content: "I want to improve my footprint." }],
    });

    expect(result).toMatchObject({
      content: "Try one car-free commute this week.",
      provider: "groq",
    });
    expect(aiMocks.routeAI).toHaveBeenCalledWith(
      expect.objectContaining({
        task: "coach_response",
        language: "en",
      })
    );
  });
});
