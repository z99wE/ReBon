import { TRPCError } from "@trpc/server";
import { ARCHETYPES } from "../../shared/carbonData";
import { protectedProcedure, router } from "../_core/trpc";
import { getArchetypePeers, getLatestPeerSnapshot, getUserById, getUserCarbonSummary, savePeerSnapshot } from "../db";
import { routeAI } from "../services/aiRouter";
import { parseAIJson } from "./helpers";

export const mirrorRouter = router({
  compare: protectedProcedure.mutation(async ({ ctx }) => {
    const user = await getUserById(ctx.user.id);
    if (!user || !user.archetype) throw new TRPCError({ code: "BAD_REQUEST", message: "Complete onboarding first" });
    const summary = await getUserCarbonSummary(ctx.user.id);
    const peers = await getArchetypePeers(user.archetype, ctx.user.id);
    const userCarbon = summary?.weeklyKg ?? 0;
    const peerCarbons = peers.map(p => p.totalCarbonKg ?? 0);
    const peerAvg = peerCarbons.length > 0 ? peerCarbons.reduce((a, b) => a + b, 0) / peerCarbons.length : (ARCHETYPES[user.archetype as keyof typeof ARCHETYPES]?.weeklyAvgKg ?? 70);
    const below = peerCarbons.filter(c => c > userCarbon).length;
    const percentileRank = peerCarbons.length > 0 ? Math.round((below / peerCarbons.length) * 100) : 50;
    const snapshot = { userId: ctx.user.id, archetype: user.archetype, userCarbonKg: userCarbon, peerAvgKg: peerAvg, percentileRank, categoryBreakdown: summary?.weeklyByCategory as any ?? {}, peerCategoryBreakdown: {} as any };
    await savePeerSnapshot(snapshot);
    const insightResponse = await routeAI({ task: "fast_inference", messages: [{ role: "system", content: "You are ReBon AI. Generate 2 brief actionable insights based on peer comparison." }, { role: "user", content: `User: ${userCarbon.toFixed(1)} kg/week. Peer avg: ${peerAvg.toFixed(1)} kg/week. Percentile: ${percentileRank}th. Archetype: ${user.archetypeLabel}. Return JSON: { insights: [string, string] }` }], maxTokens: 256 });
    let insights = ["You're making progress!", "Keep tracking daily activities."];
    insights = parseAIJson<{ insights: string[] }>(insightResponse.content, { insights }).insights ?? insights;
    return { ...snapshot, insights, peerCount: peers.length };
  }),
  latest: protectedProcedure.query(async ({ ctx }) => getLatestPeerSnapshot(ctx.user.id)),
});
