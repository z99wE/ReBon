import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ARCHETYPES, calculateEquivalents, calculateInfluenceScore, ONBOARDING_QUESTIONS } from "../shared/carbonData";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  completeChallenge, createChallenge, createCollective, createFeedItem,
  getCommunityFeed, getLatestPeerSnapshot, getLeaderboard, getOrCreateActiveSeason,
  getPublicCollectives, getTopInfluencers, getUserActivities, getUserCarbonSummary,
  getUserById, getUserChallenges, getUserCollectives, getUserStories,
  getArchetypePeers, getUserLiveStats, incrementStoryShares, joinCollective, likeFeedItem,
  logActivity, savePeerSnapshot, saveStory, updateUserInfluenceScore,
  updateUserProfile, upsertLeaderboardEntry,
} from "./db";
import { upsertUser } from "./db";
import { routeAI, transcribeWithDeepgram } from "./services/aiRouter";
import { agentsRouter } from "./routers/agents";
import { createOtpSession, sendEmailOtp, sendPhoneOtp, verifyOtpSession } from "./services/otpAuth";
import { SignJWT } from "jose";
import { Buffer } from "buffer";
import { ENV } from "./_core/env";
import { nanoid } from "nanoid";

/** Strip markdown code fences and extract JSON from AI responses */
function parseAIJson<T>(content: string, fallback: T): T {
  try { return JSON.parse(content); } catch { /* try stripping markdown */ }
  const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (match) { try { return JSON.parse(match[1].trim()); } catch { /* fall through */ } }
  // Try to find first [ or { and parse from there
  const arrStart = content.indexOf('[');
  const objStart = content.indexOf('{');
  const start = arrStart !== -1 && (objStart === -1 || arrStart < objStart) ? arrStart : objStart;
  if (start !== -1) { try { return JSON.parse(content.slice(start)); } catch { /* fall through */ } }
  return fallback;
}
function getWeekNumber(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.ceil(((date.getTime() - start.getTime()) / 86400000 + start.getDay() + 1) / 7);
}

function computeArchetype(answers: Record<string, unknown>): { id: string; label: string } {
  const scores: Record<string, number> = { urban_commuter: 0, conscious_consumer: 0, energy_heavy: 0, eco_pioneer: 0, suburban_family: 0, digital_nomad: 0 };
  ONBOARDING_QUESTIONS.forEach(q => {
    const answer = answers[q.id] as string; if (!answer) return;
    const option = q.options.find(o => o.value === answer); if (!option) return;
    Object.entries(option.score).forEach(([arch, pts]) => { scores[arch] = (scores[arch] ?? 0) + pts; });
  });
  const topArchetype = Object.entries(scores).sort(([, a], [, b]) => b - a)[0];
  const id = topArchetype[0] as keyof typeof ARCHETYPES;
  return { id, label: ARCHETYPES[id]?.label ?? id };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    sendOtp: publicProcedure
      .input(z.object({ identifier: z.string().min(3).max(320), identifierType: z.enum(["email", "phone"]) }))
      .mutation(async ({ input }) => {
        if (input.identifierType === "email") {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.identifier)) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid email address" });
        } else {
          if (!/^\+?[1-9]\d{6,14}$/.test(input.identifier.replace(/\s/g, ""))) throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid phone number" });
        }
        const { otp, rateLimited } = await createOtpSession(input.identifier, input.identifierType);
        if (rateLimited) throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Please wait 60 seconds before requesting a new code" });
        let preview: string | undefined;
        if (input.identifierType === "email") { const r = await sendEmailOtp(input.identifier, otp); preview = r.preview; }
        else { const r = await sendPhoneOtp(input.identifier, otp); preview = r.preview; }
        return { sent: true, preview: process.env.NODE_ENV !== "production" ? preview : undefined };
      }),
    verifyOtp: publicProcedure
      .input(z.object({ identifier: z.string().min(3).max(320), otp: z.string().length(6).regex(/^\d{6}$/, "OTP must be 6 digits"), name: z.string().min(1).max(64).optional() }))
      .mutation(async ({ input, ctx }) => {
        const result = await verifyOtpSession(input.identifier, input.otp);
        if (!result.success) throw new TRPCError({ code: "UNAUTHORIZED", message: result.error });
        const openId = `otp:${input.identifier.toLowerCase()}`;
        const isEmail = input.identifier.includes("@");
        await upsertUser({ openId, name: input.name || (isEmail ? input.identifier.split("@")[0] : input.identifier), email: isEmail ? input.identifier.toLowerCase() : undefined, loginMethod: isEmail ? "email_otp" : "phone_otp", lastSignedIn: new Date() });
        const secret = Buffer.from(ENV.cookieSecret, 'utf-8');
        const displayName = input.name || (isEmail ? input.identifier.split("@")[0] : input.identifier);
        const token = await new SignJWT({ openId, appId: ENV.appId, name: displayName }).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("30d").sign(secret);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
        return { success: true };
      }),
  }),

  user: router({
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
  }),

  activities: router({
    log: protectedProcedure
      .input(z.object({ category: z.enum(["transport", "meals", "energy", "shopping", "other"]), subcategory: z.string(), label: z.string(), carbonKg: z.number().positive(), quantity: z.number().optional(), unit: z.string().optional(), inputMethod: z.enum(["tap", "voice", "manual"]).default("tap"), voiceTranscript: z.string().optional(), notes: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        await logActivity({ ...input, userId: ctx.user.id });
        await createFeedItem({ userId: ctx.user.id, type: "activity", title: `Logged: ${input.label}`, body: `${input.carbonKg.toFixed(2)} kg CO₂`, carbonKg: input.carbonKg, isInfluencer: (ctx.user.influenceScore ?? 0) > 100 });
        // Use live DB counts so influence score reflects the user's full history, not the stale auth snapshot
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
        const parseResponse = await routeAI({ task: "fast_inference", messages: [{ role: "system", content: "You are a carbon activity parser. Extract carbon activities from user speech. Return JSON array: [{ category, subcategory, label, carbonKg, quantity, unit }]. If nothing found, return []." }, { role: "user", content: transcript }], maxTokens: 512 });
        let parsedActivities: any[] = [];
        parsedActivities = parseAIJson<any[]>(parseResponse.content, []);
        return { transcript, activities: parsedActivities };
      }),
    list: protectedProcedure.input(z.object({ limit: z.number().default(50) })).query(async ({ ctx, input }) => getUserActivities(ctx.user.id, input.limit)),
    summary: protectedProcedure.query(async ({ ctx }) => getUserCarbonSummary(ctx.user.id)),
  }),

  challenges: router({
    generate: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await getUserById(ctx.user.id);
      if (!user) throw new TRPCError({ code: "NOT_FOUND" });
      const now = new Date(); const weekNumber = getWeekNumber(now);
      const existing = await getUserChallenges(ctx.user.id, weekNumber, now.getFullYear());
      if (existing.length >= 3) return existing;
      const trendingTopics = ["EV adoption surge", "plant-based diet movement", "solar energy boom", "fast fashion impact", "flight shame movement"];
      const trending = trendingTopics[Math.floor(Math.random() * trendingTopics.length)];
      const response = await routeAI({ task: "challenge_generate", messages: [{ role: "system", content: "You are ReBon AI. Generate 3 personalized weekly carbon challenges as JSON." }, { role: "user", content: `Archetype: ${user.archetypeLabel ?? "General"}. Trending: ${trending}. Return JSON array: [{ title, description, category, difficulty, carbonSavingKg, pointsReward, trendingTopic }]` }], maxTokens: 1024 });
      const challengeData: any[] = parseAIJson<any[]>(response.content, []);
      const validCategories = ["transport","meals","energy","shopping","lifestyle"];
      const validDifficulties = ["easy","medium","hard"];
      for (const c of challengeData.slice(0, 3)) {
        const rawCat = (c.category ?? "lifestyle").toLowerCase();
        const category = validCategories.find(v => rawCat.includes(v)) ?? "lifestyle";
        const rawDiff = (c.difficulty ?? "medium").toLowerCase();
        const difficulty = validDifficulties.find(v => rawDiff.includes(v)) ?? "medium";
        await createChallenge({ userId: ctx.user.id, title: c.title ?? "Weekly Challenge", description: c.description ?? "", category: category as any, difficulty: difficulty as any, carbonSavingKg: typeof c.carbonSavingKg === 'number' ? c.carbonSavingKg : 5, pointsReward: typeof c.pointsReward === 'number' ? c.pointsReward : 100, weekNumber, year: now.getFullYear(), aiProvider: response.provider, trendingTopic: c.trendingTopic ?? trending });
      }
      return getUserChallenges(ctx.user.id, weekNumber, now.getFullYear());
    }),
    list: protectedProcedure.query(async ({ ctx }) => { const now = new Date(); return getUserChallenges(ctx.user.id, getWeekNumber(now), now.getFullYear()); }),
    complete: protectedProcedure.input(z.object({ challengeId: z.number() })).mutation(async ({ ctx, input }) => {
      const challenge = await completeChallenge(input.challengeId, ctx.user.id);
      await createFeedItem({ userId: ctx.user.id, type: "challenge_complete", title: `Completed: ${challenge.title}`, body: `Saved ${challenge.carbonSavingKg} kg CO₂ · +${challenge.pointsReward} pts`, carbonKg: challenge.carbonSavingKg, isInfluencer: (ctx.user.influenceScore ?? 0) > 100 });
      return { success: true };
    }),
  }),

  stories: router({
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
    share: protectedProcedure.input(z.object({ storyId: z.number() })).mutation(async ({ input }) => { await incrementStoryShares(input.storyId); return { success: true }; }),
  }),

  influencer: router({
    topInfluencers: publicProcedure.query(() => getTopInfluencers(10)),
    feed: publicProcedure.input(z.object({ limit: z.number().default(30) })).query(async ({ input }) => getCommunityFeed(input.limit)),
    like: protectedProcedure.input(z.object({ feedItemId: z.number() })).mutation(async ({ input }) => { await likeFeedItem(input.feedItemId); return { success: true }; }),
  }),

  mirror: router({
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
  }),

  collective: router({
    create: protectedProcedure.input(z.object({ name: z.string().min(2).max(128), description: z.string().optional() })).mutation(async ({ ctx, input }) => {
      const inviteCode = nanoid(8).toUpperCase();
      const collective = await createCollective(input.name, input.description, ctx.user.id, inviteCode);
      await createFeedItem({ userId: ctx.user.id, type: "collective_join", title: `Created collective: ${input.name}`, body: `Join with code: ${inviteCode}` });
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
    whatIf: protectedProcedure.input(z.object({ collectiveId: z.number(), scenario: z.string() })).mutation(async ({ ctx, input }) => {
      const collective = await getCollectiveById(input.collectiveId);
      if (!collective) throw new TRPCError({ code: "NOT_FOUND" });
      const response = await routeAI({ task: "deep_analysis", messages: [{ role: "system", content: "You are ReBon AI. Calculate collective carbon impact of a what-if scenario." }, { role: "user", content: `Collective: ${collective.name}. Members: ${collective.memberCount}. Scenario: ${input.scenario}. Return JSON: { perMemberWeeklyKg: number, totalWeeklyKg: number, equivalent: string, insight: string }` }], maxTokens: 512 });
      let result = { perMemberWeeklyKg: 0, totalWeeklyKg: 0, equivalent: "", insight: "" };
      result = parseAIJson(response.content, result);
      return { ...result, collective };
    }),
  }),

  leaderboard: router({
    current: publicProcedure.query(async () => {
      const season = await getOrCreateActiveSeason();
      if (!season) return { season: null, entries: [] };
      const entries = await getLeaderboard(season.id, 50);
      return { season, entries };
    }),
  }),

  agents: agentsRouter,
  assistant: router({
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
  }),
});

function getCollectiveByInviteCode(code: string) {
  const { getCollectiveByInviteCode: fn } = require("./db");
  return fn(code);
}

function getCollectiveById(id: number) {
  const { getCollectiveById: fn } = require("./db");
  return fn(id);
}

export type AppRouter = typeof appRouter;
