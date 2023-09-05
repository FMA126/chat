import { exampleRouter } from "~/server/api/routers/example";
import { createTRPCRouter } from "~/server/api/trpc";
import { gameRouter } from "~/server/api/routers/game";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  game: gameRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
