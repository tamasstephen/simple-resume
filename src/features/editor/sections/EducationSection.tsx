import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { TextField } from "../TextField";
import { listErrorLabels } from "../errorLabels";
import { validateEducation } from "../../../lib/validation/sectionRules";
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

const LABELS = { startDate: "Start date", endDate: "End date" };

/** Repeatable Education section with a rich-text description. */
export function EducationSection() {
  const items = useResumeState().committed.education;
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
  } = useSectionDraft(makeEmpty, validateEducation);

  const save = () =>
    trySave((item) =>
      dispatch({ type: "SAVE_ITEM", section: "education", item: sanitizeDescription(item) }),
    );

  return (
    <SectionEditor<EducationItem>
      sectionId="education"
      title="Education"
      itemNoun="education"
      items={items}
      draft={draft}
      isEditing={isEditing}
      errorLabels={listErrorLabels({ errors, labels: LABELS })}
      blockedSaveCount={blockedSaveCount}
      getItemErrorLabels={(item) =>
        listErrorLabels({ errors: validateEducation(item), labels: LABELS })
      }
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
          <TextField
            label={LABELS.startDate}
            width="short"
            placeholder="MM/YYYY"
            value={draft?.startDate ?? ""}
            error={errors.startDate}
            onChange={(startDate) => updateDraft({ startDate })}
          />
          <TextField
            label={LABELS.endDate}
            width="short"
            placeholder="MM/YYYY"
            value={draft?.endDate ?? ""}
            error={errors.endDate}
            onChange={(endDate) => updateDraft({ endDate })}
          />
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
