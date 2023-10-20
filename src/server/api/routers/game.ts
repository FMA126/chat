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
              user: { select: { id: true, name: true } },
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
      }
      const lockMap = new Map();
      const locks = entry
        ?.filter(
          (be) =>
            be.redLock === 1 ||
            be.yellowLock === 1 ||
            be.blueLock === 1 ||
            be.greenLock === 1 ||
            be.penaltyFour === 1
        )
        .forEach((lock) => {
          if (Object.keys(lock)[0] === "penaltyFour") {
            lockMap.set("penaltyLock", 1);
          } else {
            lockMap.set(Object.keys(lock)[0], Object.values(lock)[0]);
          }
        });

      if (lockMap.size > 0) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const dataMap = Object.fromEntries(lockMap.entries());
        await ctx.prisma.scoreCard.updateMany({
          where: { gameId: +gameId },
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          data: dataMap,
        });
      }

      const game = await ctx.prisma.game.findFirst({
        where: { id: +gameId },
        include: {
          diceRolls: { orderBy: { id: "desc" } },
          scoreCards: { include: { scoreCardEntries: true } },
        },
      });
      const playerList = [
        game?.playerOne,
        game?.playerTwo,
        game?.playerThree,
        game?.playerFour,
        game?.playerFive,
      ].filter((player) => player);
      const numberColorsLocked =
        [
          game?.scoreCards[0]?.redLock,
          game?.scoreCards[0]?.yellowLock,
          game?.scoreCards[0]?.blueLock,
          game?.scoreCards[0]?.greenLock,
        ]?.filter((lock) => !!lock)?.length ?? 0;
      const isPenaltyLocked = !!game?.scoreCards[0]?.penaltyLock;

      const playerIdsCompletedTurn = new Set<string>();
      const check = game?.scoreCards
        ?.map((sc) => sc.scoreCardEntries)
        .flat()
        ?.filter((scEntry) => scEntry.diceRollId === game?.diceRolls[0]?.id);
      check?.forEach(({ userId }) => {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        playerIdsCompletedTurn.add(userId as string);
      });

      const haveAllPlayersMoved =
        playerIdsCompletedTurn.size === playerList.length;
      const areTwoRowsLockedOut = numberColorsLocked >= 2;
      const isGameOver =
        haveAllPlayersMoved && (areTwoRowsLockedOut || isPenaltyLocked);

      if (isGameOver) {
        const totalPlayerScoreCard = async ({
          gameId,
          scoreCardId,
        }: {
          gameId: number;
          scoreCardId: number;
        }) => {
          const redRows = await ctx.prisma.scoreCardEntry.findMany({
            where: {
              scoreCardId,
              OR: [{ redRow: { not: null } }, { redLock: { not: null } }],
            },
          });
          const yellowRows = await ctx.prisma.scoreCardEntry.findMany({
            where: {
              scoreCardId,
              OR: [{ yellowRow: { not: null } }, { yellowLock: { not: null } }],
            },
          });
          const blueRows = await ctx.prisma.scoreCardEntry.findMany({
            where: {
              scoreCardId,
              OR: [{ blueRow: { not: null } }, { blueLock: { not: null } }],
            },
          });
          const greenRows = await ctx.prisma.scoreCardEntry.findMany({
            where: {
              scoreCardId,
              OR: [{ greenRow: { not: null } }, { greenLock: { not: null } }],
            },
          });
          const penalties = await ctx.prisma.scoreCardEntry.findMany({
            where: {
              scoreCardId,
              OR: [
                { penaltyOne: { not: null } },
                { penaltyTwo: { not: null } },
                { penaltyThree: { not: null } },
                { penaltyFour: { not: null } },
              ],
            },
          });
          const scoreList = [0, 1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 66, 78];
          await ctx.prisma.scoreCard.update({
            where: { id: scoreCardId },
            data: {
              redRowTotal: scoreList[redRows.length],
              yellowRowTotal: scoreList[yellowRows.length],
              blueRowTotal: scoreList[blueRows.length],
              greenRowTotal: scoreList[greenRows.length],
              penaltyTotal: penalties.length * 5,
              total:
                (scoreList[redRows.length] ?? 0) +
                (scoreList[yellowRows.length] ?? 0) +
                (scoreList[blueRows.length] ?? 0) +
                (scoreList[greenRows.length] ?? 0) -
                (penalties.length * 5 ?? 0),
            },
          });

          const winnerList = await ctx.prisma.scoreCard.findMany({
            where: { gameId: +gameId },
            orderBy: { total: "desc" },
          });

          await ctx.prisma.game.update({
            where: { id: +gameId },
            data: { gameState: "over", winner: winnerList[0]?.userId },
          });
        };

        await Promise.all(
          game?.scoreCards?.map(
            async (sc) =>
              await totalPlayerScoreCard({
                gameId: +gameId,
                scoreCardId: sc.id,
              })
          ) ?? []
        );
      }

      await pusherServerClient.trigger(
        "chat",
        `new-score-card-entry:game:${gameId}`,
        { message: "new card entry" }
      );
    }),
  createMessage: protectedProcedure
    .input(z.object({ gameId: z.string(), message: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { gameId, message } = input;
      return await ctx.prisma.message.create({
        data: {
          gameId: +gameId,
          userId: ctx.session.user.id,
          message,
        },
      });
    }),
});
