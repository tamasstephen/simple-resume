import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { TextField } from "../TextField";
import { MonthField } from "../MonthField";
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

const LABELS = { institution: "Institution", startDate: "Start date", endDate: "End date" };

/** Repeatable Education section with a rich-text description. */
export function EducationSection() {
  const items = useResumeState().committed.education;
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
      dialogDescription="Where you studied and what you earned there."
      items={items}
      draft={draft}
      isEditing={isEditing}
      isDirty={isDirty}
      errorLabels={listErrorLabels({ errors, labels: LABELS })}
      blockedSaveCount={blockedSaveCount}
      getItemErrorLabels={(item) =>
        listErrorLabels({ errors: validateEducation(item), labels: LABELS })
      }
      renderSummary={(item) => <span>{item.degree || item.institution}</span>}
      renderSubtitle={(item) => joinSubtitle([item.degree ? item.institution : "", item.field])}
      renderMeta={(item) => [item.startDate, item.endDate].filter(Boolean).join(" – ")}
      renderForm={() => (
        <>
          <TextField
            label={LABELS.institution}
            isRequired
            value={draft?.institution ?? ""}
            error={errors.institution}
            onChange={(institution) => updateDraft({ institution })}
            onBlur={() => touch("institution")}
          />
          <div className="form-row">
            <TextField
              label="Degree"
              isOptional
              value={draft?.degree ?? ""}
              onChange={(degree) => updateDraft({ degree })}
            />
            <TextField
              label="Field of study"
              isOptional
              value={draft?.field ?? ""}
              onChange={(field) => updateDraft({ field })}
            />
          </div>
          <div className="form-row form-row--dates">
            <MonthField
              label={LABELS.startDate}
              isOptional
              value={draft?.startDate ?? ""}
              error={errors.startDate}
              onChange={(startDate) => updateDraft({ startDate })}
              onBlur={() => touch("startDate")}
            />
            <MonthField
              label={LABELS.endDate}
              isOptional
              value={draft?.endDate ?? ""}
              error={errors.endDate}
              onChange={(endDate) => updateDraft({ endDate })}
              onBlur={() => touch("endDate")}
            />
          </div>
          <RichTextField
            label="Description"
            isOptional
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
