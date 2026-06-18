import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { calculateEquivalents } from "../../shared/carbonData";
import { protectedProcedure, router } from "../_core/trpc";
import { getUserById, getUserCarbonSummary, getUserStories, incrementStoryShares, saveStory } from "../db";
import { routeAI } from "../services/aiRouter";
import { parseAIJson } from "./helpers";

export const storiesRouter = router({
  generate: protectedProcedure.input(z.object({ period: z.enum(["week", "month", "alltime"]).default("week") })).mutation(async ({ ctx, input }) => {
    const summary = await getUserCarbonSummary(ctx.user.id);
    const user = await getUserById(ctx.user.id);
    if (!summary || !user) throw new TRPCError({ code: "NOT_FOUND" });
    const carbonSaved = input.period === "week" ? summary.weeklyKg : input.period === "month" ? summary.monthlyKg : summary.totalKg;
    const equivalents = calculateEquivalents(carbonSaved);
    const response = await routeAI({ task: "story_generate", messages: [{ role: "system", content: "You are ReBon AI. Generate an emotionally compelling, shareable carbon impact story. Be specific and inspiring." }, { role: "user", content: `User: ${user.name ?? "Climate Hero"}. Archetype: ${user.archetypeLabel ?? "Eco Warrior"}. Period: ${input.period}. Carbon: ${carbonSaved.toFixed(1)} kg CO₂. Equivalents: ${equivalents.trees} trees, ${equivalents.km_not_driven} km not driven. Return JSON: { headline: string, narrative: string }` }], maxTokens: 512 });
    let storyData = { headline: `You tracked ${carbonSaved.toFixed(1)} kg CO₂`, narrative: "Your actions are making a real difference." };
    storyData = parseAIJson(response.content, storyData);
    await saveStory({ userId: ctx.user.id, narrative: storyData.narrative, headline: storyData.headline, carbonSavedKg: carbonSaved, equivalents: equivalents as any, period: input.period, aiProvider: response.provider });
    return { ...storyData, carbonSavedKg: carbonSaved, equivalents };
  }),
  list: protectedProcedure.query(async ({ ctx }) => getUserStories(ctx.user.id)),
  share: protectedProcedure.input(z.object({ storyId: z.string() })).mutation(async ({ input }) => { await incrementStoryShares(input.storyId); return { success: true }; }),
});
