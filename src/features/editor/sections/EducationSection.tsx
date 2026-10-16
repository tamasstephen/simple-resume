import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { SectionEditor } from "../SectionEditor";
import { joinSubtitle } from "../joinSubtitle";
import { RichTextField } from "../RichTextField";
import { sanitizeDescription } from "../sanitizeFields";
import { newId } from "../../../lib/id";
import type { EducationItem } from "../../../lib/schema/resume";

const makeEmpty = (): EducationItem => ({
  id: newId(),
  institution: "",
  degree: "",
  field: "",
  startDate: "",
  endDate: "",
  description: "",
});

/** Repeatable Education section with a rich-text description. */
export function EducationSection() {
  const items = useResumeState().committed.education;
  const dispatch = useResumeDispatch();
  const { draft, isEditing, startAdd, startEdit, updateDraft, cancel } = useSectionDraft(makeEmpty);

  const save = () => {
    if (draft === null) return;
    dispatch({ type: "SAVE_ITEM", section: "education", item: sanitizeDescription(draft) });
    cancel();
  };

  return (
    <SectionEditor<EducationItem>
      sectionId="education"
      title="Education"
      itemNoun="education"
      items={items}
      draft={draft}
      isEditing={isEditing}
      canSave={draft !== null && draft.institution.trim().length > 0}
      renderSummary={(item) => <span>{item.degree || item.institution}</span>}
      renderSubtitle={(item) => joinSubtitle([item.degree ? item.institution : "", item.field])}
      renderMeta={(item) => [item.startDate, item.endDate].filter(Boolean).join(" – ")}
      renderForm={() => (
        <>
          <label>
            Institution
            <input
              value={draft?.institution ?? ""}
              onChange={(e) => updateDraft({ institution: e.target.value })}
            />
          </label>
          <label className="field field--short">
            Degree
            <input
              value={draft?.degree ?? ""}
              onChange={(e) => updateDraft({ degree: e.target.value })}
            />
          </label>
          <label className="field field--medium">
            Field of study
            <input
              value={draft?.field ?? ""}
              onChange={(e) => updateDraft({ field: e.target.value })}
            />
          </label>
          <label className="field field--short">
            Start date
            <input
              value={draft?.startDate ?? ""}
              onChange={(e) => updateDraft({ startDate: e.target.value })}
            />
          </label>
          <label className="field field--short">
            End date
            <input
              value={draft?.endDate ?? ""}
              onChange={(e) => updateDraft({ endDate: e.target.value })}
            />
          </label>
          <RichTextField
            value={draft?.description ?? ""}
            onChange={(html) => updateDraft({ description: html })}
            ariaLabel="Education description"
          />
        </>
      )}
      onAdd={startAdd}
      onEditItem={startEdit}
      onDeleteItem={(id) => dispatch({ type: "DELETE_ITEM", section: "education", id })}
      onSave={save}
      onCancel={cancel}
    />
  );
}
