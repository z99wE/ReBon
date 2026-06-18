import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { createCollective, createFeedItem, getCollectiveById, getCollectiveByInviteCode, getPublicCollectives, getUserCollectives, joinCollective } from "../db";
import { routeAI } from "../services/aiRouter";
import { parseAIJson } from "./helpers";
import { nanoid } from "nanoid";

export const collectiveRouter = router({
  create: protectedProcedure.input(z.object({ name: z.string().min(2).max(128), description: z.string().optional() })).mutation(async ({ ctx, input }) => {
    const inviteCode = nanoid(8).toUpperCase();
    const collective = await createCollective(input.name, input.description, ctx.user.id, inviteCode);
    await createFeedItem({ userId: ctx.user.id, type: "collective_join", title: `Created collective: ${input.name}`, body: `Join with code: ${inviteCode}`, isInfluencer: (ctx.user.influenceScore ?? 0) > 100, amplified: false });
    return collective;
  }),
  join: protectedProcedure.input(z.object({ inviteCode: z.string() })).mutation(async ({ ctx, input }) => {
    const collective = await getCollectiveByInviteCode(input.inviteCode.toUpperCase());
    if (!collective) throw new TRPCError({ code: "NOT_FOUND", message: "Invalid invite code" });
    await joinCollective(collective.id, ctx.user.id);
    return collective;
  }),
  myCollectives: protectedProcedure.query(async ({ ctx }) => getUserCollectives(ctx.user.id)),
  publicList: publicProcedure.query(() => getPublicCollectives(20)),
  whatIf: protectedProcedure.input(z.object({ collectiveId: z.string(), scenario: z.string() })).mutation(async ({ ctx, input }) => {
    const collective = await getCollectiveById(input.collectiveId);
    if (!collective) throw new TRPCError({ code: "NOT_FOUND" });
    const response = await routeAI({ task: "deep_analysis", messages: [{ role: "system", content: "You are ReBon AI. Calculate collective carbon impact of a what-if scenario." }, { role: "user", content: `Collective: ${collective.name}. Members: ${collective.memberCount}. Scenario: ${input.scenario}. Return JSON: { perMemberWeeklyKg: number, totalWeeklyKg: number, equivalent: string, insight: string }` }], maxTokens: 512 });
    let result = { perMemberWeeklyKg: 0, totalWeeklyKg: 0, equivalent: "", insight: "" };
    result = parseAIJson(response.content, result);
    return { ...result, collective };
  }),
});
