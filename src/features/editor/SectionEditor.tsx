import { useState } from "react";
import type { ReactNode } from "react";
import { ItemDialog } from "./ItemDialog";
import { KebabMenu } from "./KebabMenu";

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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  return (
    <section aria-label={title} className="section">
      <div className="section__head">
        <h2 className="section__title">{title}</h2>
      </div>

      {items.length > 0 && (
        <table className="item-table" aria-label={`${title} items`}>
          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td className="item__summary">
                  <div className="item__truncate">{renderSummary(item)}</div>
                </td>
                <td className="item__actions">
                  <KebabMenu
                    isOpen={openMenuId === item.id}
                    onToggle={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                    onClose={() => setOpenMenuId(null)}
                    onEdit={() => {
                      setOpenMenuId(null);
                      onEditItem(item);
                    }}
                    onDelete={() => {
                      setOpenMenuId(null);
                      onDeleteItem(item.id);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {items.length === 0 && <p className="item-table__empty">— none yet</p>}

      {draft === null ? (
        <button type="button" className="btn btn--secondary" onClick={onAdd}>
          Add {title}
        </button>
      ) : (
        <ItemDialog
          title={title}
          isEditing={isEditing}
          canSave={canSave}
          onSave={onSave}
          onCancel={onCancel}
        >
          {renderForm()}
        </ItemDialog>
      )}
    </section>
  );
}
