import { joinClassNames } from "~/utils/joinClassNames";
import {
  CheckBadgeIcon,
  LockClosedIcon,
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
// lock out row
// all penalty boxes marked ends game
// game over
// totals
// winner
// leaderboard

export const ScoreCard = ({
  playerName,
  playerId,
  isMyCard,
}: {
  playerName: string;
  playerId: string;
  isMyCard: boolean;
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
        } = currentEntry;
        if (red) {
          rows[ColorRow.red][red - 2] = 1;
        }
        if (blue) {
          rows[ColorRow.blue][blue - 2] = 1;
        }
        if (yellow) {
          rows[ColorRow.yellow][yellow - 2] = 1;
        }
        if (green) {
          rows[ColorRow.green][green - 2] = 1;
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
        return rows;
      },
      {
        redRow: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        blueRow: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        yellowRow: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        greenRow: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        penaltyOne: 0,
        penaltyTwo: 0,
        penaltyThree: 0,
        penaltyFour: 0,
      }
    );
    return (
      reduceEntries ?? {
        redRow: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        blueRow: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        yellowRow: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        greenRow: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        penaltyOne: 0,
        penaltyTwo: 0,
        penaltyThree: 0,
        penaltyFour: 0,
      }
    );
  }, [game?.scoreCards, playerId]);

  const updateCard = ({ color, boxIdx }: { color: string; boxIdx: number }) => {
    setMarks((prev) => {
      const rowName = ColorRow[color as keyof typeof ColorRow];
      const isMyTurn = game?.diceRolls[0]?.userId === session.data?.user.id;
      const duplicateMarkIdx = prev.findIndex(
        (m) =>
          Object.keys(m)[0] === rowName && Object.values(m)[0] === boxIdx + 2
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
          newMark[rowName] = boxIdx + 2;
          return [{ ...newMark }] as Mark[];
        }
        return [...prev, { [rowName]: boxIdx + 2 }] as Mark[];
      }
      return [{ [rowName]: boxIdx + 2 }];
    });
  };

  const updatePenalty = (penaltyIdx: number) => {
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

  const submitEntry = () => {
    const scoreCardId = game?.scoreCards.find(
      (card) => card.userId === session.data?.user.id
    )?.id;
    const diceRollId = game?.diceRolls[0]?.id;
    scoreCardId &&
      diceRollId &&
      marks.length &&
      mutateScoreCardEntry({
        gameId: router.query.gid as string,
        scoreCardId,
        diceRollId,
        entry: marks,
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
                  <span>Save</span>
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
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isMyCard={session?.data?.user?.id === playerId}
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
          />
          <ScoreCardRow
            playerId={playerId}
            entries={entries[ColorRow.yellow]}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isMyCard={session?.data?.user?.id === playerId}
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
          />
          <ScoreCardRow
            playerId={playerId}
            entries={entries[ColorRow.green]}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isMyCard={session?.data?.user?.id === playerId}
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
          />
          <ScoreCardRow
            playerId={playerId}
            entries={entries[ColorRow.blue]}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            isMyCard={session?.data?.user?.id === playerId}
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
        <ScoreCardTotalRow />
      </div>
    </>
  );
};

const ScoreCardRow = ({
  dice,
  color,
  isMyCard,
  entries,
  isEditing,
  setIsEditing,
  playerId,
  updateCard,
  marks,
}: {
  dice?: Dice;
  color: string;
  isMyCard?: boolean;
  playerId?: string;
  entries?: number[];
  isEditing?: boolean;
  setIsEditing?: Dispatch<SetStateAction<boolean>>;
  marks?: Mark[];
  updateCard?: ({ color, boxIdx }: { color: string; boxIdx: number }) => void;
}) => {
  const [row, setRow] = useState(() =>
    color === "green" || color === "blue"
      ? [12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
      : [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
  );
  const [isClosedOut, setIsClosedOut] = useState(false);

  return (
    <div className={joinClassNames(colorSwitch(color), "py-2")}>
      <div className="flex items-center py-1">
        <PlayIcon className="h-2 w-2 grow text-black md:h-4 lg:h-4" />
        {row.map((box, boxIdx) => (
          <button
            className={joinClassNames(borderBoxColor(color), "grow basis-4")}
            key={boxIdx}
            onClick={() => {
              isMyCard &&
                isEditing &&
                updateCard &&
                dice &&
                (dice?.whiteOne + dice?.whiteTwo === box ||
                  dice.whiteOne + dice[color as keyof typeof DiceColor] ===
                    box ||
                  dice.whiteTwo + dice[color as keyof typeof DiceColor] ===
                    box) &&
                !(entries && !!entries[boxIdx]) &&
                updateCard({ color, boxIdx });
            }}
          >
            <div
              className={joinClassNames(
                innerBoxColor(color),
                marks?.find(
                  (m) =>
                    m[ColorRow[color as keyof typeof ColorRow]] === boxIdx + 2
                )
                  ? "border-slate-900 bg-cyan-300 text-white"
                  : "",
                !(entries && !!entries[boxIdx]) &&
                  dice &&
                  dice?.whiteOne + dice?.whiteTwo === box &&
                  isEditing &&
                  isMyCard
                  ? "animate-pulse"
                  : "",
                !(entries && !!entries[boxIdx]) &&
                  dice &&
                  dice.whiteOne + dice[color as keyof typeof DiceColor] ===
                    box &&
                  isEditing &&
                  isMyCard
                  ? "animate-pulse"
                  : "",
                !(entries && !!entries[boxIdx]) &&
                  dice &&
                  dice.whiteTwo + dice[color as keyof typeof DiceColor] ===
                    box &&
                  isEditing &&
                  isMyCard
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
            <LockClosedIcon className={joinClassNames(iconColor(color))} />
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
}: {
  dice?: Dice;
  isEditing?: boolean;
  setIsEditing?: Dispatch<SetStateAction<boolean>>;
  playerId?: string;
  entries?: number[];
  marks?: Mark[];
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
                  marks?.find((m) => {
                    console.log("mark", m);
                    return (
                      m[PenaltyRow[penaltyName as keyof typeof PenaltyRow]] ===
                      1
                    );
                  })
                    ? "bg-cyan-300 text-white"
                    : "bg-white",
                  "h-4 w-4 rounded-md border-2 border-black"
                )}
              >
                {!!entries?.[pIdx] && (
                  <XMarkIcon className="h-6 w-6 text-red-500" />
                )}
              </div>
            ))}
          </div>
        </button>
      </div>
    </div>
  );
};

const ScoreCardTotalRow = () => {
  return (
    <div className="flex items-center justify-center gap-2 bg-gray-400 py-2">
      <div className="">totals</div>
      <div
        className={joinClassNames(
          "h-8 w-32 rounded-xl rounded-xl border-2 border-[#7b0200] bg-[#fed0d0]"
        )}
      ></div>
      <div className="">+</div>
      <div
        className={joinClassNames(
          "h-8 w-32 rounded-xl border-2 border-[#946704] bg-[#fffece]"
        )}
      ></div>
      <div className="">+</div>
      <div
        className={joinClassNames(
          "h-8 w-32 rounded-xl border-2 border-[#f1fdf0] bg-[#f1fdf0]"
        )}
      ></div>
      <div className="">+</div>
      <div
        className={joinClassNames(
          "h-8 w-32 rounded-xl border-2 border-[#023464] bg-[#e0e1ff]"
        )}
      ></div>
      <div className="">-</div>
      <div
        className={joinClassNames(
          "h-8 w-32 rounded-xl rounded-xl border-2 border-black bg-white"
        )}
      ></div>
      <div className="">=</div>
      <div className="h-8 w-64 rounded-xl border-2 border-black bg-white"></div>
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
