import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import { DiceRoll } from "./dice-roll";
import { GameNav } from "./game-nav";
import { ScoreCardViewSelect } from "./score-card-view-select";
import { ScoreCard } from "./score-card";
import { PlayersScoreCards } from "./players-score-cards";
import { useSession } from "next-auth/react";
import { api } from "~/utils/api";
import { useRouter } from "next/router";
import { CheckBadgeIcon, UserCircleIcon } from "@heroicons/react/24/solid";
import { joinClassNames } from "~/utils/joinClassNames";
import { GameLayout } from "../layout/game-layout";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDice } from "@fortawesome/free-solid-svg-icons";
import { Chat } from "./chat";
import { Tutorial } from "./tutorial";
import { Settings } from "./settings";

export const GameWindow = ({
  unseenMessages,
  setUnseenMessages,
}: {
  unseenMessages: boolean;
  setUnseenMessages: Dispatch<SetStateAction<boolean>>;
}) => {
  const [cardView, setCardView] = useState("myCard");
  const session = useSession();
  const router = useRouter();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);
  const [showEditName, setShowEditName] = useState(false);
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
      {/* <Chat isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} /> */}
      <Tutorial
        isTutorialOpen={isTutorialOpen}
        setIsTutorialOpen={setIsTutorialOpen}
      />
      <Settings showEditName={showEditName} setShowEditName={setShowEditName} />
      <div className="flex h-screen flex-col">
        <div className="bg-blue-800">
          <GameNav
            setIsTutorialOpen={setIsTutorialOpen}
            setShowEditName={setShowEditName}
          />
        </div>
        <div className="flex flex-wrap justify-center bg-white/50 p-2">
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
              {game?.diceRolls[0]?.userId === card.user.id ? (
                card.scoreCardEntries.find(
                  (entry) => entry.diceRollId === game?.diceRolls[0]?.id
                ) ? (
                  <CheckBadgeIcon className="h-4 w-4 text-green-900" />
                ) : (
                  <FontAwesomeIcon icon={faDice} />
                )
              ) : card.scoreCardEntries.find(
                  (entry) => entry.diceRollId === game?.diceRolls[0]?.id
                ) ? (
                <CheckBadgeIcon className="h-4 w-4 text-green-900" />
              ) : (
                <UserCircleIcon className="h-4 w-4" />
              )}
              <div className="pl-1 pr-2 text-xs md:text-xl">
                {card.user.name}
              </div>
            </div>
          ))}
        </div>
        {game.gameState === "over" && !!game.winner ? (
          <div className="text-center">
            winner:{" "}
            {game.scoreCards.find((sc) => sc.userId === game.winner)?.user.name}
          </div>
        ) : (
          <div className="p-2">
            <DiceRoll
              players={game?.scoreCards?.map((card) => ({
                name: card.user.name,
                userId: card.user.id,
                cardId: card.id,
              }))}
            />
          </div>
        )}
        <div className="">
          <ScoreCardViewSelect
            unseenMessages={unseenMessages}
            setCardView={setCardView}
          />
        </div>
        <div className="grow py-2 sm:px-2">
          {cardView === "myCard" && (
            <ScoreCard
              playerName={session?.data?.user?.name ?? "no name"}
              playerId={session?.data?.user?.id ?? "-1"}
              isMyCard={true}
            />
          )}
          {cardView === "players" && (
            <div className="max-h-[60vh] overflow-auto">
              <PlayersScoreCards />
            </div>
          )}
          {cardView === "chat" && (
            <Chat setUnseenMessages={setUnseenMessages} />
          )}
        </div>
      </div>
    </>
  );
};
