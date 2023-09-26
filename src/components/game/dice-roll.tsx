import { faDiceOne } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { api } from "~/utils/api";
import { ScoreCard } from "./score-card";

export function DiceRoll() {
  const router = useRouter();
  const { data: dice, refetch } = api.game.getDiceRoll.useQuery({
    gameId: router.query.gid as string,
  });
  const { mutate, error, data, isLoading } = api.game.rollDice.useMutation({
    // async onMutate() {

    // },
    onError() {
      toast.error("Error starting game");
    },
    async onSuccess() {
      toast.success("Game created successfully");
      await refetch();
    },
  });

  const handleRollDice = () => {
    mutate({ gameId: router.query.gid as string });
  };

  return (
    <>
      <div>
        <FontAwesomeIcon icon={faDiceOne} className="bg-black text-white" />
      </div>
      <div>
        <FontAwesomeIcon icon={faDiceOne} className="bg-black text-white" />
      </div>
      <div>
        <FontAwesomeIcon icon={faDiceOne} className="bg-black text-red-500" />
      </div>
      <div>
        <FontAwesomeIcon
          icon={faDiceOne}
          className="bg-black text-yellow-500"
        />
      </div>
      <div>
        <FontAwesomeIcon icon={faDiceOne} className="bg-black text-green-500" />
      </div>
      <div>
        <FontAwesomeIcon icon={faDiceOne} className="bg-black text-blue-500" />
      </div>
      <button onClick={handleRollDice}>Roll</button>
      <div>{JSON.stringify(dice)}</div>
    </>
  );
}
