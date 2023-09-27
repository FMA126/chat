import { faPeopleGroup, faTableList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type Dispatch, type SetStateAction } from "react";

export function ScoreCardViewSelect({
  setCardView,
}: {
  setCardView: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="grid grid-cols-5">
      <div></div>
      <div></div>
      <div>
        <button className="rounded-lg border-2 border-solid bg-cyan-300 px-4 py-2 text-cyan-900">
          <FontAwesomeIcon
            icon={faTableList}
            className="h-6 w-6 pr-2 text-white"
          />
          My Scorecard
        </button>
      </div>
      <div>
        <button className="rounded-lg border-2 border-solid bg-cyan-300 px-4 py-2 text-cyan-900">
          <FontAwesomeIcon
            icon={faPeopleGroup}
            className="h-6 w-6 pr-2 text-white"
          />
          Players
        </button>
      </div>
    </div>
  );
}
