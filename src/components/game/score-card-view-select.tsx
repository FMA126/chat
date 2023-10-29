import { faPeopleGroup, faTableList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  ChatBubbleBottomCenterTextIcon,
  EnvelopeIcon,
} from "@heroicons/react/24/solid";
import { type Dispatch, type SetStateAction } from "react";

export function ScoreCardViewSelect({
  unseenMessages,
  setCardView,
}: {
  unseenMessages: boolean;
  setCardView: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="flex justify-center gap-1 text-xs sm:text-base">
      <div>
        <button
          className="flex items-center gap-1 rounded-lg border-2 border-solid bg-cyan-800 px-4 py-2 text-white active:bg-cyan-500 md:gap-2"
          onClick={() => setCardView("myCard")}
        >
          <FontAwesomeIcon
            icon={faTableList}
            className="h-4 w-4  text-white md:h-6 md:w-6"
          />
          <span>My card</span>
        </button>
      </div>
      <div>
        <button
          className="inline-block flex items-center gap-1 rounded-lg border-2 border-solid bg-cyan-800 px-4 py-2 text-white active:bg-cyan-500 md:gap-2"
          onClick={() => setCardView("players")}
        >
          <FontAwesomeIcon
            icon={faPeopleGroup}
            className="h-4 w-4  md:h-6 md:w-6"
          />
          <span>All cards</span>
        </button>
      </div>
      <div className="relative">
        {unseenMessages && (
          <EnvelopeIcon className="absolute -inset-2 z-20 h-6 w-6 animate-pulse rounded-xl bg-white/70 text-green-600 md:h-8 md:w-8" />
        )}
        <button
          className="inline-block flex items-center gap-1 rounded-lg border-2 border-solid bg-cyan-800 px-4 py-2 text-white active:bg-cyan-500 md:gap-2"
          onClick={() => setCardView("chat")}
        >
          <ChatBubbleBottomCenterTextIcon className="h-4 w-4 md:h-6 md:w-6" />
          <span>Chat</span>
        </button>
      </div>
    </div>
  );
}
