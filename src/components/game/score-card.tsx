import { joinClassNames } from "~/utils/joinClassNames";
import { PlayIcon } from "@heroicons/react/24/solid";
import { useState } from "react";

export const ScoreCard = () => {
  return (
    <>
      <div className="bg-[#dddddf] p-4">
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
    <div className="flex">
      <div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div>
        <div>1</div>
        <div></div>
        <div></div>
      </div>
      <div>
        <div>2</div>
        <div></div>
        <div></div>
      </div>
      <div>
        <div>3</div>
        <div></div>
        <div></div>
      </div>
      <div>
        <div>4</div>
        <div></div>
        <div></div>
      </div>
      <div>
        <div>5</div>
        <div></div>
        <div></div>
      </div>
      <div>
        <div>6</div>
        <div></div>
        <div></div>
      </div>
      <div>
        <div>7</div>
        <div></div>
        <div></div>
      </div>
      <div>
        <div>8</div>
        <div></div>
        <div></div>
      </div>
      <div>
        <div>9</div>
        <div></div>
        <div></div>
      </div>
      <div>
        <div>10</div>
        <div></div>
        <div></div>
      </div>
      <div>
        <div>11</div>
        <div></div>
        <div></div>
      </div>
      <div>
        <div>12</div>
        <div></div>
        <div></div>
      </div>
      <div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

const ScoreCardTotalRow = () => {
  return (
    <div className="flex">
      <div>totals</div>
      <div>red</div>
      <div>+</div>
      <div>yellow</div>
      <div>+</div>
      <div>green</div>
      <div>+</div>
      <div>blue</div>
      <div>-</div>
      <div>penalty</div>
      <div>=</div>
      <div>total</div>
    </div>
  );
};

const ScoreCardRow = ({ color }: { color: string }) => {
  const [row, setRow] = useState(new Array(12));
  return (
    <div className={joinClassNames(colorSwitch(color))}>
      <PlayIcon className="color-black h-6"></PlayIcon>
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
