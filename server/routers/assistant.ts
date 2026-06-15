import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getUserById, getUserCarbonSummary } from "../db";
import { routeAI } from "../services/aiRouter";

export const assistantRouter = router({
  chat: protectedProcedure
    .input(z.object({ message: z.string().min(1).max(2000), history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).default([]), language: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const user = await getUserById(ctx.user.id);
      const summary = await getUserCarbonSummary(ctx.user.id);
      const systemPrompt = `You are ReBon AI, an intelligent carbon reduction coach. Help users understand, track, and reduce their carbon footprint.\n\nUser: ${user?.name ?? "Climate Hero"} | Archetype: ${user?.archetypeLabel ?? "Not set"} | Weekly carbon: ${summary?.weeklyKg?.toFixed(1) ?? "0"} kg CO₂ | Streak: ${user?.currentStreak ?? 0} days\n\nBe concise, warm, and specific. Keep responses under 150 words unless asked for detail.`;
      const messages = [{ role: "system" as const, content: systemPrompt }, ...input.history.slice(-8), { role: "user" as const, content: input.message }];
      const lang = input.language ?? user?.preferredLanguage ?? "en";
      const task = input.message.length > 200 ? "deep_analysis" : "coach_response";
      const response = await routeAI({ task, messages, language: lang, maxTokens: 512 });
      return { content: response.content, provider: response.provider, latencyMs: response.latencyMs };
    }),
});
