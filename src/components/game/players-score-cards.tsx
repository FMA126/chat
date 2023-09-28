import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { ScoreCard } from "./score-card";

export function PlayersScoreCards() {
  const router = useRouter();
  const { data } = api.game.byId.useQuery({
    id: router.query.gid as string,
  });
  if (!data) {
    return <div>...loading players cards</div>;
  }

  return (
    <>
      {data?.scoreCards?.map((scoreCard) => (
        <>
          <ScoreCard />
        </>
      ))}
    </>
  );
}
