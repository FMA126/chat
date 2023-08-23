import toast from "react-hot-toast";
import { api } from "~/utils/api";

export default function NewGame() {
  const startNewGame = api.newGame.createNewGame.useMutation();

  const handleStartGame = () => {
    startNewGame.mutate();
    toast.success("Game created successfully");

    // toast.error("Error starting game");
  };

  return (
    <div>
      <h2>New Game</h2>
      <button onClick={handleStartGame}>Start Game</button>
      <div>{startNewGame.data && startNewGame.data.id}</div>
    </div>
  );
}
