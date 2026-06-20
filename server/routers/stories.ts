import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { calculateEquivalents } from "../../shared/carbonData";
import { protectedProcedure, router } from "../_core/trpc";
import { getUserById, getUserCarbonSummary, getUserStories, incrementStoryShares, saveStory, getUserChallenges } from "../db";
import { routeAI } from "../services/aiRouter";
import { parseAIJson } from "./helpers";

type StoryDraft = {
  headline?: string;
  narrative?: string;
};

export const storiesRouter = router({
  generate: protectedProcedure
    .input(z.object({ period: z.enum(["week", "month", "alltime"]).default("week") }))
    .mutation(async ({ ctx, input }) => {
      const summary = await getUserCarbonSummary(ctx.user.id);
      const user = await getUserById(ctx.user.id);
      if (!summary || !user) throw new TRPCError({ code: "NOT_FOUND" });

      const loggedEmissions =
        input.period === "week"
          ? summary.weeklyKg
          : input.period === "month"
            ? summary.monthlyKg
            : summary.totalKg;

      const challenges = (await getUserChallenges(ctx.user.id)) || [];
      const completedChallenges = challenges.filter((challenge) => challenge.status === "completed");

      const nowMs = Date.now();
      const weekMs = 7 * 24 * 60 * 60 * 1000;
      const monthMs = 30 * 24 * 60 * 60 * 1000;

      const periodChallenges = completedChallenges.filter((challenge) => {
        if (!challenge.completedAt) return false;
        const completedTime = challenge.completedAt instanceof Date ? challenge.completedAt.getTime() : new Date(challenge.completedAt).getTime();
        if (input.period === "week") return nowMs - completedTime <= weekMs;
        if (input.period === "month") return nowMs - completedTime <= monthMs;
        return true;
      });

      const challengeSavings = periodChallenges.reduce((sum, challenge) => sum + (Number(challenge.carbonSavingKg) || 0), 0);
      const carbonSaved = challengeSavings > 0 ? challengeSavings : loggedEmissions;
      const equivalents = calculateEquivalents(carbonSaved);

      const systemPrompt =
        "You are ReBon AI, an inspiring climate narrative assistant. Write tight, punchy, emotionally compelling, and highly meaningful carbon impact stories. Avoid generic corporate speak or placeholders. Make the copy feel urgent, premium, and motivating.";

      const userPrompt =
        loggedEmissions === 0 && challengeSavings === 0
          ? `User: ${user.name ?? "Climate Hero"}. Archetype: ${user.archetypeLabel ?? "Eco Warrior"} (target: ${user.weeklyBudgetKg ?? 50} kg CO₂/week).
Period: ${input.period}.
Context: The user has just onboarded and hasn't logged activities or completed challenges yet for this ${input.period}.
Task: Write a period-specific (${input.period}) motivational and educational kickoff story.
- Do NOT congratulate them on '0.0 kg emissions' or tell them they saved '0 trees' or avoided '0 km' driving—that sounds like a bug and is random.
- Instead, frame this as the beginning of their carbon tracking journey.
- Mention that by tracking their footprint on ReBon, they are building carbon intelligence.
- Suggest that if they stick to their weekly budget of ${user.weeklyBudgetKg ?? 50} kg CO₂, they can save up to 200 kg of CO₂ per month compared to global averages (equivalent to ~9 trees saved). Make the narrative tight, meaningful, and focused on active awareness.
Return JSON format strictly: { headline: string, narrative: string }`
          : `User: ${user.name ?? "Climate Hero"}. Archetype: ${user.archetypeLabel ?? "Eco Warrior"}. Period: ${input.period}.
Carbon footprint tracked: ${loggedEmissions.toFixed(1)} kg CO₂.
Carbon savings from completed challenges: ${challengeSavings.toFixed(1)} kg CO₂.
Equivalents from active savings/tracking: ${equivalents.trees} trees saved/absorbed, ${equivalents.km_not_driven} km not driven.
Task: Generate a shareable story that contextualizes this impact for the ${input.period} period.
- Do NOT make up random numbers or list zero values as achievements.
- Explain that by tracking their footprint and completing challenges, they are actively managing and mastering their climate impact.
- Focus on the impact of active carbon tracking and mindful reduction compared to global baselines. Keep it tight, punchy, inspiring, and mathematically consistent.
Return JSON format strictly: { headline: string, narrative: string }`;

      const response = await routeAI({
        task: "story_generate",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        maxTokens: 512,
      });

      const fallbackStory = {
        headline: challengeSavings > 0 ? `You saved ${challengeSavings.toFixed(1)} kg CO₂!` : `You tracked ${loggedEmissions.toFixed(1)} kg CO₂`,
        narrative: "Your actions are making a real difference.",
      };

      const storyData = parseAIJson<StoryDraft>(response.content, fallbackStory);

      await saveStory({
        userId: ctx.user.id,
        narrative: storyData.narrative ?? fallbackStory.narrative,
        headline: storyData.headline ?? fallbackStory.headline,
        carbonSavedKg: carbonSaved,
        equivalents,
        period: input.period,
        aiProvider: response.provider,
      });

      return {
        headline: storyData.headline ?? fallbackStory.headline,
        narrative: storyData.narrative ?? fallbackStory.narrative,
        carbonSavedKg: carbonSaved,
        equivalents,
        period: input.period,
      };
    }),

  list: protectedProcedure.query(async ({ ctx }) => getUserStories(ctx.user.id)),

  share: protectedProcedure.input(z.object({ storyId: z.string() })).mutation(async ({ input }) => {
    await incrementStoryShares(input.storyId);
    return { success: true };
  }),
});
