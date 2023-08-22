import { api } from "~/utils/api";

export default function NewGame() {
  const hello = api.example.hello.useQuery({ text: "from tRPC" });

  return <div>New Game</div>;
}
