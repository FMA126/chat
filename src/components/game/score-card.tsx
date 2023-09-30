import { joinClassNames } from "~/utils/joinClassNames";
import { LockClosedIcon, PlayIcon, UserIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import { useSession } from "next-auth/react";

export const ScoreCard = ({ playerName }: { playerName: string }) => {
  const session = useSession();
  return (
    <>
      <div className="container mx-auto border-2 border-solid border-black bg-[#dddddf] p-1">
        <div className="flex justify-between">
          <div className="flex items-center gap-2">
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
        <ScoreCardTotalRow />
      </div>
    </>
  );
};

const ScoreCardLegendPenaltyRow = () => {
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
    <div className="flex items-center gap-2 py-2">
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

const ScoreCardRow = ({ color }: { color: string }) => {
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
