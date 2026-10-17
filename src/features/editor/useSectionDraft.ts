import { useCallback, useState } from "react";
import type { FieldErrors, Validator } from "../../lib/validation/sectionRules";
import { hasErrors } from "../../lib/validation/sectionRules";

export interface SectionDraftApi<T> {
  draft: T | null;
  isEditing: boolean;
  /** Errors for the draft, empty until the first blocked save so nobody is
   *  scolded mid-typing; after that they track every edit. */
  errors: FieldErrors<T>;
  /** Bumps on every blocked save, so the dialog can move focus each time. */
  blockedSaveCount: number;
  startAdd(): void;
  startEdit(item: T): void;
  updateDraft(patch: Partial<T>): void;
  /** Hands a valid draft to `commit` and closes it; an invalid one stays
   *  open with its errors shown. */
  trySave(commit: (item: T) => void): void;
  cancel(): void;
}

const NO_RULES = () => ({});

/**
 * Owns the in-progress draft for one section's form. The draft lives in local
 * state and is never committed here — the caller commits on Save. This is what
 * keeps typing from touching committed state (and the preview).
 */
export function useSectionDraft<T>(
  makeEmpty: () => T,
  validate: Validator<T> = NO_RULES,
): SectionDraftApi<T> {
  const [draft, setDraft] = useState<T | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [blockedSaveCount, setBlockedSaveCount] = useState(0);

  const open = useCallback((next: T, editing: boolean) => {
    setDraft(next);
    setIsEditing(editing);
    setBlockedSaveCount(0);
  }, []);

  const startAdd = useCallback(() => open(makeEmpty(), false), [makeEmpty, open]);

  const startEdit = useCallback((item: T) => open({ ...item }, true), [open]);

  const updateDraft = useCallback((patch: Partial<T>) => {
    setDraft((current) => (current === null ? current : { ...current, ...patch }));
  }, []);

  const cancel = useCallback(() => {
    setDraft(null);
    setIsEditing(false);
    setBlockedSaveCount(0);
  }, []);

  const trySave = (commit: (item: T) => void) => {
    if (draft === null) return;
    if (hasErrors(validate(draft))) {
      setBlockedSaveCount((count) => count + 1);
      return;
    }
    commit(draft);
    cancel();
  };

  const errors = draft !== null && blockedSaveCount > 0 ? validate(draft) : {};

  return {
    draft,
    isEditing,
    errors,
    blockedSaveCount,
    startAdd,
    startEdit,
    updateDraft,
    trySave,
    cancel,
  };
}
