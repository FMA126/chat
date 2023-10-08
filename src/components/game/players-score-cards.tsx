import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { ScoreCard } from "./score-card";
import { useSession } from "next-auth/react";

export function PlayersScoreCards() {
  const router = useRouter();
  const session = useSession();
  const { data, error } = api.game.byId.useQuery(
    {
      id: router.query.gid as string,
    },
    { enabled: !!router.query.gid }
  );
  if (error) return <div>...error</div>;
  if (!data) {
    return <div>...loading players cards</div>;
  }

  return (
    <>
      {data?.scoreCards?.map((scoreCard, scoreCardIdx) => (
        <div key={scoreCard.user.name}>
          <ScoreCard
            playerName={scoreCard.user.name ?? "no name"}
            playerId={scoreCard.user.id}
            isMyCard={scoreCard.user.id === session.data?.user.id}
          />
        </div>
      ))}
    </>
  );
}
