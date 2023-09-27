import { DiceRoll } from "./dice-roll";
import { GameNav } from "./game-nav";
import { Opponents } from "./opponents";
import { ScoreCard } from "./score-card";

export const GameWindow = () => {
  return (
    <div className="">
      <div className="flex min-h-screen flex-col justify-between">
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
          <Opponents />
        </div>
      </div>
    </div>
  );
};
