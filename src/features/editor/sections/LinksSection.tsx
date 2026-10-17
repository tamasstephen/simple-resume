import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { TextField } from "../TextField";
import { listErrorLabels } from "../errorLabels";
import { validateLink } from "../../../lib/validation/sectionRules";
import { SectionEditor } from "../SectionEditor";
import { newId } from "../../../lib/id";
import type { LinkItem } from "../../../lib/schema/resume";

const makeEmpty = (): LinkItem => ({ id: newId(), label: "", url: "" });

const LABELS = { url: "URL" };

/** Repeatable Social/Portfolio Links section. */
export function LinksSection() {
  const items = useResumeState().committed.links;
  const dispatch = useResumeDispatch();
  const {
    draft,
    isEditing,
    errors,
    blockedSaveCount,
    startAdd,
    startEdit,
    updateDraft,
    trySave,
    cancel,
  } = useSectionDraft(makeEmpty, validateLink);

  const save = () =>
    trySave((item) => dispatch({ type: "SAVE_ITEM", section: "links", item: item }));

  return (
    <SectionEditor<LinkItem>
      sectionId="links"
      title="Links"
      itemNoun="link"
      items={items}
      draft={draft}
      isEditing={isEditing}
      errorLabels={listErrorLabels({ errors, labels: LABELS })}
      blockedSaveCount={blockedSaveCount}
      getItemErrorLabels={(item) => listErrorLabels({ errors: validateLink(item), labels: LABELS })}
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
          <TextField
            label={LABELS.url}
            value={draft?.url ?? ""}
            error={errors.url}
            onChange={(url) => updateDraft({ url })}
          />
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
