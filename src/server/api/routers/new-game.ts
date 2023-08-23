import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

export const newGameRouter = createTRPCRouter({
  createNewGame: protectedProcedure.mutation(async ({ ctx }) => {
    const newGame = await ctx.prisma.game.create({
      data: {
        playerOne: ctx.session.user.id,
        playerTwo: null,
        playerThree: null,
        playerFour: null,
        playerFive: null,
        gameState: null,
        winner: null,
      },
    });
    const game =
      newGame &&
      (await ctx.prisma.game.findUnique({ where: { id: newGame.id } }));
    return game;
  }),
});
