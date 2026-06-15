import { systemRouter } from "./_core/systemRouter";
import { router } from "./_core/trpc";
import { authRouter } from "./routers/auth";
import { userRouter } from "./routers/user";
import { activitiesRouter } from "./routers/activities";
import { challengesRouter } from "./routers/challenges";
import { storiesRouter } from "./routers/stories";
import { influencerRouter } from "./routers/influencer";
import { mirrorRouter } from "./routers/mirror";
import { collectiveRouter } from "./routers/collective";
import { leaderboardRouter } from "./routers/leaderboard";
import { agentsRouter } from "./routers/agents";
import { assistantRouter } from "./routers/assistant";

export const appRouter = router({
  system: systemRouter,
  auth: authRouter,
  user: userRouter,
  activities: activitiesRouter,
  challenges: challengesRouter,
  stories: storiesRouter,
  influencer: influencerRouter,
  mirror: mirrorRouter,
  collective: collectiveRouter,
  leaderboard: leaderboardRouter,
  agents: agentsRouter,
  assistant: assistantRouter,
});

export type AppRouter = typeof appRouter;
