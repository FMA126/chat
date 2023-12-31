import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";

import { GameWindow } from "~/components/game/game-window";

import { AuthShowcase } from "..";
import { GameLayout } from "~/components/layout/game-layout";
import toast from "react-hot-toast";
import { joinClassNames } from "~/utils/joinClassNames";
import { usePusher } from "~/lib/usePusherClient";
import { useEffect, useState } from "react";

export default function Game() {
  const router = useRouter();
  const pusher = usePusher();
  const utils = api.useContext();
  const [unseenMessages, setUnseenMessages] = useState<boolean>(false);
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
  const {
    mutate: mutateJoinGame,
    error: errorJoiningGame,
    data: joinGameData,
    isLoading,
  } = api.game.joinGame.useMutation({
    async onError(error) {
      toast.error(
        error.message === "Game room full"
          ? "Game room full"
          : error.message === "Game already started"
          ? "Game already started"
          : "Error joining game"
      );
      await router.push("/");
    },
    onSuccess() {
      toast.success("Successfully joined game");
    },
  });
  const { data: session } = useSession();

  const joinGame = () => {
    mutateJoinGame({ gameId: `${game?.id}` });
  };

  useEffect(() => {
    async function updateGame(data: { message: string }) {
      if (data.message === "new message") {
        await utils.game.getMessages.invalidate();
        setUnseenMessages(true);
      } else {
        await utils.game.invalidate();
      }
    }

    const channel = game?.id && pusher.subscribe(`chat`);

    channel && channel.bind(`player-joined:game:${game.id}`, updateGame);
    channel && channel.bind(`new-dice-roll:game:${game.id}`, updateGame);
    channel && channel.bind(`new-score-card-entry:game:${game.id}`, updateGame);
    channel && channel?.bind(`new-message:game:${game.id}`, updateGame);

    return () => {
      channel && channel.unbind(`player-joined:game:${game.id}`, updateGame);
      channel && channel.unbind(`new-dice-roll:game:${game.id}`, updateGame);
      channel &&
        channel.unbind(`new-score-card-entry:game:${game.id}`, updateGame);
      channel && channel?.unbind(`new-message:game:${game.id}`, updateGame);
      pusher.unsubscribe("chat");
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
        <GameWindow
          setUnseenMessages={setUnseenMessages}
          unseenMessages={unseenMessages}
        />
      </GameLayout>
    </>
  );
}
