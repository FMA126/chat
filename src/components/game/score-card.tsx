import { joinClassNames } from "~/utils/joinClassNames";
import {
  CheckBadgeIcon,
  LockClosedIcon,
  PlayIcon,
  UserIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";

interface Dice {
  whiteOne: number;
  whiteTwo: number;
  green?: number;
  red?: number;
  yellow?: number;
  blue?: number;
}

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
  const [showConfirm, setShowConfirm] = useState(false);
  const { data: game } = api.game.byId.useQuery(
    {
      id: router.query.gid as string,
    },
    {
      onSettled: (data) => {
        setShowConfirm((prev) => {
          if (data && session.data) {
            const { diceRolls, scoreCards } = data;
            if (diceRolls && scoreCards) {
              const entries = data.scoreCards.find(
                (card) => card.userId === session.data.user.id
              )?.scoreCardEntries;
              if (entries) {
                if (data.diceRolls.length > entries.length) {
                  return true;
                }
              }
            }
          }
          return false;
        });
      },
      enabled: !!router.query.gid,
    }
  );

  if (!game || !game?.diceRolls[0]?.whiteOne)
    return (
      <>
        <div className="container mx-auto rounded-lg border-2 border-solid border-black bg-[#dddddf]">
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
      <div className="container mx-auto rounded-lg border-2 border-solid border-black bg-[#dddddf]">
        <div className="p-1">
          <div
            className={joinClassNames(
              isMyCard && showConfirm ? "" : "justify-between",
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
            {isMyCard && showConfirm && (
              <div className="flex grow items-center justify-center gap-2 md:gap-4">
                <button
                  onClick={() => {
                    setShowConfirm(false);
                  }}
                  className="flex gap-1 rounded-xl border border-green-900 bg-green-200/80 p-2 text-green-900"
                >
                  <CheckBadgeIcon className="h-6 w-6 " />
                  <span>Save</span>
                </button>
                <button className="flex gap-1 rounded-xl border border-red-900 bg-red-200/80 p-2 text-red-900">
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
            isMyCard={session?.data?.user?.id === playerId}
            dice={{
              whiteOne: game?.diceRolls[0]?.whiteOne,
              whiteTwo: game?.diceRolls[0]?.whiteTwo,
              red: game?.diceRolls[0]?.red,
            }}
            color="red"
          />
          <ScoreCardRow
            isMyCard={session?.data?.user?.id === playerId}
            dice={{
              whiteOne: game?.diceRolls[0].whiteOne,
              whiteTwo: game?.diceRolls[0].whiteTwo,
              yellow: game?.diceRolls[0].yellow,
            }}
            color="yellow"
          />
          <ScoreCardRow
            isMyCard={session?.data?.user?.id === playerId}
            dice={{
              whiteOne: game?.diceRolls[0].whiteOne,
              whiteTwo: game?.diceRolls[0].whiteTwo,
              green: game?.diceRolls[0].green,
            }}
            color="green"
          />
          <ScoreCardRow
            isMyCard={session?.data?.user?.id === playerId}
            dice={{
              whiteOne: game?.diceRolls[0].whiteOne,
              whiteTwo: game?.diceRolls[0].whiteTwo,
              blue: game?.diceRolls[0].blue,
            }}
            color="blue"
          />
          <ScoreCardLegendPenaltyRow dice={game.diceRolls[0]} />
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
}: {
  dice?: Dice;
  color: string;
  isMyCard?: boolean;
  entries?: {
    redList: number[];
    blueList: number[];
    yellowList: number[];
    greenList: number[];
    penaltyOne: number;
    penaltyTwo: number;
    penaltyThree: number;
    penaltyFour: number;
  };
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
          <div
            className={joinClassNames(borderBoxColor(color), "grow basis-4")}
            key={boxIdx}
          >
            <div
              className={joinClassNames(
                innerBoxColor(color),
                "rounded-lg text-center md:text-lg lg:text-2xl"
              )}
            >
              {box}
            </div>
          </div>
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

const ScoreCardLegendPenaltyRow = ({ dice }: { dice?: Dice }) => {
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
        <div className="flex">
          <div className="h-4 w-4 rounded-md border-2 border-black bg-white"></div>
          <div className="h-4 w-4 rounded-md border-2 border-black bg-white"></div>
          <div className="h-4 w-4 rounded-md border-2 border-black bg-white"></div>
          <div className="h-4 w-4 rounded-md border-2 border-black bg-white"></div>
        </div>
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
