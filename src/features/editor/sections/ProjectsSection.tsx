import { useResumeState, useResumeDispatch } from "../../resume/useResume";
import { useSectionDraft } from "../useSectionDraft";
import { TextField } from "../TextField";
import { listErrorLabels } from "../errorLabels";
import { validateProject } from "../../../lib/validation/sectionRules";
import { SectionEditor } from "../SectionEditor";
import { RichTextField } from "../RichTextField";
import { sanitizeDescription } from "../sanitizeFields";
import { newId } from "../../../lib/id";
import type { ProjectItem } from "../../../lib/schema/resume";

const makeEmpty = (): ProjectItem => ({ id: newId(), name: "", url: "", description: "" });

const LABELS = { url: "URL" };

/** Repeatable Projects section with a rich-text description. */
export function ProjectsSection() {
  const items = useResumeState().committed.projects;
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
  } = useSectionDraft(makeEmpty, validateProject);

  const save = () =>
    trySave((item) =>
      dispatch({ type: "SAVE_ITEM", section: "projects", item: sanitizeDescription(item) }),
    );

  return (
    <SectionEditor<ProjectItem>
      sectionId="projects"
      title="Projects"
      itemNoun="project"
      items={items}
      draft={draft}
      isEditing={isEditing}
      errorLabels={listErrorLabels({ errors, labels: LABELS })}
      blockedSaveCount={blockedSaveCount}
      getItemErrorLabels={(item) =>
        listErrorLabels({ errors: validateProject(item), labels: LABELS })
      }
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
          <TextField
            label={LABELS.url}
            value={draft?.url ?? ""}
            error={errors.url}
            onChange={(url) => updateDraft({ url })}
          />
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
