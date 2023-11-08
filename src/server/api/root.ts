import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";
import { gameRouter } from "~/server/api/routers/game";
import { leaderBoardRouter } from "./routers/leader-board";
import { settingsRouter } from "./routers/settings";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  game: gameRouter,
  leaderBoard: leaderBoardRouter,
  settings: settingsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
