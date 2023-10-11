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
        include: {
          scoreCards: {
            include: {
              user: true,
              scoreCardEntries: { orderBy: { id: "desc" } },
            },
          },
          diceRolls: {
            include: { game: true },
            orderBy: { id: "desc" },
          },
        },
      });

      return gameRes;
    }),
  list: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.prisma.game.findMany();
  }),
  joinGame: protectedProcedure
    .input(z.object({ gameId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { gameId } = input;
      const game = await prisma.game.findFirstOrThrow({
        where: { id: +gameId },
      });
      const numberOfDiceRolls = await prisma.diceRoll.count({
        where: { gameId: +gameId },
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
      if (numberOfDiceRolls) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Game already started",
        });
      }
      if (!nullPlayer) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Game room full",
        });
      }
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
        await pusherServerClient.trigger(
          `chat`,
          `player-joined:game:${input.gameId}`,
          {
            message: "new player joined",
          }
        );
        return updatedGame;
      }
      throw new TRPCError({
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
        orderBy: { createdAt: "desc" },
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
  createScoreCardEntry: protectedProcedure
    .input(
      z.object({
        gameId: z.string(),
        scoreCardId: z.number(),
        diceRollId: z.number(),
        isFinalEntry: z.boolean(),
        entry: z.array(
          z.object({
            redRow: z.number().optional(),
            blueRow: z.number().optional(),
            yellowRow: z.number().optional(),
            greenRow: z.number().optional(),
            redLock: z.number().optional(),
            blueLock: z.number().optional(),
            yellowLock: z.number().optional(),
            greenLock: z.number().optional(),
            penaltyOne: z.number().optional(),
            penaltyTwo: z.number().optional(),
            penaltyThree: z.number().optional(),
            penaltyFour: z.number().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { gameId, scoreCardId, entry, diceRollId } = input;
      const batchEntry = entry.map((e) => ({
        scoreCardId,
        diceRollId,
        userId: ctx.session.user.id,
        ...e,
      }));
      if (entry.length === 0) {
        await ctx.prisma.scoreCardEntry.create({
          data: {
            scoreCardId,
            diceRollId,
            userId: ctx.session.user.id,
            pass: true,
          },
        });
      } else {
        await ctx.prisma.scoreCardEntry.createMany({ data: [...batchEntry] });
        const mapLock = batchEntry.find(
          (e) =>
            e.redLock === 1 ||
            e.yellowLock === 1 ||
            e.blueLock === 1 ||
            e.greenLock === 1
        );
        if (mapLock) {
          await ctx.prisma.scoreCard.updateMany({
            where: { gameId: +gameId },
            data: mapLock.redLock
              ? { redLock: 1 }
              : mapLock.yellowLock
              ? { yellowLock: 1 }
              : mapLock.blueLock
              ? { blueLock: 1 }
              : mapLock.redLock
              ? { redLock: 1 }
              : {},
          });
        }
      }

      await pusherServerClient.trigger(
        "chat",
        `new-score-card-entry:game:${gameId}`,
        { message: "new card entry" }
      );
    }),
});
