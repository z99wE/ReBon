import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getUserById, updateUserProfile } from "../db";
import { routeAI } from "../services/aiRouter";
import { computeArchetype, parseAIJson } from "./helpers";

export const userRouter = router({
  profile: protectedProcedure.query(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id);
    if (!user) throw new TRPCError({ code: "NOT_FOUND" });
    return user;
  }),
  completeOnboarding: protectedProcedure
    .input(z.object({ answers: z.record(z.string(), z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const archetype = computeArchetype(input.answers as Record<string, unknown>);
      const roadmapResponse = await routeAI({
        task: "deep_analysis",
        messages: [
          { role: "system", content: "You are ReBon AI. Generate a 90-day carbon roadmap as JSON. Return only valid JSON." },
          { role: "user", content: `Archetype: ${archetype.label}. Return JSON: { phases: [{ phase: 1, title: string, actions: [{ action: string, carbonSavingKg: number, difficulty: string }] }] }` },
        ],
        maxTokens: 1024,
      });
      let roadmap = null;
      roadmap = parseAIJson(roadmapResponse.content, { phases: [] });
      await updateUserProfile(ctx.user.id, { archetype: archetype.id as any, archetypeLabel: archetype.label, onboardingCompleted: true, onboardingAnswers: input.answers as any, roadmap: roadmap as any });
      return { archetype, roadmap };
    }),
  updateLanguage: protectedProcedure.input(z.object({ language: z.string().max(10) })).mutation(async ({ ctx, input }) => { await updateUserProfile(ctx.user.id, { preferredLanguage: input.language }); return { success: true }; }),
});
