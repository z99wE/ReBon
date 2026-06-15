import { publicProcedure, router } from "../_core/trpc";
import { getLeaderboard, getOrCreateActiveSeason } from "../db";

export const leaderboardRouter = router({
  current: publicProcedure.query(async () => {
    const season = await getOrCreateActiveSeason();
    if (!season) return { season: null, entries: [] };
    const entries = await getLeaderboard(season.id, 50);
    return { season, entries };
  }),
});
