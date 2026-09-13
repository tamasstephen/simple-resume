import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SectionEditor } from "./SectionEditor";
import type { SectionEditorBaseProps } from "./SectionEditor";
import type { ReactNode } from "react";

interface Foo {
  id: string;
  name: string;
}

/** The default (table) layout; the tags layout has its own setup below. */
type TableOverrides = Partial<
  SectionEditorBaseProps<Foo> & { renderMeta: (item: Foo) => ReactNode }
>;

function setup(overrides: TableOverrides = {}) {
  const handlers = {
    onAdd: vi.fn(),
    onEditItem: vi.fn(),
    onDeleteItem: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };
  render(
    <SectionEditor<Foo>
      title="Skills"
      itemNoun="skill"
      items={[{ id: "1", name: "TS" }]}
      draft={null}
      isEditing={false}
      canSave={true}
      renderSummary={(item) => <span>{item.name}</span>}
      renderForm={() => <input aria-label="name" />}
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
}

test("renders the section title and saved items", () => {
  setup();
  expect(screen.getByRole("heading", { name: "Skills" })).toBeInTheDocument();
  expect(screen.getByText("TS")).toBeInTheDocument();
});

test("Add triggers onAdd", async () => {
  const h = setup();
  await userEvent.click(screen.getByRole("button", { name: /add/i }));
  expect(h.onAdd).toHaveBeenCalledOnce();
});

test("kebab menu Edit and Delete trigger their handlers", async () => {
  const h = setup();
  await userEvent.click(screen.getByRole("button", { name: "Item actions" }));
  await userEvent.click(screen.getByRole("menuitem", { name: /edit/i }));
  expect(h.onEditItem).toHaveBeenCalledWith({ id: "1", name: "TS" });
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Item actions" }));
  await userEvent.click(screen.getByRole("menuitem", { name: /delete/i }));
  expect(h.onDeleteItem).toHaveBeenCalledWith("1");
});

test("kebab menu opens focused on Edit and closes on Escape, refocusing the trigger", async () => {
  setup();
  const trigger = screen.getByRole("button", { name: "Item actions" });
  await userEvent.click(trigger);
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("menuitem", { name: /edit/i })).toHaveFocus();
  await userEvent.keyboard("{Escape}");
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveFocus();
});

test("kebab menu closes on outside click", async () => {
  setup();
  await userEvent.click(screen.getByRole("button", { name: "Item actions" }));
  expect(screen.getByRole("menu")).toBeInTheDocument();
  await userEvent.click(document.body);
  expect(screen.queryByRole("menu")).not.toBeInTheDocument();
});

test("Delete menu item carries the danger modifier", async () => {
  setup();
  await userEvent.click(screen.getByRole("button", { name: "Item actions" }));
  expect(screen.getByRole("menuitem", { name: /delete/i })).toHaveClass("kebab__item--danger");
});

test("shows the form and Save/Cancel when a draft is open", async () => {
  const h = setup({ draft: { id: "new", name: "" } });
  expect(screen.getByLabelText("name")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: /save/i }));
  expect(h.onSave).toHaveBeenCalledOnce();
  await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
  expect(h.onCancel).toHaveBeenCalledOnce();
});

// One item at a time: the add action and the dialog name the singular thing
// being added, not the section ("Add Skills" reads as a bulk import).
test("names the singular item in the add action and the dialog", () => {
  setup();
  expect(screen.getByRole("button", { name: "Add skill" })).toBeInTheDocument();
});

test("draft form opens in a dialog titled Add or Edit", () => {
  setup({ draft: { id: "new", name: "" } });
  expect(screen.getByRole("dialog", { name: "Add skill" })).toBeInTheDocument();
  setup({ draft: { id: "1", name: "TS" }, isEditing: true });
  expect(screen.getByRole("dialog", { name: "Edit skill" })).toBeInTheDocument();
});

test("the dialog's cancel request (Esc) calls onCancel", () => {
  const h = setup({ draft: { id: "new", name: "" } });
  fireEvent(
    screen.getByRole("dialog", { name: "Add skill" }),
    new Event("cancel", { cancelable: true }),
  );
  expect(h.onCancel).toHaveBeenCalledOnce();
});

test("Save is disabled when canSave is false", () => {
  setup({ draft: { id: "new", name: "" }, canSave: false });
  expect(screen.getByRole("button", { name: /save/i })).toBeDisabled();
});

test("does not show the Add button while a draft is open", () => {
  setup({ draft: { id: "new", name: "" } });
  expect(screen.queryByRole("button", { name: /^add/i })).not.toBeInTheDocument();
});

// The saved list is the user's model of the resume: ordering and gaps live in
// the dates, so a row shows its meta, not just a name.
test("shows each item's meta next to its name when the section provides one", () => {
  setup({ renderMeta: (item) => <span>{item.name} meta</span> });
  expect(screen.getByText("TS meta")).toBeInTheDocument();
});

// Single-field sections (skills, languages) print as an inline list; a table
// row each turned eleven one-word skills into 564px of editor.
function setupTags() {
  const handlers = {
    onAdd: vi.fn(),
    onEditItem: vi.fn(),
    onDeleteItem: vi.fn(),
    onSave: vi.fn(),
    onCancel: vi.fn(),
  };
  render(
    <SectionEditor<Foo>
      title="Skills"
      itemNoun="skill"
      layout="tags"
      itemLabel={(item) => item.name}
      items={[{ id: "1", name: "TS" }]}
      draft={null}
      isEditing={false}
      canSave={true}
      renderSummary={(item) => <span>{item.name}</span>}
      renderForm={() => <input aria-label="name" />}
      {...handlers}
    />,
  );
  return handlers;
}

test("renders a single-field section as tags rather than a table", () => {
  setupTags();
  expect(screen.queryByRole("table")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Edit TS" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Remove TS" })).toBeInTheDocument();
});

test("a tag's own controls edit and delete that item", async () => {
  const h = setupTags();
  await userEvent.click(screen.getByRole("button", { name: "Edit TS" }));
  expect(h.onEditItem).toHaveBeenCalledWith({ id: "1", name: "TS" });
  await userEvent.click(screen.getByRole("button", { name: "Remove TS" }));
  expect(h.onDeleteItem).toHaveBeenCalledWith("1");
});
