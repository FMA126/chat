import { useState } from "react";
import { DiceRoll } from "./dice-roll";
import { GameNav } from "./game-nav";
import { ScoreCardViewSelect } from "./score-card-view-select";
import { ScoreCard } from "./score-card";
import { PlayersScoreCards } from "./players-score-cards";

export const GameWindow = () => {
  const [cardView, setCardView] = useState("myCard");
  return (
    <>
      <div className="flex h-screen flex-col justify-between">
        <div className="">
          <GameNav />
        </div>
        <div className="p-2">
          <DiceRoll />
        </div>
        <div className="p-2">
          {cardView === "myCard" ? (
            <ScoreCard />
          ) : (
            <div className="h-64 overflow-auto">
              <PlayersScoreCards />
            </div>
          )}
        </div>
        <div className="p-2">
          <ScoreCardViewSelect setCardView={setCardView} />
        </div>
      </div>
    </>
  );
};
