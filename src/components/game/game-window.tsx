import { useState } from "react";
import { DiceRoll } from "./dice-roll";
import { GameNav } from "./game-nav";
import { ScoreCardViewSelect } from "./score-card-view-select";
import { ScoreCard } from "./score-card";

export const GameWindow = () => {
  const [cardView, setCardView] = useState("myCard");
  return (
    <div className="">
      <div className="flex flex-col justify-between">
        <div className="">
          <GameNav />
        </div>
        <div className="">
          <DiceRoll />
        </div>
        <div className="p-2">
          <ScoreCard />
        </div>
        <div>
          <ScoreCardViewSelect setCardView={setCardView} />
        </div>
      </div>
    </div>
  );
};
