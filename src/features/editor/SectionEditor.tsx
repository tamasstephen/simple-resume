import { useState } from "react";
import type { ReactNode } from "react";
import { ItemDialog } from "./ItemDialog";
import { KebabMenu } from "./KebabMenu";
import { ErrorIcon } from "./TextField";
import { SectionHeading } from "./SectionHeading";
import { getSectionMeta, sectionAnchor, type SectionId } from "./sectionMeta";

export interface SectionEditorBaseProps<T extends { id: string }> {
  sectionId: SectionId;
  title: string;
  /** Singular name of one item ("skill"), used by the add action and dialog. */
  itemNoun: string;
  items: readonly T[];
  draft: T | null;
  isEditing: boolean;
  canSave: boolean;
  /** Labels of the draft's invalid fields, for the dialog's summary alert. */
  errorLabels?: readonly string[];
  blockedSaveCount?: number;
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
    | {
        layout?: "table";
        renderMeta?: (item: T) => ReactNode;
        renderSubtitle?: (item: T) => ReactNode;
        /** Labels of a saved item's fields that break a rule; a non-empty
         *  list flags the row and replaces its subtitle with what to check. */
        getItemErrorLabels?: (item: T) => readonly string[];
      }
    | { layout: "tags"; itemLabel: (item: T) => string }
  );

function describeItemErrors(labels: readonly string[]): string {
  return `Check the ${labels.map((label) => label.toLowerCase()).join(" and ")}`;
}

function renderEntryError(labels: readonly string[]) {
  return (
    <div className="entry__error">
      <ErrorIcon size={13} />
      {describeItemErrors(labels)}
    </div>
  );
}

function renderEntrySubtitle(subtitle: ReactNode) {
  if (subtitle === undefined || subtitle === null || subtitle === false || subtitle === "") {
    return null;
  }
  return <div className="entry__subtitle">{subtitle}</div>;
}

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
    errorLabels = [],
    blockedSaveCount = 0,
    renderSummary,
    renderForm,
    onAdd,
    onEditItem,
    onDeleteItem,
    onSave,
    onCancel,
  } = props;
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const { number, name } = getSectionMeta(sectionId);
  // Stays mounted (hidden) while the dialog is open so focus can return to it.
  const addButton = (
    <button
      type="button"
      className="btn btn--secondary btn--add"
      hidden={draft !== null}
      onClick={onAdd}
    >
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <path d="M7 2v10M2 7h10" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </svg>
      Add {itemNoun}
    </button>
  );

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
                  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                    <path
                      d="M7 7l6 6M13 7l-6 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="entry-list" aria-label={`${title} items`}>
            {items.map((item) => {
              const errorLabels = props.getItemErrorLabels?.(item) ?? [];
              const isInvalid = errorLabels.length > 0;
              return (
                <li key={item.id} className={isInvalid ? "entry entry--invalid" : "entry"}>
                  <div className="entry__text">
                    <div className="entry__summary">{renderSummary(item)}</div>
                    {isInvalid
                      ? renderEntryError(errorLabels)
                      : renderEntrySubtitle(props.renderSubtitle?.(item))}
                  </div>
                  {props.renderMeta !== undefined && (
                    <div className="entry__meta">{props.renderMeta(item)}</div>
                  )}
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
                </li>
              );
            })}
          </ul>
        ))}
      {items.length === 0 && (
        <div className="empty-state" hidden={draft !== null}>
          <p className="empty-state__title">{`No ${title.toLowerCase()} yet`}</p>
          {addButton}
        </div>
      )}
      {items.length > 0 && addButton}

      {draft !== null && (
        <ItemDialog
          title={itemNoun}
          eyebrow={`${number} / ${name.toUpperCase()} / ${isEditing ? "EDIT" : "NEW"}`}
          isEditing={isEditing}
          canSave={canSave}
          errorLabels={errorLabels}
          blockedSaveCount={blockedSaveCount}
          onSave={onSave}
          onCancel={onCancel}
        >
          {renderForm()}
        </ItemDialog>
      )}
    </section>
  );
}
