import { TRPCClientError } from "@trpc/client";
import { useRouter } from "next/router";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import { AuthShowcase } from "..";

export default function NewGame() {
  const router = useRouter();
  const utils = api.useContext();
  const { mutate, error, data, isLoading } = api.game.createNewGame.useMutation(
    {
      // async onMutate() {

      // },
      onError() {
        toast.error("Error starting game");
      },
      onSuccess() {
        toast.success("Game created successfully");
      },
    }
  );

  if (error) {
    return <AuthShowcase />;
  }

  if (data) {
    void router.push(`game/${data.id}`);
  }

  const handleStartGame = () => {
    mutate();
  };

  return (
    <div>
      <button
        className="rounded-full bg-white/10 px-10 py-3 font-semibold text-white no-underline transition hover:bg-white/20"
        onClick={handleStartGame}
      >
        Start Game
      </button>
      {isLoading ? <div>loading...</div> : <div>{data?.id}</div>}
    </div>
  );
}
