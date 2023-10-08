import { useState } from "react";
import { DiceRoll } from "./dice-roll";
import { GameNav } from "./game-nav";
import { ScoreCardViewSelect } from "./score-card-view-select";
import { ScoreCard } from "./score-card";
import { PlayersScoreCards } from "./players-score-cards";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { UserCircleIcon } from "@heroicons/react/24/solid";
import { joinClassNames } from "~/utils/joinClassNames";
import { GameLayout } from "../layout/game-layout";

export const GameWindow = () => {
  const [cardView, setCardView] = useState("myCard");
  const session = useSession();
  const router = useRouter();
  const { data: game } = api.game.byId.useQuery(
    {
      id: router.query.gid as string,
    },
    { enabled: !!router.query.gid }
  );

  if (!session || !game)
    return (
      <GameLayout>
        <div className="flex h-screen flex-col items-center justify-center">
          ...loading
        </div>
      </GameLayout>
    );
  return (
    <>
      <div className="flex h-screen flex-col">
        <div className="bg-blue-800">
          <GameNav />
        </div>
        <div className="flex justify-center bg-white/50 p-2">
          {game?.scoreCards?.map((card) => (
            <div
              key={card.user.id}
              className={joinClassNames(
                game?.diceRolls[0]?.userId === card.user.id
                  ? "bg-green-200 text-green-900"
                  : "text-blue-900",
                "flex items-center rounded-lg p-1"
              )}
            >
              <UserCircleIcon className="h-6 w-6" />
              <div className="pl-1 pr-2 text-xl">{card.user.name}</div>
            </div>
          ))}
        </div>
        <div className="p-2">
          <DiceRoll
            players={game?.scoreCards?.map((card) => ({
              name: card.user.name,
              userId: card.user.id,
              cardId: card.id,
            }))}
          />
        </div>
        <div className="grow p-2">
          {cardView === "myCard" ? (
            <ScoreCard
              playerName={session?.data?.user?.name ?? "no name"}
              playerId={session?.data?.user?.id ?? "-1"}
              isMyCard={true}
            />
          ) : (
            <div className="max-h-96 overflow-auto">
              <PlayersScoreCards />
            </div>
          )}
        </div>
        <div className="px-2 pb-11">
          <ScoreCardViewSelect setCardView={setCardView} />
        </div>
      </div>
    </>
  );
};
