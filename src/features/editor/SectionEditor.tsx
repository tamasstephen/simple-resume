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
    <section aria-label={title} className="section">
      <div className="section__head">
        <h2 className="section__title">{title}</h2>
        <span className="section__count" aria-hidden="true">
          {items.length}
        </span>
      </div>

      <ul className="item-list">
        {items.map((item) => (
          <li key={item.id} className="item">
            {renderSummary(item)}
            <button type="button" className="btn btn--text" onClick={() => onEditItem(item)}>
              Edit
            </button>
            <button type="button" className="btn btn--text" onClick={() => onDeleteItem(item.id)}>
              Delete
            </button>
          </li>
        ))}
      </ul>
      {items.length === 0 && <p className="item-list__empty">— none yet</p>}

      {draft === null ? (
        <button type="button" className="btn btn--secondary" onClick={onAdd}>
          Add {title}
        </button>
      ) : (
        <div className="section__draft">
          {renderForm()}
          <button type="button" className="btn btn--primary" onClick={onSave} disabled={!canSave}>
            {isEditing ? "Save changes" : "Save"}
          </button>
          <button type="button" className="btn btn--text" onClick={onCancel}>
            Cancel
          </button>
        </div>
      )}
    </section>
  );
}
