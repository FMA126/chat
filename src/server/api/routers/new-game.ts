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
      },
    });
    const game =
      newGame &&
      (await ctx.prisma.game.findUnique({ where: { id: newGame.id } }));
    return game;
  }),
});
