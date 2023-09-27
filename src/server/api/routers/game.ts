import { Prisma } from "@prisma/client";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { randomDiceRoll } from "~/utils/randomDiceRoll";

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
      return await ctx.prisma.game.findUnique({
        where: { id: +id },
        select: defaultGameSelect,
      });
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.game.findMany();
  }),
  rollDice: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const randomRoll = randomDiceRoll();
      const newDiceRoll = await ctx.prisma.diceRoll.create({
        data: {
          gameId: +input.gameId,
          userId: ctx.session.user.id,
          whiteOne: randomRoll.whiteOne,
          whiteTwo: randomRoll.whiteTwo,
          green: randomRoll.green,
          red: randomRoll.red,
          yellow: randomRoll.yellow,
          blue: randomRoll.blue,
        },
        select: {
          id: true,
          gameId: true,
          userId: true,
          whiteOne: true,
          whiteTwo: true,
          green: true,
          red: true,
          yellow: true,
          blue: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return newDiceRoll;
    }),
  getDiceRoll: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .query(async ({ input, ctx }) => {
      const { gameId } = input;
      return await ctx.prisma.diceRoll.findFirst({
        where: { gameId: +gameId },
        orderBy: { id: "desc" },
      });
    }),
});
