import { DiceRoll } from "./dice-roll";
import { OpponentsScoreCards } from "./opponents-score-cards";
import { ScoreCard } from "./score-card";

export const GameWindow = () => {
  return (
    <div>
      <DiceRoll />
      <OpponentsScoreCards />
      <div className="">
        <ScoreCard />
      </div>
    </div>
  );
};
