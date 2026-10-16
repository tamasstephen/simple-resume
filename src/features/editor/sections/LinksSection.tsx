import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { SectionEditor } from "../SectionEditor";
import { newId } from "../../../lib/id";
import type { LinkItem } from "../../../lib/schema/resume";

const makeEmpty = (): LinkItem => ({ id: newId(), label: "", url: "" });

/** Repeatable Social/Portfolio Links section. */
export function LinksSection() {
  const items = useResumeState().committed.links;
  const dispatch = useResumeDispatch();
  const { draft, isEditing, startAdd, startEdit, updateDraft, cancel } = useSectionDraft(makeEmpty);

  const save = () => {
    if (draft === null) return;
    dispatch({ type: "SAVE_ITEM", section: "links", item: draft });
    cancel();
  };

  return (
    <SectionEditor<LinkItem>
      sectionId="links"
      title="Links"
      itemNoun="link"
      items={items}
      draft={draft}
      isEditing={isEditing}
      canSave={draft !== null && draft.url.trim().length > 0}
      renderSummary={(item) => <span>{item.label || item.url}</span>}
      renderSubtitle={(item) => (item.label ? item.url : "")}
      renderForm={() => (
        <>
          <label className="field field--medium">
            Label
            <input
              value={draft?.label ?? ""}
              onChange={(e) => updateDraft({ label: e.target.value })}
            />
          </label>
          <label>
            URL
            <input
              value={draft?.url ?? ""}
              onChange={(e) => updateDraft({ url: e.target.value })}
            />
          </label>
        </>
      )}
      onAdd={startAdd}
      onEditItem={startEdit}
      onDeleteItem={(id) => dispatch({ type: "DELETE_ITEM", section: "links", id })}
      onSave={save}
      onCancel={cancel}
    />
  );
}
