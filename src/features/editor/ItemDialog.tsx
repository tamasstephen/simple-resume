import { useEffect, useRef } from "react";
import type { MouseEvent, ReactNode, SyntheticEvent } from "react";

interface ItemDialogProps {
  title: string;
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
  isEditing,
  canSave,
  onSave,
  onCancel,
  children,
}: ItemDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null || dialog.open) return;
    dialog.showModal();
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
      aria-label={`${isEditing ? "Edit" : "Add"} ${title}`}
      onCancel={handleCancelRequest}
      onClick={handleBackdropClick}
    >
      <h2 className="modal__title">
        {isEditing ? "Edit" : "Add"} {title}
      </h2>
      <div className="modal__form">{children}</div>
      <div className="modal__actions">
        <button type="button" className="btn btn--primary" onClick={onSave} disabled={!canSave}>
          {isEditing ? "Save changes" : "Save"}
        </button>
        <button type="button" className="btn btn--text" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </dialog>
  );
}
