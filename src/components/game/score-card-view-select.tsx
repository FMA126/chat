import { faPeopleGroup, faTableList } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { type Dispatch, type SetStateAction } from "react";

export function ScoreCardViewSelect({
  setCardView,
}: {
  setCardView: Dispatch<SetStateAction<string>>;
}) {
  return (
    <div className="container mx-auto flex justify-end gap-1">
      <div></div>
      <div></div>
      <div></div>
      <div>
        <button
          className="rounded-lg border-2 border-solid bg-cyan-300 text-cyan-900"
          onClick={() => setCardView("myCard")}
        >
          <FontAwesomeIcon
            icon={faTableList}
            className="h-6 w-6 pr-2 text-cyan-900"
          />
          <span>My Scorecard</span>
        </button>
      </div>
      <div>
        <button
          className="inline-block rounded-lg border-2 border-solid bg-cyan-300 text-cyan-900"
          onClick={() => setCardView("players")}
        >
          <FontAwesomeIcon
            icon={faPeopleGroup}
            className="h-6 w-6 pr-2 text-cyan-900"
          />
          <span>Players</span>
        </button>
      </div>
    </div>
  );
}
