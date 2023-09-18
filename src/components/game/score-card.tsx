import { joinClassNames } from "~/utils/joinClassNames";
import { LockClosedIcon, PlayIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

export const ScoreCard = () => {
  return (
    <>
      <div className="bg-[#dddddf] px-4">
        <div className="flex justify-end pr-4">
          <div className="rounded-t-lg border-l-2 border-r-2 border-t-2 border-black p-2">
            At least 5 X&apos;s
          </div>
        </div>
        <ScoreCardRow color="red" />
        <ScoreCardRow color="yellow" />
        <ScoreCardRow color="green" />
        <ScoreCardRow color="blue" />
        <ScoreCardLegendPenaltyRow />
      </div>
      <div className="bg-[#aaa9af] p-4">
        <ScoreCardTotalRow />
      </div>
    </>
  );
};

const ScoreCardLegendPenaltyRow = () => {
  return (
    <div className="flex items-center justify-around py-4">
      <div className="grid grid-cols-1 divide-y divide-black">
        <div className=" rounded-lg border-2 border-black bg-white text-center">
          X
        </div>
        <div className="text-center">points</div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
        <div className="text-center">1x</div>
        <div className="text-center">1</div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
        <div className="text-center">2x</div>
        <div className="text-center">3</div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
        <div className="text-center">3x</div>
        <div className="text-center">6</div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
        <div className="text-center">4x</div>
        <div className="text-center">10</div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
        <div className="text-center">5x</div>
        <div className="text-center">15</div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
        <div className="text-center">6x</div>
        <div className="text-center">21</div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
        <div className="text-center">7x</div>
        <div className="text-center">28</div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
        <div className="text-center">8x</div>
        <div className="text-center">36</div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
        <div className="text-center">9x</div>
        <div className="text-center">45</div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
        <div className="text-center">10x</div>
        <div className="text-center">55</div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
        <div className="text-center">11x</div>
        <div className="text-center">66</div>
      </div>
      <div className="grid grid-cols-1 divide-y divide-black rounded-lg border-2 border-black">
        <div className="text-center">12x</div>
        <div className="text-center">78</div>
      </div>
      <div className="grid grid-cols-1">
        <div className="text-center">
          <span className="text-red-500">X</span> = -5
        </div>
        <div className="flex gap-2">
          <div className="min-h-[30px] min-w-[30px] rounded-md border-2 border-black bg-white"></div>
          <div className="min-h-[30px] min-w-[30px] rounded-md border-2 border-black bg-white"></div>
          <div className="min-h-[30px] min-w-[30px] rounded-md border-2 border-black bg-white"></div>
          <div className="min-h-[30px] min-w-[30px] rounded-md border-2 border-black bg-white"></div>
        </div>
      </div>
    </div>
  );
};

const ScoreCardTotalRow = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="">totals</div>
      <div
        className={joinClassNames(
          "min-h-[40px] min-w-[80px] rounded-xl rounded-xl border-2 border-[#7b0200] bg-[#fed0d0]"
        )}
      ></div>
      <div className="">+</div>
      <div
        className={joinClassNames(
          "min-h-[40px] min-w-[80px] rounded-xl border-2 border-[#946704] bg-[#fffece]"
        )}
      ></div>
      <div className="">+</div>
      <div
        className={joinClassNames(
          "min-h-[40px] min-w-[80px] rounded-xl border-2 border-[#f1fdf0] bg-[#f1fdf0]"
        )}
      ></div>
      <div className="">+</div>
      <div
        className={joinClassNames(
          "min-h-[40px] min-w-[80px] rounded-xl border-2 border-[#023464] bg-[#e0e1ff]"
        )}
      ></div>
      <div className="">-</div>
      <div
        className={joinClassNames(
          "min-h-[40px] min-w-[80px] rounded-xl rounded-xl border-2 border-black bg-white"
        )}
      ></div>
      <div className="">=</div>
      <div className="min-h-[40px] min-w-[120px] rounded-xl border-2 border-black bg-white"></div>
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
    <div
      className={joinClassNames(colorSwitch(color), "flex items-center p-4")}
    >
      <PlayIcon className="h-6 text-black" />

      {row.map((box, boxIdx) => (
        <div className={joinClassNames(borderBoxColor(color))} key={boxIdx}>
          <div
            className={joinClassNames(
              innerBoxColor(color),
              "min-w-[49px] rounded-lg p-4 text-center"
            )}
          >
            {box}
          </div>
        </div>
      ))}

      <div
        className={joinClassNames(
          innerBoxColor(color),
          "ml-2 rounded-full p-4"
        )}
      >
        <LockClosedIcon className={joinClassNames(iconColor(color), "h-6")} />
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
