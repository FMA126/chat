import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { AuthShowcase } from "..";
import { GameWindow } from "~/components/game/game-window";

export default function Game() {
  const router = useRouter();
  // const hello = api.example.hello.useQuery({ text: "from tRPC" });
  const { data: session } = useSession();

  if (!session) {
    return <AuthShowcase />;
  }

  return (
    <div>
      <GameWindow />
    </div>
  );
}
