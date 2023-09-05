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
      <h2>New Game</h2>
      <button onClick={handleStartGame}>Start Game</button>
      {isLoading ? <div>loading...</div> : <div>{data?.id}</div>}
    </div>
  );
}
