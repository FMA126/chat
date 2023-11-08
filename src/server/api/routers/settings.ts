import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const settingsRouter = createTRPCRouter({
  getUserName: protectedProcedure.query(async ({ ctx }) => {
    const { session, prisma } = ctx;
    const userRes = await prisma.user.findFirstOrThrow({
      where: { id: session.user.id },
    });
    return { userName: userRes.name };
  }),
  updateUserName: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { session, prisma } = ctx;
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name: input.name },
      });
      return "user name updated";
    }),
});
