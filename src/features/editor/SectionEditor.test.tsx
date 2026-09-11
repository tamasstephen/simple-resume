import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SectionEditor } from "./SectionEditor";

interface Foo {
  id: string;
  name: string;
}

function setup(overrides: Partial<React.ComponentProps<typeof SectionEditor<Foo>>> = {}) {
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

test("Edit and Delete on a row trigger their handlers", async () => {
  const h = setup();
  await userEvent.click(screen.getByRole("button", { name: /edit/i }));
  expect(h.onEditItem).toHaveBeenCalledWith({ id: "1", name: "TS" });
  await userEvent.click(screen.getByRole("button", { name: /delete/i }));
  expect(h.onDeleteItem).toHaveBeenCalledWith("1");
});

test("shows the form and Save/Cancel when a draft is open", async () => {
  const h = setup({ draft: { id: "new", name: "" } });
  expect(screen.getByLabelText("name")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: /save/i }));
  expect(h.onSave).toHaveBeenCalledOnce();
  await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
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
