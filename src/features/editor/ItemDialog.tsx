import { useEffect, useId, useRef, useState } from "react";
import type { MouseEvent, ReactNode, SyntheticEvent } from "react";
import { ConfirmDialog } from "./ConfirmDialog";
import { ErrorIcon } from "./TextField";

interface ItemDialogProps {
  /** Full heading, e.g. "Edit work experience". */
  title: string;
  /** One line under the heading on wide screens. */
  description: string;
  /** What one item is called in sentences, e.g. "experience". */
  itemNoun: string;
  isEditing: boolean;
  /** Unsaved edits: closing asks before throwing them away. */
  isDirty: boolean;
  /** Labels of the fields blocking Save; empty hides the summary alert. */
  errorLabels: readonly string[];
  /** Bumps on each blocked save; focus then moves to the first invalid field. */
  blockedSaveCount: number;
  onSave: () => void;
  onCancel: () => void;
  children: ReactNode;
}

function joinLabels(labels: readonly string[]): string {
  return labels.map((label) => label.toLowerCase()).join(" and ");
}

function ErrorSummary({ labels, itemNoun }: { labels: readonly string[]; itemNoun: string }) {
  const count = labels.length === 1 ? "1 field needs" : `${labels.length} fields need`;
  return (
    <div className="alert alert--danger" role="alert">
      <ErrorIcon size={18} />
      <div>
        <p className="alert__title">{`${count} attention`}</p>
        <p className="alert__text">{`Fix the ${joinLabels(labels)} before saving this ${itemNoun}.`}</p>
      </div>
    </div>
  );
}

/** Add/edit popup: native <dialog> — top layer, focus trap, labelled by its
 *  title. Header and footer stay put while the form body scrolls; below
 *  768px it becomes a bottom sheet. Escape, Cancel, Close and the backdrop
 *  all close an unchanged form, and ask first when there are edits. React
 *  stays the single owner of open state (the native close is prevented). */
export function ItemDialog({
  title,
  description,
  itemNoun,
  isEditing,
  isDirty,
  errorLabels,
  blockedSaveCount,
  onSave,
  onCancel,
  children,
}: ItemDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const [isConfirmingDiscard, setIsConfirmingDiscard] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog === null || dialog.open) return;
    const opener = document.activeElement;
    dialog.showModal();
    // showModal focuses the first focusable element, which is the Close
    // button; the form's first field is where a user starts typing.
    dialog.querySelector<HTMLElement>(".modal__body :is(input, [contenteditable])")?.focus();
    return () => {
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  useEffect(() => {
    if (blockedSaveCount === 0) return;
    dialogRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [blockedSaveCount]);

  const requestClose = () => {
    if (isDirty) {
      setIsConfirmingDiscard(true);
      return;
    }
    onCancel();
  };

  const handleCancelRequest = (event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault();
    requestClose();
  };

  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    const dialog = dialogRef.current;
    if (dialog === null || event.target !== dialog) return;
    // Backdrop clicks target the dialog element — but so do clicks on the
    // dialog's own padding. Only treat hits outside the box as a close.
    const rect = dialog.getBoundingClientRect();
    const isOutsideBox =
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom;
    if (isOutsideBox) requestClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="modal modal--form"
      aria-labelledby={titleId}
      onCancel={handleCancelRequest}
      onClick={handleBackdropClick}
    >
      <header className="modal__header">
        <div className="modal__heading">
          <h2 className="modal__title" id={titleId}>
            {title}
          </h2>
          <p className="modal__description">{description}</p>
          <p className="modal__description modal__description--compact">
            Fields marked * are required.
          </p>
        </div>
        <button type="button" className="modal__close" aria-label="Close" onClick={requestClose}>
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6L6 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>
      <div className="modal__body">
        {errorLabels.length > 0 && <ErrorSummary labels={errorLabels} itemNoun={itemNoun} />}
        {children}
      </div>
      <footer className="modal__footer">
        <p className="modal__required-note">* Required fields</p>
        <div className="modal__actions">
          <button type="button" className="btn btn--secondary" onClick={requestClose}>
            Cancel
          </button>
          <button type="button" className="btn btn--primary" onClick={onSave}>
            {isEditing ? "Save changes" : "Save"}
          </button>
        </div>
      </footer>
      <ConfirmDialog
        isOpen={isConfirmingDiscard}
        eyebrow="UNSAVED CHANGES"
        title="Discard your changes?"
        description={`Your edits to this ${itemNoun} haven’t been saved and will be lost.`}
        confirmLabel="Discard"
        cancelLabel="Keep editing"
        onConfirm={() => {
          setIsConfirmingDiscard(false);
          onCancel();
        }}
        onCancel={() => setIsConfirmingDiscard(false)}
      />
    </dialog>
  );
}
