import { joinClassNames } from "~/utils/joinClassNames";
import {
  CheckBadgeIcon,
  LockClosedIcon,
  LockOpenIcon,
  PlayIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import {
  type Dispatch,
  type SetStateAction,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

interface Dice {
  whiteOne: number;
  whiteTwo: number;
  green: number;
  red: number;
  yellow: number;
  blue: number;
}

enum DiceColor {
  red = "red",
  blue = "blue",
  yellow = "yellow",
  green = "green",
}

interface Mark {
  redRow?: number;
  blueRow?: number;
  yellowRow?: number;
  greenRow?: number;
  penaltyOne?: number;
  penaltyTwo?: number;
  penaltyThree?: number;
  penaltyFour?: number;
}

enum ColorRow {
  red = "redRow",
  blue = "blueRow",
  yellow = "yellowRow",
  green = "greenRow",
}

enum PenaltyRow {
  penaltyOne = "penaltyOne",
  penaltyTwo = "penaltyTwo",
  penaltyThree = "penaltyThree",
  penaltyFour = "penaltyFour",
}

// Todo
// all penalty boxes marked ends game
// player whos turn it is can't pass
// loading state to prevent multiple button presses (animations?)
// leaderboard

// Nice to haves
// chat??
// ui improvements
// animations

export const ScoreCard = ({
  playerName,
  playerId,
  isMyCard,
  finalMove,
}: {
  playerName: string;
  playerId: string;
  isMyCard: boolean;
  finalMove: boolean;
}) => {
  const session = useSession();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [marks, setMarks] = useState<Mark[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: game } = api.game.byId.useQuery(
    {
      id: router.query.gid as string,
    },
    {
      onSettled: (data) => {
        setIsEditing((prev) => {
          const entries = data?.scoreCards.find(
            (card) => card.userId === session.data?.user.id
          )?.scoreCardEntries;
          if (data?.diceRolls && entries) {
            if (data?.diceRolls?.length > entries?.length) {
              return true;
            }
            if (data.diceRolls[0] && entries[0]) {
              if (data?.diceRolls[0]?.createdAt > entries[0]?.createdAt) {
                return true;
              }
            }
          }
          return false;
        });
      },
      enabled: !!router.query.gid,
    }
  );

  const { mutate: mutateScoreCardEntry } =
    api.game.createScoreCardEntry.useMutation({
      onMutate() {
        setIsSubmitting(true);
      },
      onError() {
        toast.error("Error updating card");
        setIsSubmitting(true);
      },
      onSuccess() {
        toast.success("Nice move!");
        setIsSubmitting(true);
        setMarks([]);
      },
    });

  const entries = useMemo(() => {
    const playerEntries = game?.scoreCards?.find(
      (card) => card.userId === playerId
    )?.scoreCardEntries;
    const reduceEntries = playerEntries?.reduce(
      (rows, currentEntry) => {
        const {
          redRow: red,
          blueRow: blue,
          yellowRow: yellow,
          greenRow: green,
          penaltyOne,
          penaltyTwo,
          penaltyThree,
          penaltyFour,
          redLock,
          blueLock,
          yellowLock,
          greenLock,
        } = currentEntry;
        if (red) {
          rows[ColorRow.red][red - 2] = 1;
        }
        if (yellow) {
          rows[ColorRow.yellow][yellow - 2] = 1;
        }
        if (blue) {
          rows[ColorRow.blue][12 - blue] = 1;
        }
        if (green) {
          rows[ColorRow.green][12 - green] = 1;
        }
        if (penaltyOne) {
          rows.penaltyOne = 1;
        }
        if (penaltyTwo) {
          rows.penaltyTwo = 1;
        }
        if (penaltyThree) {
          rows.penaltyThree = 1;
        }
        if (penaltyFour) {
          rows.penaltyFour = 1;
        }
        if (redLock) {
          rows.redLock = 1;
        }
        if (blueLock) {
          rows.blueLock = 1;
        }
        if (yellowLock) {
          rows.yellowLock = 1;
        }
        if (greenLock) {
          rows.greenLock = 1;
        }
        return rows;
      },
      {
        redRow: new Array(11).fill(0),
        blueRow: new Array(11).fill(0),
        yellowRow: new Array(11).fill(0),
        greenRow: new Array(11).fill(0),
        redLock: 0,
        blueLock: 0,
        yellowLock: 0,
        greenLock: 0,
        penaltyOne: 0,
        penaltyTwo: 0,
        penaltyThree: 0,
        penaltyFour: 0,
      }
    );
    return (
      reduceEntries ?? {
        redRow: new Array(11).fill(0),
        blueRow: new Array(11).fill(0),
        yellowRow: new Array(11).fill(0),
        greenRow: new Array(11).fill(0),
        redLock: 0,
        blueLock: 0,
        yellowLock: 0,
        greenLock: 0,
        penaltyOne: 0,
        penaltyTwo: 0,
        penaltyThree: 0,
        penaltyFour: 0,
      }
    );
  }, [game?.scoreCards, playerId]);

  const locks = useMemo(() => {
    const lockList: [string, number][] | undefined =
      game?.scoreCards[0] &&
      (Object.entries(game?.scoreCards[0]).filter(
        (sc) =>
          (sc[0] === "redLock" && !!sc[1]) ||
          (sc[0] === "yellowLock" && !!sc[1]) ||
          (sc[0] === "blueLock" && !!sc[1]) ||
          (sc[0] === "greenLock" && !!sc[1])
      ) as [string, number][]);

    return lockList;
  }, [
    game?.scoreCards[0]?.redLock,
    game?.scoreCards[0]?.yellowLock,
    game?.scoreCards[0]?.blueLock,
    game?.scoreCards[0]?.greenLock,
  ]);

  const wasRowLockedOnCurrentDiceRoll = useMemo(() => {
    let lockedEntryOnCurrentDiceRoll = false;
    const lockedEntry = game?.scoreCards.forEach((sc) => {
      const found = sc.scoreCardEntries.find(
        (sce) =>
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          !!sce.redLock || !!sce.yellowLock || sce.blueLock || sce.greenLock
      );
      const lockedDiceRoll = found?.diceRollId;
      if (lockedDiceRoll && lockedDiceRoll === game?.diceRolls?.[0]?.id) {
        lockedEntryOnCurrentDiceRoll = true;
      }
    });
    return lockedEntryOnCurrentDiceRoll;
  }, [
    game?.scoreCards[0]?.redLock,
    game?.scoreCards[0]?.yellowLock,
    game?.scoreCards[0]?.blueLock,
    game?.scoreCards[0]?.greenLock,
    game?.diceRolls,
  ]);

  const updateCard = ({ color, boxIdx }: { color: string; boxIdx: number }) => {
    setMarks((prev) => {
      const rowName = ColorRow[color as keyof typeof ColorRow];
      const isMyTurn = game?.diceRolls[0]?.userId === session.data?.user.id;
      const duplicateMarkIdx = prev.findIndex((m) =>
        color === "red" || color === "yelow"
          ? Object.keys(m)[0] === rowName && Object.values(m)[0] === boxIdx + 2
          : Object.keys(m)[0] === rowName && Object.values(m)[0] === 12 - boxIdx
      );
      const penaltyIdx = prev.findIndex(
        (m) =>
          Object.keys(m)[0] === PenaltyRow.penaltyOne ||
          Object.keys(m)[0] === PenaltyRow.penaltyTwo ||
          Object.keys(m)[0] === PenaltyRow.penaltyThree ||
          Object.keys(m)[0] === PenaltyRow.penaltyFour
      );
      if (duplicateMarkIdx > -1) {
        if (duplicateMarkIdx === 0) {
          return [...prev.slice(1)];
        }
        if (duplicateMarkIdx === 1) {
          return [...prev.slice(0, duplicateMarkIdx)];
        }
      }
      if (isMyTurn) {
        if (prev.length === 2) {
          return prev;
        }
        if (prev.length === 0) {
          const newMark = {} as Mark;
          newMark[rowName] =
            color === "red" || color === "yellow" ? boxIdx + 2 : 12 - boxIdx;
          return [{ ...newMark }] as Mark[];
        }
        if (penaltyIdx > -1) {
          return [
            {
              [rowName]:
                color === "red" || color === "yellow"
                  ? boxIdx + 2
                  : 12 - boxIdx,
            },
          ] as Mark[];
        }
        return [
          ...prev,
          {
            [rowName]:
              color === "red" || color === "yellow" ? boxIdx + 2 : 12 - boxIdx,
          },
        ] as Mark[];
      }
      return [
        {
          [rowName]:
            color === "red" || color === "yellow" ? boxIdx + 2 : 12 - boxIdx,
        },
      ];
    });
  };

  const updatePenalty = (penaltyIdx: number) => {
    console.log(penaltyIdx);
    if (penaltyIdx > -1) {
      const mapPenalty =
        penaltyIdx === 0
          ? { penaltyOne: 1 }
          : penaltyIdx === 1
          ? { penaltyTwo: 1 }
          : penaltyIdx === 2
          ? { penaltyThree: 1 }
          : penaltyIdx === 3
          ? { penaltyFour: 1 }
          : null;
      setMarks((prev) => {
        if (mapPenalty) {
          const duplicateMarkIdx = prev.findIndex(
            (m) =>
              Object.keys(m)[0] === PenaltyRow.penaltyOne ||
              Object.keys(m)[0] === PenaltyRow.penaltyTwo ||
              Object.keys(m)[0] === PenaltyRow.penaltyThree ||
              Object.keys(m)[0] === PenaltyRow.penaltyFour
          );
          if (duplicateMarkIdx > -1) {
            return [];
          }
          return [mapPenalty] as Mark[];
        }
        return prev;
      });
    }
  };

  const isMyTurn = useMemo(() => {
    const myTurn =
      game &&
      game?.diceRolls[0] &&
      session.data &&
      game?.diceRolls[0].userId === session.data.user.id;
    return !!myTurn;
  }, [JSON.stringify(game?.diceRolls[0]), game, session.data]);

  const markableBox = (color: string, box: number, entries: number[]) => {
    const firstEntryGreenBlue =
      entries.findLastIndex((e) => !!e) >= 0
        ? 12 - entries.findLastIndex((e) => !!e)
        : 13;
    const firstEntryRedYellow =
      entries.findLastIndex((e) => !!e) >= 0
        ? entries.findLastIndex((e) => !!e) + 2
        : 1;

    const availableBox =
      color === "green" || color === "blue"
        ? box < firstEntryGreenBlue
        : box > firstEntryRedYellow;

    return availableBox;
  };

  const lockRowColor = () => {
    const lock = marks.find(
      (m) =>
        (Object.keys(m)[0] === ColorRow.red && Object.values(m)[0] === 12) ||
        (Object.keys(m)[0] === ColorRow.yellow && Object.values(m)[0] === 12) ||
        (Object.keys(m)[0] === ColorRow.blue && Object.values(m)[0] === 2) ||
        (Object.keys(m)[0] === ColorRow.green && Object.values(m)[0] === 2)
    );
    return lock && (Object.keys(lock)[0] as keyof Mark);
  };

  const submitEntry = () => {
    const scoreCardId = game?.scoreCards.find(
      (card) => card.userId === session.data?.user.id
    )?.id;
    const diceRollId = game?.diceRolls[0]?.id;
    const lock = lockRowColor();
    const mapLock =
      lock &&
      (lock === ColorRow.red
        ? { redLock: 1 }
        : lock === ColorRow.yellow
        ? { yellowLock: 1 }
        : lock === ColorRow.blue
        ? { blueLock: 1 }
        : lock === ColorRow.green
        ? { greenLock: 1 }
        : undefined);
    scoreCardId &&
      diceRollId &&
      mutateScoreCardEntry({
        gameId: router.query.gid as string,
        scoreCardId,
        diceRollId,
        isFinalEntry: finalMove,
        entry: mapLock ? [...marks, mapLock] : marks,
      });
  };

  if (!game || !game?.diceRolls[0]?.whiteOne)
    return (
      <>
        <div className="container mx-auto rounded-lg border border-solid border-slate-400 bg-[#dddddf]">
          <div className="p-1">
            <div className="flex justify-between">
              <div
                className={joinClassNames(
                  session?.data?.user?.id === playerId
                    ? "rounded-xl bg-purple-400 text-xl text-purple-900"
                    : "text-blue-900",
                  "flex items-center gap-2 p-2"
                )}
              >
                <UserIcon className="h-6 w-6" />
                <span>{playerName ?? "no name"}</span>
              </div>
              <div className="w-1/6 rounded-t-lg border-l-2 border-r-2 border-t-2 border-black">
                At least 5 X&apos;s
              </div>
            </div>
            <ScoreCardRow color="red" />
            <ScoreCardRow color="yellow" />
            <ScoreCardRow color="green" />
            <ScoreCardRow color="blue" />
            <ScoreCardLegendPenaltyRow />
          </div>
          <ScoreCardTotalRow />
        </div>
      </>
    );
  return (
    <>
      <div className="container mx-auto rounded-lg border border-solid border-slate-400 bg-[#dddddf]">
        <div className="p-1">
          <div
            className={joinClassNames(
              isMyCard && isEditing ? "" : "justify-between",
              "flex"
            )}
          >
            <div
              className={joinClassNames(
                session?.data?.user?.id === playerId
                  ? "rounded-xl bg-purple-300 text-xl text-purple-900"
                  : "text-blue-900",
                "flex items-center gap-2 p-2"
              )}
            >
              <UserIcon className="h-6 w-6" />
              <span>{playerName ?? "no name"}</span>
            </div>
            {isMyCard && isEditing && (
              <div className="flex grow items-center justify-center gap-2 md:gap-4">
                <button
                  onClick={() => {
                    submitEntry();
                  }}
                  className="flex gap-1 rounded-xl border border-green-900 bg-green-200/80 p-2 text-green-900"
                >
                  <CheckBadgeIcon className="h-6 w-6 " />
                  {marks.length === 0 ? <span>Pass</span> : <span>Save</span>}
                </button>
                <button
                  onClick={() => {
                    setMarks([]);
                  }}
                  className="flex gap-1 rounded-xl border border-red-900 bg-red-200/80 p-2 text-red-900"
                >
                  <XMarkIcon className="h-6 w-6 " />
                  <span>Clear</span>
                </button>
              </div>
            )}
            <div className="w-1/6 rounded-t-lg border-l-2 border-r-2 border-t-2 border-black">
              At least 5 X&apos;s
            </div>
          </div>
          <ScoreCardRow
            playerId={playerId}
            entries={entries[ColorRow.red]}
            lock={!!locks?.find((l) => l[0] === "redLock")}
            wasRowLockedOnCurrentDiceRoll={wasRowLockedOnCurrentDiceRoll}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isMyCard={session?.data?.user?.id === playerId}
            isMyTurn={isMyTurn}
            dice={{
              whiteOne: game?.diceRolls[0]?.whiteOne,
              whiteTwo: game?.diceRolls[0]?.whiteTwo,
              red: game?.diceRolls[0]?.red,
              blue: game?.diceRolls[0]?.blue,
              yellow: game?.diceRolls[0]?.yellow,
              green: game?.diceRolls[0]?.green,
            }}
            updateCard={updateCard}
            marks={marks.filter(({ redRow }) => !!redRow)}
            color="red"
            markableBox={markableBox}
          />
          <ScoreCardRow
            playerId={playerId}
            entries={entries[ColorRow.yellow]}
            lock={!!locks?.find((l) => l[0] === "yellowLock")}
            wasRowLockedOnCurrentDiceRoll={wasRowLockedOnCurrentDiceRoll}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isMyCard={session?.data?.user?.id === playerId}
            isMyTurn={isMyTurn}
            dice={{
              whiteOne: game?.diceRolls[0]?.whiteOne,
              whiteTwo: game?.diceRolls[0]?.whiteTwo,
              red: game?.diceRolls[0]?.red,
              blue: game?.diceRolls[0]?.blue,
              yellow: game?.diceRolls[0]?.yellow,
              green: game?.diceRolls[0]?.green,
            }}
            updateCard={updateCard}
            marks={marks.filter(({ yellowRow }) => !!yellowRow)}
            color="yellow"
            markableBox={markableBox}
          />
          <ScoreCardRow
            playerId={playerId}
            entries={entries[ColorRow.green]}
            lock={!!locks?.find((l) => l[0] === "greenLock")}
            wasRowLockedOnCurrentDiceRoll={wasRowLockedOnCurrentDiceRoll}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isMyCard={session?.data?.user?.id === playerId}
            isMyTurn={isMyTurn}
            dice={{
              whiteOne: game?.diceRolls[0]?.whiteOne,
              whiteTwo: game?.diceRolls[0]?.whiteTwo,
              red: game?.diceRolls[0]?.red,
              blue: game?.diceRolls[0]?.blue,
              yellow: game?.diceRolls[0]?.yellow,
              green: game?.diceRolls[0]?.green,
            }}
            updateCard={updateCard}
            marks={marks.filter(({ greenRow }) => !!greenRow)}
            color="green"
            markableBox={markableBox}
          />
          <ScoreCardRow
            playerId={playerId}
            entries={entries[ColorRow.blue]}
            lock={!!locks?.find((l) => l[0] === "blueLock")}
            wasRowLockedOnCurrentDiceRoll={wasRowLockedOnCurrentDiceRoll}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isMyCard={session?.data?.user?.id === playerId}
            isMyTurn={isMyTurn}
            dice={{
              whiteOne: game?.diceRolls[0]?.whiteOne,
              whiteTwo: game?.diceRolls[0]?.whiteTwo,
              red: game?.diceRolls[0]?.red,
              blue: game?.diceRolls[0]?.blue,
              yellow: game?.diceRolls[0]?.yellow,
              green: game?.diceRolls[0]?.green,
            }}
            updateCard={updateCard}
            marks={marks.filter(({ blueRow }) => !!blueRow)}
            color="blue"
            markableBox={markableBox}
          />
          <ScoreCardLegendPenaltyRow
            playerId={playerId}
            entries={[
              entries.penaltyOne,
              entries.penaltyTwo,
              entries.penaltyThree,
              entries.penaltyFour,
            ]}
            isEditing={isEditing}
            isMyCard={session?.data?.user?.id === playerId}
            setIsEditing={setIsEditing}
            dice={game.diceRolls[0]}
            marks={marks.filter(
              ({ penaltyOne, penaltyTwo, penaltyThree, penaltyFour }) =>
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                penaltyOne || penaltyTwo || penaltyThree || penaltyFour
            )}
            updateCard={updateCard}
            updatePenalty={updatePenalty}
          />
        </div>
        <ScoreCardTotalRow
          redTotal={
            game?.scoreCards?.find((sc) => sc.userId === playerId)?.redRowTotal
          }
          yellowTotal={
            game?.scoreCards.find((sc) => sc.userId === playerId)
              ?.yellowRowTotal
          }
          blueTotal={
            game?.scoreCards.find((sc) => sc.userId === playerId)?.blueRowTotal
          }
          greenTotal={
            game?.scoreCards.find((sc) => sc.userId === playerId)?.greenRowTotal
          }
          penaltyTotal={
            game?.scoreCards.find((sc) => sc.userId === playerId)?.penaltyTotal
          }
          total={game?.scoreCards.find((sc) => sc.userId === playerId)?.total}
          gameState={game?.gameState ?? undefined}
        />
      </div>
    </>
  );
};

const ScoreCardRow = ({
  dice,
  color,
  isMyCard,
  isMyTurn,
  entries,
  lock,
  wasRowLockedOnCurrentDiceRoll,
  isEditing,
  setIsEditing,
  playerId,
  updateCard,
  marks,
  markableBox,
}: {
  dice?: Dice;
  color: string;
  isMyCard?: boolean;
  isMyTurn?: boolean;
  playerId?: string;
  entries?: number[];
  lock?: boolean;
  wasRowLockedOnCurrentDiceRoll?: boolean;
  isEditing?: boolean;
  setIsEditing?: Dispatch<SetStateAction<boolean>>;
  marks?: Mark[];
  updateCard?: ({ color, boxIdx }: { color: string; boxIdx: number }) => void;
  markableBox?: (color: string, box: number, entries: number[]) => boolean;
}) => {
  const [row, setRow] = useState(() =>
    color === "green" || color === "blue"
      ? [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
      : [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  );

  const currentMarkMakesFive = useMemo(() => {
    if (entries) {
      const numberOfEntries: number = entries.filter((e) => !!e).length;
      const numberOfSameColorMarks: number = marks?.find((m) =>
        Object.keys(m).includes(ColorRow[color as keyof typeof ColorRow])
      )
        ? 1
        : 0;

      return numberOfEntries + numberOfSameColorMarks > 3;
    }
    return false;
  }, [entries, marks, color]);

  return (
    <div className={joinClassNames(colorSwitch(color), "py-2")}>
      <div className="flex items-center py-1">
        <PlayIcon className="h-2 w-2 grow text-black md:h-4 lg:h-4" />
        {row.map((box, boxIdx) => (
          <button
            className={joinClassNames(borderBoxColor(color), "grow basis-4")}
            key={boxIdx}
            onClick={() => {
              if (entries) {
                const firstEntryGreenBlue =
                  entries.findLastIndex((e) => !!e) >= 0
                    ? 12 - entries.findLastIndex((e) => !!e)
                    : 13;
                const firstEntryRedYellow =
                  entries.findLastIndex((e) => !!e) >= 0
                    ? entries.findLastIndex((e) => !!e) + 2
                    : 1;

                const availableBox =
                  color === "green" || color === "blue"
                    ? box < firstEntryGreenBlue
                    : box > firstEntryRedYellow;
                console.log(
                  !(entries && !!entries[boxIdx]),
                  dice &&
                    dice.whiteOne + dice[color as keyof typeof DiceColor] ===
                      box,
                  isEditing,
                  isMyCard,
                  isMyTurn,
                  entries,
                  lock ? wasRowLockedOnCurrentDiceRoll : true,
                  boxIdx === 10 ? currentMarkMakesFive : true,
                  markableBox && markableBox(color, box, entries)
                );

                isMyCard &&
                  isEditing &&
                  updateCard &&
                  dice &&
                  (dice?.whiteOne + dice?.whiteTwo === box ||
                    (isMyTurn &&
                      (dice.whiteOne + dice[color as keyof typeof DiceColor] ===
                        box ||
                        dice.whiteTwo +
                          dice[color as keyof typeof DiceColor] ===
                          box))) &&
                  !(entries && !!entries[boxIdx]) &&
                  availableBox &&
                  (lock ? wasRowLockedOnCurrentDiceRoll : true) &&
                  (boxIdx === 10 ? currentMarkMakesFive : true) &&
                  updateCard({ color, boxIdx });
              }
            }}
          >
            <div
              className={joinClassNames(
                innerBoxColor(color),
                marks?.find((m) =>
                  color === "red" || color === "yellow"
                    ? m[ColorRow[color as keyof typeof ColorRow]] === boxIdx + 2
                    : m[ColorRow[color as keyof typeof ColorRow]] ===
                      12 - boxIdx
                )
                  ? "border-slate-900 bg-cyan-300 text-white"
                  : "",
                !(entries && !!entries[boxIdx]) &&
                  dice &&
                  dice?.whiteOne + dice?.whiteTwo === box &&
                  isEditing &&
                  isMyCard &&
                  entries &&
                  markableBox &&
                  (lock ? wasRowLockedOnCurrentDiceRoll : true) &&
                  (boxIdx === 10 ? currentMarkMakesFive : true) &&
                  markableBox(color, box, entries)
                  ? "animate-pulse"
                  : "",
                !(entries && !!entries[boxIdx]) &&
                  dice &&
                  dice.whiteOne + dice[color as keyof typeof DiceColor] ===
                    box &&
                  isEditing &&
                  isMyCard &&
                  isMyTurn &&
                  entries &&
                  markableBox &&
                  (lock ? wasRowLockedOnCurrentDiceRoll : true) &&
                  (boxIdx === 10 ? currentMarkMakesFive : true) &&
                  markableBox(color, box, entries)
                  ? "animate-pulse"
                  : "",
                !(entries && !!entries[boxIdx]) &&
                  dice &&
                  dice.whiteTwo + dice[color as keyof typeof DiceColor] ===
                    box &&
                  isEditing &&
                  isMyCard &&
                  isMyTurn &&
                  entries &&
                  markableBox &&
                  (lock ? wasRowLockedOnCurrentDiceRoll : true) &&
                  (boxIdx === 10 ? currentMarkMakesFive : true) &&
                  markableBox(color, box, entries)
                  ? "animate-pulse"
                  : "",
                "flex items-center justify-center rounded-lg md:text-lg lg:text-2xl"
              )}
            >
              {entries && !!entries[boxIdx] ? (
                <XMarkIcon className="h-8 w-8 self-center" />
              ) : (
                <p>{box}</p>
              )}
            </div>
          </button>
        ))}
        <div className={joinClassNames("flex grow justify-center rounded-lg")}>
          <div className={joinClassNames(innerBoxColor(color), "h-8 w-8 p-1")}>
            {lock ? (
              <LockClosedIcon className={joinClassNames(iconColor(color))} />
            ) : (
              <LockOpenIcon className={joinClassNames(iconColor(color))} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const ScoreCardLegendPenaltyRow = ({
  dice,
  isEditing,
  setIsEditing,
  playerId,
  entries,
  updateCard,
  marks,
  updatePenalty,
  isMyCard,
}: {
  dice?: Dice;
  isEditing?: boolean;
  setIsEditing?: Dispatch<SetStateAction<boolean>>;
  playerId?: string;
  entries?: number[];
  marks?: Mark[];
  isMyCard?: boolean;
  updateCard?: ({ color, boxIdx }: { color: string; boxIdx: number }) => void;
  updatePenalty?: (penaltyIdx: number) => void;
}) => {
  return (
    <div className="flex py-2">
      <div className="grid grid-cols-1 divide-y divide-black">
        <div className="h-8 w-8 rounded-lg border-2 border-black bg-white text-center">
          X
        </div>
        <div className="text-center text-xs">points</div>
      </div>
      <div className="flex grow">
        <div className="grid grow grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
          <div className="text-center text-xs">1x</div>
          <div className="text-center text-xs">1</div>
        </div>
        <div className="grid grow grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
          <div className="text-center text-xs md:text-sm lg:text-lg">2x</div>
          <div className="text-center text-xs md:text-sm lg:text-lg">3</div>
        </div>
        <div className="grid grow grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
          <div className="text-center text-xs md:text-sm lg:text-lg">3x</div>
          <div className="text-center text-xs md:text-sm lg:text-lg">6</div>
        </div>
        <div className="grid grow grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
          <div className="text-center text-xs md:text-sm lg:text-lg">4x</div>
          <div className="text-center text-xs md:text-sm lg:text-lg">10</div>
        </div>
        <div className="grid grow grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
          <div className="text-center text-xs md:text-sm lg:text-lg">5x</div>
          <div className="text-center text-xs md:text-sm lg:text-lg">15</div>
        </div>
        <div className="grid grow grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
          <div className="text-center text-xs md:text-sm lg:text-lg">6x</div>
          <div className="text-center text-xs md:text-sm lg:text-lg">21</div>
        </div>
        <div className="grid grow grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
          <div className="text-center text-xs md:text-sm lg:text-lg">7x</div>
          <div className="text-center text-xs md:text-sm lg:text-lg">28</div>
        </div>
        <div className="grid grow grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
          <div className="text-center text-xs md:text-sm lg:text-lg">8x</div>
          <div className="text-center text-xs md:text-sm lg:text-lg">36</div>
        </div>
        <div className="grid grow grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
          <div className="text-center text-xs md:text-sm lg:text-lg">9x</div>
          <div className="text-center text-xs md:text-sm lg:text-lg">45</div>
        </div>
        <div className="grid grow grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
          <div className="text-center text-xs md:text-sm lg:text-lg">10x</div>
          <div className="text-center text-xs md:text-sm lg:text-lg">55</div>
        </div>
        <div className="grid grow grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
          <div className="text-center text-xs md:text-sm lg:text-lg">11x</div>
          <div className="text-center text-xs md:text-sm lg:text-lg">66</div>
        </div>
        <div className="grid grow grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
          <div className="text-center text-xs md:text-sm lg:text-lg">12x</div>
          <div className="text-center text-xs md:text-sm lg:text-lg">78</div>
        </div>
      </div>
      <div className="grid grid-cols-1">
        <div className="text-center">
          <span className="text-red-500">X</span> = -5
        </div>
        <button
          onClick={() => {
            entries &&
              updatePenalty &&
              isEditing &&
              isMyCard &&
              updatePenalty(entries?.findIndex((e) => e === 0));
          }}
          disabled={entries && entries?.filter((e) => e).length > 3}
        >
          <div className="flex">
            {[
              PenaltyRow.penaltyOne,
              PenaltyRow.penaltyTwo,
              PenaltyRow.penaltyThree,
              PenaltyRow.penaltyFour,
            ].map((penaltyName, pIdx) => (
              <div
                key={pIdx}
                className={joinClassNames(
                  marks?.find(
                    (m) =>
                      m[PenaltyRow[penaltyName as keyof typeof PenaltyRow]] ===
                      1
                  )
                    ? "bg-cyan-300 text-white"
                    : "bg-white",
                  "h-6 w-6 rounded-md border-2 border-black"
                )}
              >
                {!!entries?.[pIdx] && (
                  <XMarkIcon className="inset-0 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </button>
      </div>
    </div>
  );
};

const ScoreCardTotalRow = ({
  redTotal,
  yellowTotal,
  blueTotal,
  greenTotal,
  penaltyTotal,
  total,
  gameState,
}: {
  redTotal?: number;
  yellowTotal?: number;
  blueTotal?: number;
  greenTotal?: number;
  penaltyTotal?: number;
  total?: number;
  gameState?: string;
}) => {
  return (
    <div className="flex items-center justify-center gap-2 bg-gray-400 py-2">
      <div className="">totals</div>
      <div
        className={joinClassNames(
          "h-8 w-32 rounded-xl rounded-xl border-2 border-[#7b0200] bg-[#fed0d0] text-center"
        )}
      >
        {gameState === "over" && redTotal}
      </div>
      <div className="">+</div>
      <div
        className={joinClassNames(
          "h-8 w-32 rounded-xl border-2 border-[#946704] bg-[#fffece] text-center"
        )}
      >
        {gameState === "over" && yellowTotal}
      </div>
      <div className="">+</div>
      <div
        className={joinClassNames(
          "h-8 w-32 rounded-xl border-2 border-[#f1fdf0] bg-[#f1fdf0] text-center"
        )}
      >
        {gameState === "over" && blueTotal}
      </div>
      <div className="">+</div>
      <div
        className={joinClassNames(
          "h-8 w-32 rounded-xl border-2 border-[#023464] bg-[#e0e1ff] text-center"
        )}
      >
        {gameState === "over" && greenTotal}
      </div>
      <div className="">-</div>
      <div
        className={joinClassNames(
          "h-8 w-32 rounded-xl rounded-xl border-2 border-black bg-white text-center"
        )}
      >
        {gameState === "over" && penaltyTotal}
      </div>
      <div className="">=</div>
      <div className="h-8 w-64 rounded-xl border-2 border-black bg-white text-center">
        {gameState === "over" && total}
      </div>
    </div>
  );
};

const colorSwitch = (color: string) => {
  switch (color) {
    case "red":
      return "bg-[#e00000]";
    case "yellow":
      return "bg-[#fdc800]";
    case "green":
      return "bg-[#319800]";
    case "blue":
      return "bg-[#326698]";
    default:
      return "";
  }
};

const innerBoxColor = (color: string) => {
  switch (color) {
    case "red":
      return "bg-[#fed0d0]";
    case "yellow":
      return "bg-[#fffece]";
    case "green":
      return "bg-[#f1fdf0]";
    case "blue":
      return "bg-[#e0e1ff]";
    default:
      return "";
  }
};

const iconColor = (color: string) => {
  switch (color) {
    case "red":
      return "text-[#7b0200]";
    case "yellow":
      return "text-[#946704]";
    case "green":
      return "text-[#005801]";
    case "blue":
      return "text-[#023464]";
    default:
      return "";
  }
};

const borderBoxColor = (color: string) => {
  switch (color) {
    case "red":
      return "bg-[#7b0200] border-[#7b0200] border-2";
    case "yellow":
      return "bg-[#946704] border-[#946704] border-2";
    case "green":
      return "bg-[#005801] border-[#005801] border-2";
    case "blue":
      return "bg-[#023464] border-[#023464] border-2";
    default:
      return "";
  }
};
