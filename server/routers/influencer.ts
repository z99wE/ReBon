import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getCommunityFeed, getTopInfluencers, likeFeedItem } from "../db";

export const influencerRouter = router({
  topInfluencers: publicProcedure.query(() => getTopInfluencers(10)),
  feed: publicProcedure.input(z.object({ limit: z.number().default(30) })).query(async ({ input }) => getCommunityFeed(input.limit)),
  like: protectedProcedure.input(z.object({ feedItemId: z.string() })).mutation(async ({ input }) => { await likeFeedItem(input.feedItemId); return { success: true }; }),
});
