import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

import { GameWindow } from "~/components/game/game-window";

import { AuthShowcase } from "..";
import { GameLayout } from "~/components/layout/game-layout";
import toast from "react-hot-toast";
import { joinClassNames } from "~/utils/joinClassNames";
import { usePusher } from "~/lib/usePusherClient";
import { useEffect } from "react";

export default function Game() {
  const router = useRouter();
  const pusher = usePusher();
  const {
    data: game,
    isFetchedAfterMount,
    refetch: refetchGame,
  } = api.game.byId.useQuery(
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
    await mutateAsync({ gameId: `${game?.id}` });
    await refetchGame();
  };

  useEffect(() => {
    async function updateGame() {
      console.log("updateGame");
      await refetchGame();
    }

    const channel = game?.id && pusher.subscribe(`game:${game.id}`);
    channel && channel.bind("player-joined", updateGame);
    channel && channel.bind("new-dice-roll", updateGame);
    channel && channel.bind("new-score-card-entry", updateGame);

    return () => {
      channel && channel.unbind("player-joined", updateGame);
      channel && channel.unbind("new-dice-roll", updateGame);
      channel && channel.unbind("new-score-card-entry", updateGame);
      channel && channel.unsubscribe();
    };
  }, [pusher, game?.id, refetchGame]);

  if (!session) {
    return (
      <GameLayout>
        <div className="flex h-screen flex-col items-center justify-center">
          <AuthShowcase />
        </div>
      </GameLayout>
    );
  }

  if (!game || isLoading) {
    return (
      <GameLayout>
        <div className="flex h-screen flex-col items-center justify-center">
          ...loading
        </div>
      </GameLayout>
    );
  }

  if (
    game &&
    isFetchedAfterMount &&
    !Object.values(game)?.find((value) => value === session?.user?.id)
  ) {
    return (
      <GameLayout>
        <div className="flex h-screen flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-4">
            <button
              className={joinClassNames(
                "",
                "rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
              )}
              onClick={() => void joinGame()}
              disabled={isLoading}
            >
              Join Game
            </button>
          </div>
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
