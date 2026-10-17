import { useEffect, useId, useRef } from "react";
import type { MouseEvent, SyntheticEvent } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  eyebrow: string;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

/** Native modal asking before a destructive step. Cancel comes first in DOM
 *  order, so showModal focuses the safe choice. Events are stopped here:
 *  this may open inside another dialog, whose own Escape and backdrop
 *  handlers must not see them through React's tree. */
export function ConfirmDialog({
  isOpen,
  eyebrow,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null) return;
    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  const handleCancelRequest = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onCancel();
  };

  const handleClick = (event: MouseEvent<HTMLDialogElement>) => {
    event.stopPropagation();
    if (event.target === dialogRef.current) onCancel();
  };

  return (
    <dialog
      ref={dialogRef}
      className="modal modal--confirm"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      onCancel={handleCancelRequest}
      onClick={handleClick}
    >
      <div className="modal__header">
        <div className="modal__heading">
          <p className="modal__eyebrow">{eyebrow}</p>
          <h2 className="modal__title" id={titleId}>
            {title}
          </h2>
        </div>
      </div>
      <p className="modal__body modal__confirm-text" id={descriptionId}>
        {description}
      </p>
      <div className="modal__footer">
        <div className="modal__actions">
          <button type="button" className="btn btn--secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="btn btn--danger" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
