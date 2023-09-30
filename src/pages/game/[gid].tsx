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
  const { data: game, isFetchedAfterMount } = api.game.byId.useQuery(
    {
      id: router.query.gid as string,
    },
    { enabled: !!router.query.gid }
  );
  const { mutateAsync, error, data, isLoading } = api.game.joinGame.useMutation(
    {
      onError() {
        toast.error("Error joining game");
      },
      onSuccess() {
        toast.success("Successfully joined game");
      },
    }
  );
  const { data: session } = useSession();

  const joinGame = async () => {
    if (
      game?.id &&
      !Object.values(game)?.find((value) => value === session?.user?.id)
    ) {
      await mutateAsync({ gameId: `${game?.id}` });
    }
  };

  useEffect(() => {
    void joinGame();
  }, [isFetchedAfterMount]);

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
