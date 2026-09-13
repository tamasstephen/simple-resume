import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { SectionEditor } from "../SectionEditor";
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

/** Repeatable Experience section with a rich-text description. */
export function ExperienceSection() {
  const items = useResumeState().committed.experience;
  const dispatch = useResumeDispatch();
  const { draft, isEditing, startAdd, startEdit, updateDraft, cancel } = useSectionDraft(makeEmpty);

  const save = () => {
    if (draft === null) return;
    dispatch({ type: "SAVE_ITEM", section: "experience", item: sanitizeDescription(draft) });
    cancel();
  };

  return (
    <SectionEditor<ExperienceItem>
      title="Experience"
      itemNoun="experience"
      items={items}
      draft={draft}
      isEditing={isEditing}
      canSave={draft !== null && (draft.company.trim().length > 0 || draft.role.trim().length > 0)}
      renderSummary={(item) => (
        <span>
          {item.role}
          {item.company ? ` @ ${item.company}` : ""}
        </span>
      )}
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
