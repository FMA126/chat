import { Prisma } from "@prisma/client";
import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { randomDiceRoll } from "~/utils/randomDiceRoll";

export const gameRouter = createTRPCRouter({
  createNewGame: protectedProcedure.mutation(async ({ ctx }) => {
    const newGame = await ctx.prisma.game.create({
      data: {
        playerOne: ctx.session.user.id,
        gameState: "active",
      },
      select: { id: true },
    });
    return newGame;
  }),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { id } = input;
      return await ctx.prisma.game.findUnique({
        where: { id: +id },
        include: { scoreCards: true },
      });
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.game.findMany();
  }),
  joinGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const game = await prisma.game.findFirstOrThrow({
        where: { id: +input.gameId },
      });
      const { playerOne, playerTwo, playerThree, playerFour, playerFive } =
        game;

      const playerList = [
        ["playerOne", playerOne],
        ["playerTwo", playerTwo],
        ["playerThree", playerThree],
        ["playerFour", playerFour],
        ["playerFive", playerFive],
      ];

      const nullPlayer = playerList.find((player) => player[1] === null);

      if (nullPlayer) {
        return await ctx.prisma.game.update({
          where: {
            id: +input.gameId,
          },
          data: {
            [`${nullPlayer[0]}`]: ctx.session.user.id,
          },
        });
      }
      return new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred, please try again later.",
      });
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
  createNewScoreCard: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { gameId } = input;
      console.log("gameId", input.gameId);
      return await ctx.prisma.scoreCard.create({
        data: {
          gameId: +gameId,
          userId: ctx.session.user.id,
        },
      });
    }),
});
