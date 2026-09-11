import type { ReactNode } from "react";

export interface SectionEditorProps<T extends { id: string }> {
  title: string;
  items: readonly T[];
  draft: T | null;
  isEditing: boolean;
  canSave: boolean;
  renderSummary: (item: T) => ReactNode;
  renderForm: () => ReactNode;
  onAdd: () => void;
  onEditItem: (item: T) => void;
  onDeleteItem: (id: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

/** Generic save-based section shell: saved-items list + add/edit/delete + draft form. */
export function SectionEditor<T extends { id: string }>({
  title,
  items,
  draft,
  isEditing,
  canSave,
  renderSummary,
  renderForm,
  onAdd,
  onEditItem,
  onDeleteItem,
  onSave,
  onCancel,
}: SectionEditorProps<T>) {
  return (
    <section aria-label={title}>
      <h2>{title}</h2>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            {renderSummary(item)}
            <button type="button" onClick={() => onEditItem(item)}>
              Edit
            </button>
            <button type="button" onClick={() => onDeleteItem(item.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>

      {draft === null ? (
        <button type="button" onClick={onAdd}>
          Add {title}
        </button>
      ) : (
        <div>
          {renderForm()}
          <button type="button" onClick={onSave} disabled={!canSave}>
            {isEditing ? "Save changes" : "Save"}
          </button>
          <button type="button" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}
    </section>
  );
}
