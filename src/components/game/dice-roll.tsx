import {
  faDice,
  faDiceFive,
  faDiceFour,
  faDiceOne,
  faDiceSix,
  faDiceThree,
  faDiceTwo,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { api } from "~/utils/api";

const diceNumber = (rolledNumber: number) => {
  switch (rolledNumber) {
    case 1:
      return faDiceOne;
    case 2:
      return faDiceTwo;
    case 3:
      return faDiceThree;
    case 4:
      return faDiceFour;
    case 5:
      return faDiceFive;
    case 6:
      return faDiceSix;
  }
};

export function DiceRoll() {
  const router = useRouter();
  const { data: dice, refetch } = api.game.getDiceRoll.useQuery({
    gameId: router.query.gid as string,
  });
  const { mutate, error, data, isLoading } = api.game.rollDice.useMutation({
    // async onMutate() {

    // },
    onError() {
      toast.error("Error rolling dice");
    },
    async onSuccess() {
      await refetch();
    },
  });

  const handleRollDice = () => {
    mutate({ gameId: router.query.gid as string });
  };
  if (error) return <div>Error getting dice</div>;

  if (isLoading) return <div>...loading</div>;

  if (!dice) return <div>...fetching dice roll</div>;

  // case "red":
  //   return "bg-[#e00000]";
  // case "yellow":
  //   return "bg-[#fdc800]";
  // case "green":
  //   return "bg-[#319800]";
  // case "blue":
  //   return "bg-[#326698]";

  return (
    <>
      <div className="flex">
        <div className="grow">
          <FontAwesomeIcon
            icon={diceNumber(dice[0]?.whiteOne)}
            className="h-14 w-14 bg-black text-white"
          />
        </div>
        <div className="grow">
          <FontAwesomeIcon
            icon={diceNumber(dice[0]?.whiteTwo)}
            className="h-14 w-14 bg-black text-white"
          />
        </div>
        <div className="grow">
          <FontAwesomeIcon
            icon={diceNumber(dice[0]?.red)}
            className="h-14 w-14 bg-white text-[#e00000]"
          />
        </div>
        <div className="grow">
          <FontAwesomeIcon
            icon={diceNumber(dice[0]?.yellow)}
            className="h-14 w-14 bg-white text-[#fdc800]"
          />
        </div>
        <div className="grow">
          <FontAwesomeIcon
            icon={diceNumber(dice[0]?.green)}
            className="h-14 w-14 bg-white text-[#319800]"
          />
        </div>
        <div className="grow">
          <FontAwesomeIcon
            icon={diceNumber(dice[0]?.blue)}
            className="h-14 w-14 bg-white text-[#326698]"
          />
        </div>
      </div>
      <button
        className="rounded-lg border-2 border-solid bg-cyan-300 px-4 py-2 text-cyan-900"
        onClick={handleRollDice}
      >
        <FontAwesomeIcon icon={faDice} className="h-6 w-6 pr-2 text-white" />
        Roll
      </button>
    </>
  );
}
