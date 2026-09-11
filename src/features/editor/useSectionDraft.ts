import { useCallback, useState } from "react";

export interface SectionDraftApi<T> {
  draft: T | null;
  isEditing: boolean;
  startAdd(): void;
  startEdit(item: T): void;
  updateDraft(patch: Partial<T>): void;
  cancel(): void;
}

/**
 * Owns the in-progress draft for one section's form. The draft lives in local
 * state and is never committed here — the caller commits on Save. This is what
 * keeps typing from touching committed state (and the preview).
 */
export function useSectionDraft<T>(makeEmpty: () => T): SectionDraftApi<T> {
  const [draft, setDraft] = useState<T | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const startAdd = useCallback(() => {
    setDraft(makeEmpty());
    setIsEditing(false);
  }, [makeEmpty]);

  const startEdit = useCallback((item: T) => {
    setDraft({ ...item });
    setIsEditing(true);
  }, []);

  const updateDraft = useCallback((patch: Partial<T>) => {
    setDraft((current) => (current === null ? current : { ...current, ...patch }));
  }, []);

  const cancel = useCallback(() => {
    setDraft(null);
    setIsEditing(false);
  }, []);

  return { draft, isEditing, startAdd, startEdit, updateDraft, cancel };
}
