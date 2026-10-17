import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { CheckboxField, TextField } from "../TextField";
import { MonthField } from "../MonthField";
import { listErrorLabels } from "../errorLabels";
import { validateExperience } from "../../../lib/validation/sectionRules";
import { SectionEditor } from "../SectionEditor";
import { joinSubtitle } from "../joinSubtitle";
import { RichTextField } from "../RichTextField";
import { sanitizeDescription } from "../sanitizeFields";
import { newId } from "../../../lib/id";
import type { ExperienceItem } from "../../../lib/schema/resume";

const makeEmpty = (): ExperienceItem => ({
  id: newId(),
  company: "",
  role: "",
  startDate: "",
  endDate: "",
  current: false,
  location: "",
  description: "",
});

const LABELS = {
  role: "Job title",
  company: "Company",
  startDate: "Start date",
  endDate: "End date",
};

/** Repeatable Experience section with a rich-text description. */
export function ExperienceSection() {
  const items = useResumeState().committed.experience;
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
  } = useSectionDraft(makeEmpty, validateExperience);

  const save = () =>
    trySave((item) =>
      dispatch({ type: "SAVE_ITEM", section: "experience", item: sanitizeDescription(item) }),
    );
  const isCurrent = draft?.current ?? false;

  return (
    <SectionEditor<ExperienceItem>
      sectionId="experience"
      title="Experience"
      itemNoun="experience"
      dialogNoun="work experience"
      dialogDescription="Tell employers about your role and what you achieved."
      items={items}
      draft={draft}
      isEditing={isEditing}
      isDirty={isDirty}
      errorLabels={listErrorLabels({ errors, labels: LABELS })}
      blockedSaveCount={blockedSaveCount}
      getItemErrorLabels={(item) =>
        listErrorLabels({ errors: validateExperience(item), labels: LABELS })
      }
      renderSummary={(item) => <span>{item.role || item.company}</span>}
      renderSubtitle={(item) => joinSubtitle([item.role ? item.company : "", item.location])}
      renderMeta={(item) =>
        [item.startDate, item.current ? "Present" : item.endDate].filter(Boolean).join(" – ")
      }
      renderForm={() => (
        <>
          <div className="form-row">
            <TextField
              label={LABELS.role}
              isRequired
              value={draft?.role ?? ""}
              error={errors.role}
              onChange={(role) => updateDraft({ role })}
              onBlur={() => touch("role")}
            />
            <TextField
              label={LABELS.company}
              isRequired
              value={draft?.company ?? ""}
              error={errors.company}
              onChange={(company) => updateDraft({ company })}
              onBlur={() => touch("company")}
            />
          </div>
          <TextField
            label="Location"
            isOptional
            value={draft?.location ?? ""}
            onChange={(location) => updateDraft({ location })}
          />
          <div className="form-row form-row--dates">
            <MonthField
              label={LABELS.startDate}
              isRequired
              value={draft?.startDate ?? ""}
              error={errors.startDate}
              onChange={(startDate) => updateDraft({ startDate })}
              onBlur={() => touch("startDate")}
            />
            <MonthField
              label={LABELS.endDate}
              isRequired={!isCurrent}
              isDisabled={isCurrent}
              placeholder={isCurrent ? "Present" : undefined}
              value={isCurrent ? "" : (draft?.endDate ?? "")}
              error={errors.endDate}
              onChange={(endDate) => updateDraft({ endDate })}
              onBlur={() => touch("endDate")}
            />
          </div>
          <CheckboxField
            label="I currently work here"
            isChecked={isCurrent}
            onChange={(current) => updateDraft({ current })}
          />
          <RichTextField
            label="Description"
            isOptional
            helper="Use 2–4 short bullets. Focus on outcomes and measurable impact."
            value={draft?.description ?? ""}
            onChange={(html) => updateDraft({ description: html })}
            ariaLabel="Experience description"
          />
        </>
      )}
      onAdd={startAdd}
      onEditItem={startEdit}
      onDeleteItem={(id) => dispatch({ type: "DELETE_ITEM", section: "experience", id })}
      onSave={save}
      onCancel={cancel}
    />
  );
}
