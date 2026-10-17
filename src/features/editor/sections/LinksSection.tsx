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
    isDirty,
    errors,
    blockedSaveCount,
    startAdd,
    startEdit,
    updateDraft,
    touch,
    trySave,
    cancel,
  } = useSectionDraft(makeEmpty, validateLink);

  const save = () => trySave((item) => dispatch({ type: "SAVE_ITEM", section: "links", item }));

  return (
    <SectionEditor<LinkItem>
      sectionId="links"
      title="Links"
      itemNoun="link"
      dialogDescription="A page that shows your work: portfolio, GitHub, LinkedIn."
      items={items}
      draft={draft}
      isEditing={isEditing}
      isDirty={isDirty}
      errorLabels={listErrorLabels({ errors, labels: LABELS })}
      blockedSaveCount={blockedSaveCount}
      getItemErrorLabels={(item) => listErrorLabels({ errors: validateLink(item), labels: LABELS })}
      renderSummary={(item) => <span>{item.label || item.url}</span>}
      renderSubtitle={(item) => (item.label ? item.url : "")}
      renderForm={() => (
        <>
          <TextField
            label="Label"
            isOptional
            placeholder="e.g. Portfolio"
            value={draft?.label ?? ""}
            onChange={(label) => updateDraft({ label })}
          />
          <TextField
            label={LABELS.url}
            isRequired
            type="url"
            placeholder="github.com/you"
            value={draft?.url ?? ""}
            error={errors.url}
            onChange={(url) => updateDraft({ url })}
            onBlur={() => touch("url")}
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
