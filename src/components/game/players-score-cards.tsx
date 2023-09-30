import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { ScoreCard } from "./score-card";

export function PlayersScoreCards() {
  const router = useRouter();
  const { data, error } = api.game.byId.useQuery({
    id: router.query.gid as string,
  });
  if (error) return <div>...error</div>;
  if (!data) {
    return <div>...loading players cards</div>;
  }

  return (
    <>
      {data?.scoreCards?.map((scoreCard, scoreCardIdx) => (
        <div key={scoreCard.user.name}>
          <ScoreCard playerName={scoreCard.user.name ?? "no name"} />
        </div>
      ))}
    </>
  );
}
