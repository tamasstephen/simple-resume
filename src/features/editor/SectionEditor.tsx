import { useState } from "react";
import type { ReactNode } from "react";
import { ItemDialog } from "./ItemDialog";
import { KebabMenu } from "./KebabMenu";
import { SectionHeading } from "./SectionHeading";
import { sectionAnchor, type SectionId } from "./sectionMeta";

export interface SectionEditorBaseProps<T extends { id: string }> {
  sectionId: SectionId;
  title: string;
  /** Singular name of one item ("skill"), used by the add action and dialog. */
  itemNoun: string;
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

/**
 * Two shapes of saved list, picked by what an item holds:
 * - `table` (default): one row per item with an optional meta column — dates,
 *   issuer, URL: the thing that orders the list.
 * - `tags`: an inline list for single-value items (skills, languages), which
 *   is how they print. Each tag carries its own edit/remove controls, so it
 *   needs a plain-text label to name them.
 */
export type SectionEditorProps<T extends { id: string }> = SectionEditorBaseProps<T> &
  (
    | { layout?: "table"; renderMeta?: (item: T) => ReactNode }
    | { layout: "tags"; itemLabel: (item: T) => string }
  );

/** Generic save-based section shell: saved-items list + add/edit/delete + draft form. */
export function SectionEditor<T extends { id: string }>(props: SectionEditorProps<T>) {
  const {
    sectionId,
    title,
    itemNoun,
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
  } = props;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
    <section aria-label={title} className="section" id={sectionAnchor(sectionId)}>
      <SectionHeading sectionId={sectionId} />

      {items.length > 0 &&
        (props.layout === "tags" ? (
          <ul className="tag-list" aria-label={`${title} items`}>
            {items.map((item) => (
              <li key={item.id} className="tag">
                <button
                  type="button"
                  className="tag__edit"
                  aria-label={`Edit ${props.itemLabel(item)}`}
                  onClick={() => onEditItem(item)}
                >
                  {renderSummary(item)}
                </button>
                <button
                  type="button"
                  className="tag__remove"
                  aria-label={`Remove ${props.itemLabel(item)}`}
                  onClick={() => onDeleteItem(item.id)}
                >
                  <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
                    <path d="M0 0L8 8M8 0L0 8" stroke="currentColor" strokeWidth="1" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <table className="item-table" aria-label={`${title} items`}>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td className="item__summary">
                    <div className="item__truncate">{renderSummary(item)}</div>
                  </td>
                  {props.renderMeta !== undefined && (
                    <td className="item__meta">{props.renderMeta(item)}</td>
                  )}
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
        ))}
      {items.length === 0 && <p className="item-table__empty">— none yet</p>}

      {draft === null ? (
        <button type="button" className="btn btn--secondary" onClick={onAdd}>
          Add {itemNoun}
        </button>
      ) : (
        <ItemDialog
          title={itemNoun}
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
