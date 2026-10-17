import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { TextField } from "../TextField";
import { listErrorLabels } from "../errorLabels";
import { validateSkill } from "../../../lib/validation/sectionRules";
import { SectionEditor } from "../SectionEditor";
import { newId } from "../../../lib/id";
import type { SkillItem } from "../../../lib/schema/resume";

const makeEmpty = (): SkillItem => ({ id: newId(), name: "" });

const LABELS = { name: "Skill name" };

/** Repeatable Skills section. */
export function SkillsSection() {
  const items = useResumeState().committed.skills;
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
  } = useSectionDraft(makeEmpty, validateSkill);

  const save = () => trySave((item) => dispatch({ type: "SAVE_ITEM", section: "skills", item }));

  return (
    <SectionEditor<SkillItem>
      sectionId="skills"
      title="Skills"
      itemNoun="skill"
      dialogDescription="One skill per entry. They print as a single line."
      layout="tags"
      itemLabel={(item) => item.name}
      items={items}
      draft={draft}
      isEditing={isEditing}
      isDirty={isDirty}
      errorLabels={listErrorLabels({ errors, labels: LABELS })}
      blockedSaveCount={blockedSaveCount}
      renderSummary={(item) => <span>{item.name}</span>}
      renderForm={() => (
        <TextField
          label={LABELS.name}
          isRequired
          placeholder="e.g. TypeScript"
          value={draft?.name ?? ""}
          error={errors.name}
          onChange={(name) => updateDraft({ name })}
          onBlur={() => touch("name")}
        />
      )}
      onAdd={startAdd}
      onEditItem={startEdit}
      onDeleteItem={(id) => dispatch({ type: "DELETE_ITEM", section: "skills", id })}
      onSave={save}
      onCancel={cancel}
    />
  );
}
