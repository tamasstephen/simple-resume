import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { SectionEditor } from "../SectionEditor";
import { newId } from "../../../lib/id";
import type { SkillItem } from "../../../lib/schema/resume";

const makeEmpty = (): SkillItem => ({ id: newId(), name: "" });

/** Repeatable Skills section. */
export function SkillsSection() {
  const items = useResumeState().committed.skills;
  const dispatch = useResumeDispatch();
  const { draft, isEditing, startAdd, startEdit, updateDraft, cancel } = useSectionDraft(makeEmpty);

  const save = () => {
    if (draft === null) return;
    dispatch({ type: "SAVE_ITEM", section: "skills", item: draft });
    cancel();
  };

  return (
    <SectionEditor<SkillItem>
      sectionId="skills"
      title="Skills"
      itemNoun="skill"
      layout="tags"
      itemLabel={(item) => item.name}
      items={items}
      draft={draft}
      isEditing={isEditing}
      canSave={draft !== null && draft.name.trim().length > 0}
      renderSummary={(item) => <span>{item.name}</span>}
      renderForm={() => (
        <label>
          Skill name
          <input
            value={draft?.name ?? ""}
            onChange={(e) => updateDraft({ name: e.target.value })}
          />
        </label>
      )}
      onAdd={startAdd}
      onEditItem={startEdit}
      onDeleteItem={(id) => dispatch({ type: "DELETE_ITEM", section: "skills", id })}
      onSave={save}
      onCancel={cancel}
    />
  );
}
