import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";

const defaultGameSelect = Prisma.validator<Prisma.GameSelect>()({
  id: true,
});

export const gameRouter = createTRPCRouter({
  createNewGame: protectedProcedure.mutation(async ({ ctx }) => {
    const newGame = await ctx.prisma.game.create({
      data: {
        playerOne: ctx.session.user.id,
      },
      select: defaultGameSelect,
    });
    return newGame;
  }),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { id } = input;
      return ctx.prisma.game.findUnique({
        where: { id: +id },
        select: defaultGameSelect,
      });
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.game.findMany();
  }),
});
