import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/router";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import { AuthShowcase } from "..";
import { GameLayout } from "~/components/layout/game-layout";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDice } from "@fortawesome/free-solid-svg-icons";

export default function NewGame() {
  const router = useRouter();
  const {
    mutate: mutateNewGame,
    mutateAsync: mutateGameAsync,
    error: gameError,
    data: gameData,
    isLoading: isGameLoading,
  } = api.game.createNewGame.useMutation({});

  const handleStartGame = async () => {
    await mutateGameAsync();
  };

  const { data: session } = useSession();

  if (!session) {
    return (
      <GameLayout>
        <div className="flex h-screen flex-col items-center justify-center">
          <AuthShowcase />
        </div>
      </GameLayout>
    );
  }

  if (isGameLoading || isGameLoading) {
    return (
      <GameLayout>
        <div className="flex h-screen flex-col items-center justify-center">
          <button
            className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
            onClick={() => void handleStartGame()}
          >
            <FontAwesomeIcon
              icon={faDice}
              spin
              className="h-14 w-14 text-[#319800]"
            />
          </button>
        </div>
      </GameLayout>
    );
  }

  if (gameError) {
    return (
      <GameLayout>
        <div className="flex h-screen flex-col items-center justify-center">
          <AuthShowcase />
        </div>
      </GameLayout>
    );
  }

  if (gameData) {
    void router.push(`game/${gameData.id}`);
  }

  return (
    <GameLayout>
      <div className="flex h-screen flex-col items-center justify-center">
        <button
          className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
          onClick={() => void handleStartGame()}
        >
          Start Game
        </button>
        {isGameLoading ? <div>loading...</div> : <div>{gameData?.id}</div>}
      </div>
    </GameLayout>
  );
}
