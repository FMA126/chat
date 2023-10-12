import { faPeopleGroup, faTableList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type Dispatch, type SetStateAction } from "react";

export function ScoreCardViewSelect({
  setCardView,
}: {
  setCardView: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="flex justify-center gap-1 text-xs sm:text-base">
      <div>
        <button
          className="flex items-center gap-2 rounded-lg border-2 border-solid bg-cyan-800 px-4 py-2 text-white active:bg-cyan-500"
          onClick={() => setCardView("myCard")}
        >
          <FontAwesomeIcon
            icon={faTableList}
            className="h-6 w-6 pr-2 text-white"
          />
          <span>My Scorecard</span>
        </button>
      </div>
      <div>
        <button
          className="inline-block flex items-center gap-2 rounded-lg border-2 border-solid bg-cyan-800 px-4 py-2 text-white active:bg-cyan-500"
          onClick={() => setCardView("players")}
        >
          <FontAwesomeIcon
            icon={faPeopleGroup}
            className="white h-6 w-6 pr-2"
          />
          <span>All Scorecards</span>
        </button>
      </div>
    </div>
  );
}
