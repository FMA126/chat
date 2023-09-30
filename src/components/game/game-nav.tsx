import { ClipboardDocumentIcon } from "@heroicons/react/24/solid";
import clipboard from "clipboardy";
import Link from "next/link";
import { useRouter } from "next/router";
import toast from "react-hot-toast";

export function GameNav() {
  const router = useRouter();

  const handleCopy = async () => {
    await clipboard.write(
      `${
        process.env.NODE_ENV === "development"
          ? "localhost:3000"
          : "https://chat-fma126.vercel.app"
      }` + router.asPath
    );
    toast.success("Game link copied!");
  };
  return (
    <div className="flex gap-4 p-4">
      <div>
        <Link href="/new-game">
          <button className="rounded-lg border-2 border-solid border-green-200 px-4 py-2 text-white active:bg-gray-200">
            New Game
          </button>
        </Link>
      </div>
      <div>
        <button
          onClick={() => void handleCopy()}
          className="flex items-center gap-2 rounded-lg border-2 border-solid border-green-200 px-4 py-2 text-white active:bg-gray-200"
        >
          <ClipboardDocumentIcon className="h-4 w-4" />
          <span>Copy Game Link</span>
        </button>
      </div>
    </div>
  );
}
