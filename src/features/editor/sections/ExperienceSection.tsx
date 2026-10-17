import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { TextField } from "../TextField";
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

const LABELS = { startDate: "Start date", endDate: "End date" };

/** Repeatable Experience section with a rich-text description. */
export function ExperienceSection() {
  const items = useResumeState().committed.experience;
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
  } = useSectionDraft(makeEmpty, validateExperience);

  const save = () =>
    trySave((item) =>
      dispatch({ type: "SAVE_ITEM", section: "experience", item: sanitizeDescription(item) }),
    );

  return (
    <SectionEditor<ExperienceItem>
      sectionId="experience"
      title="Experience"
      itemNoun="experience"
      items={items}
      draft={draft}
      isEditing={isEditing}
      errorLabels={listErrorLabels({ errors, labels: LABELS })}
      blockedSaveCount={blockedSaveCount}
      getItemErrorLabels={(item) =>
        listErrorLabels({ errors: validateExperience(item), labels: LABELS })
      }
      canSave={draft !== null && (draft.company.trim().length > 0 || draft.role.trim().length > 0)}
      renderSummary={(item) => <span>{item.role || item.company}</span>}
      renderSubtitle={(item) => joinSubtitle([item.role ? item.company : "", item.location])}
      renderMeta={(item) =>
        [item.startDate, item.current ? "Present" : item.endDate].filter(Boolean).join(" – ")
      }
      renderForm={() => (
        <>
          <label>
            Role
            <input
              value={draft?.role ?? ""}
              onChange={(e) => updateDraft({ role: e.target.value })}
            />
          </label>
          <label>
            Company
            <input
              value={draft?.company ?? ""}
              onChange={(e) => updateDraft({ company: e.target.value })}
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
          <label className="field">
            I work here now
            <input
              type="checkbox"
              checked={draft?.current ?? false}
              onChange={(e) => updateDraft({ current: e.target.checked })}
            />
          </label>
          <label className="field field--medium">
            Location
            <input
              value={draft?.location ?? ""}
              onChange={(e) => updateDraft({ location: e.target.value })}
            />
          </label>
          <RichTextField
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
