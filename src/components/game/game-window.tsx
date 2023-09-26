import { DiceRoll } from "./dice-roll";
import { GameNav } from "./game-nav";
import { ScoreCard } from "./score-card";

export const GameWindow = () => {
  return (
    <div className="">
      <div className="flex min-h-screen flex-col">
        <div className="">
          <DiceRoll />
        </div>
        <div className="">
          <GameNav />
        </div>
        <div className="p-2">
          <ScoreCard />
        </div>
      </div>
    </div>
  );
};
