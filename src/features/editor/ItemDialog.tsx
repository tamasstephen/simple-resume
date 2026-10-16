import { useEffect, useId, useRef } from "react";
import type { MouseEvent, ReactNode, SyntheticEvent } from "react";

interface ItemDialogProps {
  title: string;
  /** Mono line above the heading, e.g. "04 / EXPERIENCE / NEW". */
  eyebrow: string;
  isEditing: boolean;
  canSave: boolean;
  onSave: () => void;
  onCancel: () => void;
  children: ReactNode;
}

/** Add/edit popup: native <dialog> — top layer, focus trap, Esc = cancel.
    Backdrop clicks cancel too; React stays the single owner of open state
    (the native close is prevented and the draft unmounts via onCancel). */
export function ItemDialog({
  title,
  eyebrow,
  isEditing,
  canSave,
  onSave,
  onCancel,
  children,
}: ItemDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null || dialog.open) return;
    const opener = document.activeElement;
    dialog.showModal();
    // showModal focuses the first focusable element, which is now the Close
    // button; the form's first field is where a user starts typing.
    dialog.querySelector<HTMLElement>(".modal__form :is(input, textarea)")?.focus();
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  const handleCancelRequest = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    onCancel();
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (dialog === null || event.target !== dialog) return;
    // Backdrop clicks target the dialog element — but so do clicks on the
    // dialog's own padding. Only cancel when the hit is outside the box.
    const rect = dialog.getBoundingClientRect();
    const isOutsideBox =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (isOutsideBox) onCancel();
  };

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      aria-labelledby={titleId}
      onCancel={handleCancelRequest}
      onClick={handleBackdropClick}
    >
      <header className="modal__header">
        <div>
          <p className="modal__eyebrow">{eyebrow}</p>
          <h2 className="modal__title" id={titleId}>
            {isEditing ? "Edit" : "Add"} {title}
          </h2>
        </div>
        <button type="button" className="modal__close" aria-label="Close" onClick={onCancel}>
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
            <path
              d="M6 6l8 8M14 6l-8 8"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>
      <div className="modal__form">{children}</div>
      <div className="modal__actions">
        <button type="button" className="btn btn--secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn--primary" onClick={onSave} disabled={!canSave}>
          {isEditing ? "Save changes" : "Save"}
        </button>
      </div>
    </dialog>
  );
}
