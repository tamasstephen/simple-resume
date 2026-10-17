import { useCallback, useState } from "react";
import type { FieldErrors, Validator } from "../../lib/validation/sectionRules";
import { hasErrors } from "../../lib/validation/sectionRules";

export interface SectionDraftApi<T> {
  draft: T | null;
  isEditing: boolean;
  /** True once the draft differs from what was opened; closing then asks
   *  before discarding. */
  isDirty: boolean;
  /** Errors to show: fields the writer has left (blur) and, after a blocked
   *  save, every field — so nobody is scolded mid-typing. */
  errors: FieldErrors<T>;
  /** Bumps on every blocked save, so the dialog can move focus each time. */
  blockedSaveCount: number;
  startAdd(): void;
  startEdit(item: T): void;
  updateDraft(patch: Partial<T>): void;
  /** Marks a field as visited, so its error shows from now on. */
  touch(field: Extract<keyof T, string>): void;
  /** Hands a valid draft to `commit` and closes it; an invalid one stays
   *  open with its errors shown. */
  trySave(commit: (item: T) => void): void;
  cancel(): void;
}

const NO_RULES = () => ({});

function pickVisible<T>({
  errors,
  touched,
}: {
  errors: FieldErrors<T>;
  touched: ReadonlySet<string>;
}): FieldErrors<T> {
  const visible: FieldErrors<T> = { ...errors };
  for (const field of Object.keys(visible)) {
    if (!touched.has(field)) Reflect.deleteProperty(visible, field);
  }
  return visible;
}

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
  const [opened, setOpened] = useState<T | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [touched, setTouched] = useState<ReadonlySet<string>>(new Set());
  const [blockedSaveCount, setBlockedSaveCount] = useState(0);

  const open = useCallback((next: T, editing: boolean) => {
    setDraft(next);
    setOpened(next);
    setIsEditing(editing);
    setTouched(new Set());
    setBlockedSaveCount(0);
  }, []);

  const startAdd = useCallback(() => open(makeEmpty(), false), [makeEmpty, open]);

  const startEdit = useCallback((item: T) => open({ ...item }, true), [open]);

  const updateDraft = useCallback((patch: Partial<T>) => {
    setDraft((current) => (current === null ? current : { ...current, ...patch }));
  }, []);

  const touch = useCallback((field: Extract<keyof T, string>) => {
    setTouched((current) => (current.has(field) ? current : new Set(current).add(field)));
  }, []);

  const cancel = useCallback(() => {
    setDraft(null);
    setOpened(null);
    setIsEditing(false);
    setTouched(new Set());
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

  const allErrors = draft === null ? {} : validate(draft);
  const errors = blockedSaveCount > 0 ? allErrors : pickVisible({ errors: allErrors, touched });
  const isDirty = draft !== null && JSON.stringify(draft) !== JSON.stringify(opened);

  return {
    draft,
    isEditing,
    isDirty,
    errors,
    blockedSaveCount,
    startAdd,
    startEdit,
    updateDraft,
    touch,
    trySave,
    cancel,
  };
}
