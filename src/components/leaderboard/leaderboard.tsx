import { api } from "~/utils/api";
import { GameLayout } from "../layout/game-layout";
import { useRouter } from "next/router";
import { ArrowLeftIcon } from "@heroicons/react/24/solid";

export const LeaderBoard = () => {
  const router = useRouter();
  const { data: leaders } = api.leaderBoard.getLeaderBoard.useQuery();
  if (!leaders)
    return (
      <GameLayout>
        <div className="flex min-h-screen items-center justify-center text-white">
          ...loading
        </div>
      </GameLayout>
    );
  return (
    <GameLayout>
      <div className="p-2 text-white">
        <button
          className="flex items-center gap-2 rounded-xl border border-white bg-white/10 p-2 hover:bg-white/40"
          onClick={() => void router.push("/")}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Home</span>
        </button>
      </div>
      <div className="flex flex-col items-center text-white">
        <h2 className="text-bold mb-2 text-center text-2xl">Leader Board</h2>
        <table className="min-w-[50vw] rounded-xl bg-white/10 text-center">
          <thead>
            <tr className="">
              <td>Name</td>
              <td>Wins</td>
            </tr>
          </thead>
          <tbody>
            {leaders.map((user, userIdx) => (
              <tr key={userIdx} className="border-t border-t-white">
                <td>{user.winnerName}</td>
                <td>{`${user.countOf}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GameLayout>
  );
};
