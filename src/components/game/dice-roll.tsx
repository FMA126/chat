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
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { api } from "~/utils/api";

export function DiceRoll({
  players,
}: {
  players: { name: string | null; userId: string; cardId: number }[];
}) {
  const [isRolling, setIsRolling] = useState(false);

  const session = useSession();
  const router = useRouter();
  const { data: game, isFetching } = api.game.byId.useQuery(
    {
      id: router.query.gid as string,
    },
    {
      onSettled: () => {
        setIsRolling(false);
      },
      enabled: !!router.query.gid,
    }
  );

  const { data: dice } = api.game.getDiceRoll.useQuery({
    gameId: router.query.gid as string,
  });

  const { mutate, error } = api.game.rollDice.useMutation({
    onMutate() {
      setIsRolling(true);
    },
    onError() {
      toast.error("Error rolling dice");
      setIsRolling(false);
    },
  });

  const diceNumber = useCallback((rolledNumber: number | undefined) => {
    if (!rolledNumber) {
      return undefined;
    }
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

  const isTurnComplete = useMemo(() => {
    const playersList = [
      game?.playerOne,
      game?.playerTwo,
      game?.playerThree,
      game?.playerFour,
      game?.playerFive,
    ].filter((player) => !!player);
    const uniqueUserIdEntries = new Set<string>();
    const check = game?.scoreCards
      .map((sc) => sc.scoreCardEntries)
      .flat()
      ?.filter((scEntry) => scEntry.diceRollId === game?.diceRolls[0]?.id);
    check?.forEach(({ userId }) => {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      uniqueUserIdEntries.add(userId as string);
    });
    return uniqueUserIdEntries.size === playersList.length;
  }, [JSON.stringify(game)]);

  const nextPlayerTurn = useMemo(() => {
    const playersList = [
      game?.playerOne,
      game?.playerTwo,
      game?.playerThree,
      game?.playerFour,
      game?.playerFive,
    ].filter((player) => player);
    const currentPlayerIdx = playersList.findIndex(
      (player) => player === game?.diceRolls[0]?.userId
    );
    if (playersList[currentPlayerIdx] === playersList[playersList.length - 1]) {
      return playersList[0];
    }

    return playersList[currentPlayerIdx + 1];
  }, [game?.diceRolls]);

  const lastDiceRoll = JSON.stringify(game?.diceRolls[0]);

  const isMyTurn = useMemo(() => {
    const myTurn =
      game &&
      game?.diceRolls[0] &&
      session.data &&
      game?.diceRolls[0].userId === session.data.user.id;
    return !!myTurn;
  }, [lastDiceRoll, game, session.data]);

  const handleRollDice = () => {
    mutate({ gameId: router.query.gid as string });
  };

  if (error) return <div className="text-center">Error getting dice</div>;

  if (isRolling)
    return (
      <>
        <div className="flex justify-center">
          <div className="flex max-w-2xl sm:gap-2">
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
            className="rounded-lg border-2 border-solid bg-cyan-300 px-4 py-2 text-cyan-900"
            disabled={true}
          >
            <FontAwesomeIcon
              icon={faDice}
              spin
              className="h-6 w-6 pr-2 text-white"
            />
            {/* <span>Roll</span> */}
          </button>
        </div>
      </>
    );

  if (game?.diceRolls?.length === 0)
    return (
      <div className="flex flex-col items-center">
        <h2>
          {players.find((player) => player?.userId === game?.playerOne)?.name}{" "}
          roll to start game
        </h2>
        {!game?.playerTwo ? (
          <div>Waiting for other players {game?.scoreCards.length} / 5</div>
        ) : game.playerOne === session.data?.user.id ? (
          <button
            className="rounded-lg border-2 border-solid bg-cyan-300 px-4 py-2 text-cyan-900"
            onClick={handleRollDice}
            disabled={session?.data?.user?.id !== game?.playerOne}
          >
            <FontAwesomeIcon
              icon={faDice}
              className="h-6 w-6 pr-2 text-white"
            />
            <span>Roll</span>
          </button>
        ) : (
          <>
            <div>Waiting for other players {game?.scoreCards.length} / 5</div>
            <div className="text-center">or</div>
            <div>
              {
                players.find((player) => player?.userId === game?.playerOne)
                  ?.name
              }{" "}
              to roll
            </div>
          </>
        )}
      </div>
    );

  return (
    <>
      <div className="flex justify-center">
        <div className="flex max-w-2xl gap-2">
          <div className="">
            <FontAwesomeIcon
              icon={diceNumber(game?.diceRolls[0]?.whiteOne) ?? faDice}
              className="h-12 w-12 bg-black text-white sm:h-14 sm:w-14"
            />
          </div>
          <div className="">
            <FontAwesomeIcon
              icon={diceNumber(game?.diceRolls[0]?.whiteTwo) ?? faDice}
              className="h-12 w-12 bg-black text-white sm:h-14 sm:w-14"
            />
          </div>
          <div className="">
            <FontAwesomeIcon
              icon={diceNumber(game?.diceRolls[0]?.red) ?? faDice}
              className="h-12 w-12 bg-white text-[#e00000] sm:h-14 sm:w-14"
            />
          </div>
          <div className="">
            <FontAwesomeIcon
              icon={diceNumber(game?.diceRolls[0]?.yellow) ?? faDice}
              className="h-12 w-12 bg-white text-[#fdc800] sm:h-14 sm:w-14"
            />
          </div>
          <div className="">
            <FontAwesomeIcon
              icon={diceNumber(game?.diceRolls[0]?.green) ?? faDice}
              className="h-12 w-12 bg-white text-[#319800] sm:h-14 sm:w-14"
            />
          </div>
          <div className="">
            <FontAwesomeIcon
              icon={diceNumber(game?.diceRolls[0]?.blue) ?? faDice}
              className="h-12 w-12 bg-white text-[#326698] sm:h-14 sm:w-14"
            />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center">
        {nextPlayerTurn &&
          session.data?.user.id &&
          nextPlayerTurn === session.data?.user.id &&
          isTurnComplete && (
            <button
              className="rounded-lg border-2 border-solid bg-cyan-300 px-4 py-2 text-cyan-900 active:bg-cyan-100"
              onClick={handleRollDice}
              disabled={isRolling}
            >
              <FontAwesomeIcon
                icon={faDice}
                className="h-6 w-6 pr-2 text-white"
              />
              <span>Roll</span>
            </button>
          )}
      </div>
    </>
  );
}
