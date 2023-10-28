import {
  ChatBubbleBottomCenterIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/solid";
import clipboard from "clipboardy";
import Link from "next/link";
import { useRouter } from "next/router";
import { type Dispatch, type SetStateAction } from "react";
import toast from "react-hot-toast";

export function GameNav({
  setIsChatOpen,
}: {
  setIsChatOpen: Dispatch<SetStateAction<boolean>>;
}) {
  const router = useRouter();

  const handleCopy = async () => {
    await clipboard.write(
      `${
        process.env.NODE_ENV === "development"
          ? "localhost:3000"
          : "https://qwixxwithfriends.com"
      }` + router.asPath
    );
    toast.success("Game link copied!");
  };
  return (
    <div className="flex justify-center gap-4 p-1 md:p-2">
      <div>
        <Link href="/new-game">
          <button className="rounded-lg border-2 border-solid border-green-200 px-4 py-2 text-xs text-white active:bg-gray-200 md:text-base">
            New Game
          </button>
        </Link>
      </div>
      <div>
        <button
          onClick={() => void handleCopy()}
          className="flex items-center gap-2 rounded-lg border-2 border-solid border-green-200 px-4 py-2 text-xs text-white active:bg-gray-200 md:text-base"
        >
          <ClipboardDocumentIcon className="h-4 w-4" />
          <span>Copy Game Link</span>
        </button>
      </div>
      {/* <div>
        <button
          onClick={() => setIsChatOpen(true)}
          className="flex items-center gap-2 rounded-lg border-2 border-solid border-green-200 px-4 py-2 text-xs text-white active:bg-gray-200 md:text-base"
        >
          <ChatBubbleBottomCenterIcon className="h-4 w-4" />
          <span>Chat</span>
        </button>
      </div> */}
    </div>
  );
}
