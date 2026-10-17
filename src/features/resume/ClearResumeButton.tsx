import { useState } from "react";
import { emptyResume } from "../../lib/schema/resume";
import { ConfirmDialog } from "../editor/ConfirmDialog";
import { useResumeDispatch } from "./useResume";

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path
        d="M2 3.5h10M5.5 3.5V2h3v1.5M3.5 3.5l.5 8.5h6l.5-8.5M5.75 6v3.75M8.25 6v3.75"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface ClearResumeButtonProps {
  /** Called after the resume is emptied, so forms holding drafts can reset. */
  onCleared: () => void;
}

/** Header action that empties the whole resume after a confirmation, since
 *  there is no undo and the data lives only in this browser. */
export function ClearResumeButton({ onCleared }: ClearResumeButtonProps) {
  const dispatch = useResumeDispatch();
  const [isConfirming, setIsConfirming] = useState(false);

  const confirmClear = () => {
    dispatch({ type: "REPLACE_ALL", resume: emptyResume() });
    setIsConfirming(false);
    onCleared();
  };

  return (
    <>
      <button
        type="button"
        className="btn btn--secondary clear-button"
        onClick={() => setIsConfirming(true)}
      >
        <TrashIcon />
        <span className="clear-button__label">Clear</span>
      </button>
      <ConfirmDialog
        isOpen={isConfirming}
        eyebrow="CLEAR RESUME"
        title="Clear everything?"
        description="This deletes every section of your resume from this browser. It can’t be undone."
        confirmLabel="Clear resume"
        onConfirm={confirmClear}
        onCancel={() => setIsConfirming(false)}
      />
    </>
  );
}
