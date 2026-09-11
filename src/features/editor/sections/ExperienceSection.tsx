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
  const { draft, isEditing, startAdd, startEdit, updateDraft, cancel } =
    useSectionDraft(makeEmpty);

  const save = () => {
    if (draft === null) return;
    dispatch({ type: "SAVE_ITEM", section: "experience", item: sanitizeDescription(draft) });
    cancel();
  };

  return (
    <SectionEditor<ExperienceItem>
      title="Experience"
      items={items}
      draft={draft}
      isEditing={isEditing}
      canSave={
        draft !== null && (draft.company.trim().length > 0 || draft.role.trim().length > 0)
      }
      renderSummary={(item) => (
        <span>
          {item.role}
          {item.company ? ` @ ${item.company}` : ""}
        </span>
      )}
      renderForm={() => (
        <>
          <label>
            Company
            <input
              value={draft?.company ?? ""}
              onChange={(e) => updateDraft({ company: e.target.value })}
            />
          </label>
          <label>
            Role
            <input
              value={draft?.role ?? ""}
              onChange={(e) => updateDraft({ role: e.target.value })}
            />
          </label>
          <label>
            Start date
            <input
              value={draft?.startDate ?? ""}
              onChange={(e) => updateDraft({ startDate: e.target.value })}
            />
          </label>
          <label>
            End date
            <input
              value={draft?.endDate ?? ""}
              onChange={(e) => updateDraft({ endDate: e.target.value })}
            />
          </label>
          <label>
            Currently here
            <input
              type="checkbox"
              checked={draft?.current ?? false}
              onChange={(e) => updateDraft({ current: e.target.checked })}
            />
          </label>
          <label>
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
