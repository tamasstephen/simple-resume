import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { SectionEditor } from "../SectionEditor";
import { RichTextField } from "../RichTextField";
import { sanitizeDescription } from "../sanitizeFields";
import { newId } from "../../../lib/id";
import type { ProjectItem } from "../../../lib/schema/resume";

const makeEmpty = (): ProjectItem => ({ id: newId(), name: "", url: "", description: "" });

/** Repeatable Projects section with a rich-text description. */
export function ProjectsSection() {
  const items = useResumeState().committed.projects;
  const dispatch = useResumeDispatch();
  const { draft, isEditing, startAdd, startEdit, updateDraft, cancel } = useSectionDraft(makeEmpty);

  const save = () => {
    if (draft === null) return;
    dispatch({ type: "SAVE_ITEM", section: "projects", item: sanitizeDescription(draft) });
    cancel();
  };

  return (
    <SectionEditor<ProjectItem>
      sectionId="projects"
      title="Projects"
      itemNoun="project"
      items={items}
      draft={draft}
      isEditing={isEditing}
      canSave={draft !== null && draft.name.trim().length > 0}
      renderSummary={(item) => <span>{item.name}</span>}
      renderSubtitle={(item) => item.url}
      renderForm={() => (
        <>
          <label>
            Project name
            <input
              value={draft?.name ?? ""}
              onChange={(e) => updateDraft({ name: e.target.value })}
            />
          </label>
          <label>
            URL
            <input
              value={draft?.url ?? ""}
              onChange={(e) => updateDraft({ url: e.target.value })}
            />
          </label>
          <RichTextField
            value={draft?.description ?? ""}
            onChange={(html) => updateDraft({ description: html })}
            ariaLabel="Project description"
          />
        </>
      )}
      onAdd={startAdd}
      onEditItem={startEdit}
      onDeleteItem={(id) => dispatch({ type: "DELETE_ITEM", section: "projects", id })}
      onSave={save}
      onCancel={cancel}
    />
  );
}
