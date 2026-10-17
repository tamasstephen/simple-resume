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

const LABELS = { name: "Project name", url: "URL" };

/** Repeatable Projects section with a rich-text description. */
export function ProjectsSection() {
  const items = useResumeState().committed.projects;
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
      dialogDescription="Something you built, and where people can see it."
      items={items}
      draft={draft}
      isEditing={isEditing}
      isDirty={isDirty}
      errorLabels={listErrorLabels({ errors, labels: LABELS })}
      blockedSaveCount={blockedSaveCount}
      getItemErrorLabels={(item) =>
        listErrorLabels({ errors: validateProject(item), labels: LABELS })
      }
      renderSummary={(item) => <span>{item.name}</span>}
      renderSubtitle={(item) => item.url}
      renderForm={() => (
        <>
          <TextField
            label={LABELS.name}
            isRequired
            value={draft?.name ?? ""}
            error={errors.name}
            onChange={(name) => updateDraft({ name })}
            onBlur={() => touch("name")}
          />
          <TextField
            label={LABELS.url}
            isOptional
            type="url"
            placeholder="github.com/you/project"
            value={draft?.url ?? ""}
            error={errors.url}
            onChange={(url) => updateDraft({ url })}
            onBlur={() => touch("url")}
          />
          <RichTextField
            label="Description"
            isOptional
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
