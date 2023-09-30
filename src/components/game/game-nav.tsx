import { ClipboardDocumentIcon } from "@heroicons/react/24/solid";
import Link from "next/link";

export function GameNav() {
  return (
    <div className="flex gap-4 p-4">
      <div>
        <Link href="/new-game">
          <button className="">New Game</button>
        </Link>
      </div>
      <div>
        <button className="flex items-center">
          <ClipboardDocumentIcon className="h-4 w-4" />
          <span>Copy Game Link</span>
        </button>
      </div>
    </div>
  );
}
