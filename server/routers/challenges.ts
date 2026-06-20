import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { completeChallenge, createChallenge, createFeedItem, getUserById, getUserChallenges } from "../db";
import { routeAI } from "../services/aiRouter";
import { getWeekNumber, parseAIJson } from "./helpers";

type ChallengeDraft = {
  title?: string;
  description?: string;
  category?: string;
  difficulty?: string;
  carbonSavingKg?: number;
  pointsReward?: number;
  trendingTopic?: string;
};

const VALID_CATEGORIES = ["transport", "meals", "energy", "shopping", "lifestyle"] as const;
const VALID_DIFFICULTIES = ["easy", "medium", "hard"] as const;

export const challengesRouter = router({
  generate: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id);
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });

    const now = new Date();
    const weekNumber = getWeekNumber(now);
    const existing = await getUserChallenges(ctx.user.id, weekNumber, now.getFullYear());
    if (existing.length >= 3) return existing;

    const trendingTopics = [
      "EV adoption surge",
      "plant-based diet movement",
      "solar energy boom",
      "fast fashion impact",
      "flight shame movement",
    ];
    const trending = trendingTopics[Math.floor(Math.random() * trendingTopics.length)];

    const response = await routeAI({
      task: "challenge_generate",
      messages: [
        { role: "system", content: "You are ReBon AI. Generate 3 personalized weekly carbon challenges as JSON." },
        {
          role: "user",
          content: `Archetype: ${user.archetypeLabel ?? "General"}. Trending: ${trending}. Return JSON array: [{ title, description, category, difficulty, carbonSavingKg, pointsReward, trendingTopic }]`,
        },
      ],
      maxTokens: 1024,
    });

    const challengeData = parseAIJson<ChallengeDraft[]>(response.content, []);

    for (const challenge of challengeData.slice(0, 3)) {
      const rawCategory = (challenge.category ?? "lifestyle").toLowerCase();
      const category = VALID_CATEGORIES.find((value) => rawCategory.includes(value)) ?? "lifestyle";

      const rawDifficulty = (challenge.difficulty ?? "medium").toLowerCase();
      const difficulty = VALID_DIFFICULTIES.find((value) => rawDifficulty.includes(value)) ?? "medium";

      await createChallenge({
        userId: ctx.user.id,
        title: challenge.title ?? "Weekly Challenge",
        description: challenge.description ?? "",
        category,
        difficulty,
        carbonSavingKg: typeof challenge.carbonSavingKg === "number" ? challenge.carbonSavingKg : 5,
        pointsReward: typeof challenge.pointsReward === "number" ? challenge.pointsReward : 100,
        weekNumber,
        year: now.getFullYear(),
        status: "active",
        aiProvider: response.provider,
        trendingTopic: challenge.trendingTopic ?? trending,
      });
    }

    return getUserChallenges(ctx.user.id, weekNumber, now.getFullYear());
  }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const now = new Date();
    return getUserChallenges(ctx.user.id, getWeekNumber(now), now.getFullYear());
  }),

  complete: protectedProcedure.input(z.object({ challengeId: z.string() })).mutation(async ({ ctx, input }) => {
    const challenge = await completeChallenge(input.challengeId, ctx.user.id);
    await createFeedItem({
      userId: ctx.user.id,
      type: "challenge_complete",
      title: `Completed: ${challenge.title}`,
      body: `Saved ${challenge.carbonSavingKg} kg CO₂ · +${challenge.pointsReward} pts`,
      carbonKg: challenge.carbonSavingKg,
      isInfluencer: (ctx.user.influenceScore ?? 0) > 100,
      amplified: false,
    });
    return { success: true };
  }),
});
