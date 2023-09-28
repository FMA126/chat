import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

import { GameWindow } from "~/components/game/game-window";

import { useEffect } from "react";

import { AuthShowcase } from "..";
import { GameLayout } from "~/components/layout/game-layout";
import toast from "react-hot-toast";

export default function Game() {
  const router = useRouter();
  const { data: game } = api.game.byId.useQuery(
    {
      id: router.query.gid as string,
    },
    { enabled: !!router.query.gid }
  );
  const { mutate, error, data, isLoading } =
    api.game.createNewScoreCard.useMutation({
      onError() {
        toast.error("Error creating score card");
      },
      onSuccess() {
        toast.success("successfully created score card");
      },
    });
  const { data: session } = useSession();

  useEffect(() => {
    if (
      game?.id &&
      game?.playerOne !== session?.user?.id &&
      game?.playerTwo !== session?.user?.id &&
      game?.playerThree !== session?.user?.id &&
      game?.playerFour !== session?.user?.id &&
      game?.playerFive !== session?.user?.id
    ) {
      mutate({ gameId: `${game?.id}` });
    }
  }, [game?.id]);

  if (!session) {
    return (
      <GameLayout>
        <div className="flex h-screen flex-col items-center justify-center">
          <AuthShowcase />
        </div>
      </GameLayout>
    );
  }

  return (
    <>
      <GameLayout>
        <GameWindow />
      </GameLayout>
    </>
  );
}
