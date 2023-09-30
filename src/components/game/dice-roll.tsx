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
import { useCallback } from "react";
import toast from "react-hot-toast";
import { api } from "~/utils/api";

export function DiceRoll() {
  const router = useRouter();
  const { data: dice, refetch } = api.game.getDiceRoll.useQuery({
    gameId: router.query.gid as string,
  });
  const { data: gameData } = api.game.byId.useQuery({
    id: router.query.gid as string,
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
  const diceNumber = useCallback((rolledNumber: number) => {
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
  }, []);

  const handleRollDice = () => {
    mutate({ gameId: router.query.gid as string });
  };

  if (error) return <div>Error getting dice</div>;

  if (isLoading)
    return (
      <>
        <div className="flex justify-center">
          <div className="flex max-w-2xl gap-2">
            <div className="">
              <FontAwesomeIcon
                icon={faDice}
                spin
                className="-black h-14 w-14 text-white"
              />
            </div>
            <div className="">
              <FontAwesomeIcon
                icon={faDice}
                spin
                className="h-14 w-14 text-white"
              />
            </div>
            <div className="">
              <FontAwesomeIcon
                icon={faDice}
                spin
                className="h-14 w-14 text-[#e00000]"
              />
            </div>
            <div className="">
              <FontAwesomeIcon
                icon={faDice}
                spin
                className="h-14 w-14 text-[#fdc800]"
              />
            </div>
            <div className="">
              <FontAwesomeIcon
                icon={faDice}
                spin
                className="h-14 w-14 text-[#319800]"
              />
            </div>
            <div className="">
              <FontAwesomeIcon
                icon={faDice}
                spin
                className="h-14 w-14 text-[#326698]"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center">
          <button
            className="rounded-lg border-2 border-solid bg-cyan-300 px-4 py-2 text-cyan-900 active:bg-cyan-100"
            onClick={handleRollDice}
            disabled={true}
          >
            <FontAwesomeIcon
              icon={faDice}
              spin
              className="h-6 w-6 pr-2 text-white"
            />
            <span>Roll</span>
          </button>
        </div>
      </>
    );

  if (!dice && gameData)
    return (
      <div className="flex flex-col items-center">
        <h2>Roll to start game</h2>
        <div>
          <span>with</span>
          <div>
            {gameData?.scoreCards?.map((card) => card?.user?.name).join(" and")}
          </div>
        </div>
        <button
          className="rounded-lg border-2 border-solid bg-cyan-300 px-4 py-2 text-cyan-900"
          onClick={handleRollDice}
        >
          <FontAwesomeIcon icon={faDice} className="h-6 w-6 pr-2 text-white" />
          <span>Roll</span>
        </button>
      </div>
    );

  return (
    <>
      <div className="flex justify-center">
        <div className="flex max-w-2xl gap-2">
          <div className="">
            <FontAwesomeIcon
              icon={diceNumber(dice.whiteOne) ?? faDice}
              className="h-14 w-14 bg-black text-white"
            />
          </div>
          <div className="">
            <FontAwesomeIcon
              icon={diceNumber(dice.whiteTwo) ?? faDice}
              className="h-14 w-14 bg-black text-white"
            />
          </div>
          <div className="">
            <FontAwesomeIcon
              icon={diceNumber(dice.red) ?? faDice}
              className="h-14 w-14 bg-white text-[#e00000]"
            />
          </div>
          <div className="">
            <FontAwesomeIcon
              icon={diceNumber(dice.yellow) ?? faDice}
              className="h-14 w-14 bg-white text-[#fdc800]"
            />
          </div>
          <div className="">
            <FontAwesomeIcon
              icon={diceNumber(dice.green) ?? faDice}
              className="h-14 w-14 bg-white text-[#319800]"
            />
          </div>
          <div className="">
            <FontAwesomeIcon
              icon={diceNumber(dice.blue) ?? faDice}
              className="h-14 w-14 bg-white text-[#326698]"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center">
        <button
          className="rounded-lg border-2 border-solid bg-cyan-300 px-4 py-2 text-cyan-900 active:bg-cyan-100"
          onClick={handleRollDice}
        >
          <FontAwesomeIcon icon={faDice} className="h-6 w-6 pr-2 text-white" />
          <span>Roll</span>
        </button>
      </div>
    </>
  );
}
