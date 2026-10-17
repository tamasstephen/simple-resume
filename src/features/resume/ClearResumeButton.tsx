import { useId, useRef } from "react";
import type { MouseEvent } from "react";
import { emptyResume } from "../../lib/schema/resume";
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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  const closeDialog = () => dialogRef.current?.close();

  const confirmClear = () => {
    dispatch({ type: "REPLACE_ALL", resume: emptyResume() });
    closeDialog();
    onCleared();
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) closeDialog();
  };

  return (
    <>
      <button
        type="button"
        className="btn btn--secondary clear-button"
        onClick={() => dialogRef.current?.showModal()}
      >
        <TrashIcon />
        <span className="clear-button__label">Clear</span>
      </button>
      <dialog
        ref={dialogRef}
        className="modal modal--confirm"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        onClick={handleBackdropClick}
      >
        <div className="modal__header">
          <div>
            <p className="modal__eyebrow">CLEAR RESUME</p>
            <h2 className="modal__title" id={titleId}>
              Clear everything?
            </h2>
          </div>
        </div>
        <p className="modal__form" id={descriptionId}>
          This deletes every section of your resume from this browser. It can’t be undone.
        </p>
        <div className="modal__actions">
          {/* First in DOM order, so showModal focuses the safe choice. */}
          <button type="button" className="btn btn--secondary" onClick={closeDialog}>
            Cancel
          </button>
          <button type="button" className="btn btn--danger" onClick={confirmClear}>
            Clear resume
          </button>
        </div>
      </dialog>
    </>
  );
}
