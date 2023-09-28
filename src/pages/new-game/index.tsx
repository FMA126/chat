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
  const utils = api.useContext();
  const {
    mutate: mutateNewGame,
    mutateAsync: mutateGameAsync,
    error: gameError,
    data: gameData,
    isLoading: isGameLoading,
  } = api.game.createNewGame.useMutation({
    // async onMutate() {
    // },
    // onError() {
    //   toast.error("Error starting game");
    // },
    // onSuccess() {
    //   toast.success("Game created successfully");
    // },
  });
  const {
    mutate: mutateScoreCard,
    mutateAsync: mutateScoreCardAsync,
    error,
    data,
    isLoading,
  } = api.game.createNewScoreCard.useMutation({
    // async onMutate() {
    // },
    // onError() {
    //   toast.error("Error creating score card");
    // },
    // onSuccess() {
    //   toast.success("Score card created successfully");
    // },
  });

  const handleStartGame = async () => {
    const gameRes = await mutateGameAsync();
    await mutateScoreCardAsync({ gameId: `${gameRes?.id}` });
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

  if (isGameLoading || isLoading) {
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

  if (error) {
    return (
      <GameLayout>
        <div className="flex h-screen flex-col items-center justify-center">
          <AuthShowcase />
        </div>
      </GameLayout>
    );
  }

  if (data) {
    void router.push(`game/${data.id}`);
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
        {isLoading ? <div>loading...</div> : <div>{data?.id}</div>}
      </div>
    </GameLayout>
  );
}
