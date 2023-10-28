import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const leaderBoardRouter = createTRPCRouter({
  getLeaderBoard: publicProcedure.query(async ({ ctx }) => {
    const res: { winnerName: string; countOf: number }[] | undefined = await ctx
      .prisma.$queryRaw`SELECT U.name           winnerName,
    COUNT(U.name) AS countOf
FROM Game G
      JOIN User U ON G.winner = U.id
WHERE G.gameState = 'over'
GROUP BY U.name
ORDER BY countOf DESC;`;
    return res;
  }),
});
