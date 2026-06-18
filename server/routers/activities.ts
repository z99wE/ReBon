import { z } from "zod";
import { calculateInfluenceScore } from "../../shared/carbonData";
import { protectedProcedure, router } from "../_core/trpc";
import { createFeedItem, getOrCreateActiveSeason, getUserActivities, getUserCarbonSummary, getUserLiveStats, logActivity, updateUserInfluenceScore, upsertLeaderboardEntry } from "../db";
import { routeAI, transcribeWithDeepgram } from "../services/aiRouter";
import { parseAIJson } from "./helpers";
import { Buffer } from "buffer";

export const activitiesRouter = router({
  log: protectedProcedure
    .input(z.object({ category: z.enum(["transport", "meals", "energy", "shopping", "other"]), subcategory: z.string(), label: z.string(), carbonKg: z.number().positive(), quantity: z.number().optional(), unit: z.string().optional(), inputMethod: z.enum(["tap", "voice", "manual"]).default("tap"), voiceTranscript: z.string().optional(), notes: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      await logActivity({ ...input, userId: ctx.user.id, loggedAt: new Date() });
      await createFeedItem({ userId: ctx.user.id, type: "activity", title: `Logged: ${input.label}`, body: `${input.carbonKg.toFixed(2)} kg CO₂`, carbonKg: input.carbonKg, isInfluencer: (ctx.user.influenceScore ?? 0) > 100, amplified: false });
      // Use live DB counts so influence score reflects the user's full history
      const [season, summary, liveStats] = await Promise.all([
        getOrCreateActiveSeason(),
        getUserCarbonSummary(ctx.user.id),
        getUserLiveStats(ctx.user.id),
      ]);
      if (season) await upsertLeaderboardEntry(season.id, ctx.user.id, { activitiesLogged: liveStats.activityCount, eloScore: (ctx.user.eloScore ?? 1000) + Math.round(input.carbonKg * 2) });
      const newInfluence = calculateInfluenceScore({
        carbonSavedKg: summary?.totalKg ?? 0,
        activitiesLogged: liveStats.activityCount,
        challengesCompleted: liveStats.completedChallenges,
        streakDays: ctx.user.currentStreak ?? 0,
        followersCount: liveStats.followersCount,
      });
      await updateUserInfluenceScore(ctx.user.id, newInfluence);
      return { success: true };
    }),
  logVoice: protectedProcedure
    .input(z.object({ audioBase64: z.string(), mimeType: z.string().default("audio/webm") }))
    .mutation(async ({ ctx, input }) => {
      const audioBuffer = Buffer.from(input.audioBase64, "base64");
      const transcript = await transcribeWithDeepgram(audioBuffer, input.mimeType);
      
      const systemPrompt = `You are a carbon activity parser. Extract carbon activities from user speech.
Return a JSON array of parsed activities matching this TypeScript type:
Array<{
  category: "transport" | "meals" | "energy" | "shopping" | "other";
  subcategory: string;
  label: string;
  carbonKg: number;
  quantity?: number;
  unit?: string;
}>

Rules:
1. 'category' MUST be EXACTLY one of: "transport", "meals", "energy", "shopping", "other". No other categories are allowed.
2. Estimate the carbon footprint in 'carbonKg' based on standard metrics if not specified (e.g. driving a car is ~0.192 kg CO2 per km, electricity is ~0.4 kg CO2 per kWh).
3. If no carbon activities are found, return [].`;

      const parseResponse = await routeAI({ 
        task: "fast_inference", 
        messages: [
          { role: "system", content: systemPrompt }, 
          { role: "user", content: transcript }
        ], 
        maxTokens: 512 
      });

      let parsedActivities: any[] = [];
      parsedActivities = parseAIJson<any[]>(parseResponse.content, []);

      // Sanitize categories to prevent database/zod validation failures
      const validCategories = ["transport", "meals", "energy", "shopping", "other"];
      const sanitized = parsedActivities.map(act => {
        let cat = String(act.category || "other").toLowerCase().trim();
        if (cat === "transportation" || cat === "driving" || cat === "flight" || cat === "travel") cat = "transport";
        if (cat === "food" || cat === "diet" || cat === "eating" || cat === "meal") cat = "meals";
        if (cat === "electricity" || cat === "utilities" || cat === "utility" || cat === "heating") cat = "energy";
        if (cat === "purchase" || cat === "groceries" || cat === "buying") cat = "shopping";
        if (!validCategories.includes(cat)) cat = "other";
        return {
          ...act,
          category: cat,
          subcategory: act.subcategory || "voice_logged",
          label: act.label || "Voice logged activity",
          carbonKg: Number(act.carbonKg) || 1.0,
        };
      });

      return { transcript, activities: sanitized };
    }),
  list: protectedProcedure.input(z.object({ limit: z.number().default(50) })).query(async ({ ctx, input }) => getUserActivities(ctx.user.id, input.limit)),
  summary: protectedProcedure.query(async ({ ctx }) => getUserCarbonSummary(ctx.user.id)),
});
