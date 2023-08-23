import { api } from "~/utils/api";

export default function NewGame() {
  const startNewGame = api.newGame.createNewGame.useQuery();

  return <div>New Game</div>;
}
