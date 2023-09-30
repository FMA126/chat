import { useState } from "react";
import { DiceRoll } from "./dice-roll";
import { GameNav } from "./game-nav";
import { ScoreCardViewSelect } from "./score-card-view-select";
import { ScoreCard } from "./score-card";
import { PlayersScoreCards } from "./players-score-cards";
import { useSession } from "next-auth/react";

export const GameWindow = () => {
  const [cardView, setCardView] = useState("myCard");
  const session = useSession();
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
            <ScoreCard playerName={session?.data?.user?.name ?? "no name"} />
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
