import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from "~/server/api/trpc";
import { prisma } from "~/server/db";
import { pusherServerClient } from "~/server/pusher";
import { randomDiceRoll } from "~/utils/randomDiceRoll";

export const gameRouter = createTRPCRouter({
  createNewGame: protectedProcedure.mutation(async ({ ctx }) => {
    const newGame = await ctx.prisma.game.create({
      data: {
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

      const gameRes = await ctx.prisma.game.findFirstOrThrow({
        where: { id: +id },
        include: { scoreCards: { include: { user: true } } },
      });

      return gameRes;
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
        const updatedGame = await ctx.prisma.game.update({
          where: {
            id: +input.gameId,
          },
          data: {
            [`${nullPlayer[0]}`]: ctx.session.user.id,
          },
        });
        await ctx.prisma.scoreCard.create({
          data: {
            gameId: game.id,
            userId: ctx.session.user.id,
          },
        });
        console.log("join game", game, playerList, nullPlayer);
        await pusherServerClient.trigger(
          `chat`,
          `player-joined:game:${input.gameId}`,
          {
            message: "new player joined",
          }
        );
        return updatedGame;
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

      await pusherServerClient.trigger(
        "chat",
        `new-dice-roll:game:${input.gameId}`,
        { message: "new dice roll" }
      );

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
      return await ctx.prisma.scoreCard.create({
        data: {
          gameId: +gameId,
          userId: ctx.session.user.id,
        },
      });
    }),
});
