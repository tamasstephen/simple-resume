import { render, screen, act } from "@testing-library/react";
import { ResumeProvider } from "./ResumeProvider";
import { useResume } from "./useResume";
import { InMemoryPersistence } from "../../lib/persistence/InMemoryPersistence";
import { emptyResume } from "../../lib/schema/resume";

function Probe() {
  const { state, dispatch } = useResume();
  return (
    <div>
      <span data-testid="skills">{state.committed.skills.length}</span>
      <button
        onClick={() =>
          dispatch({
            type: "SAVE_ITEM",
            section: "experience",
            item: { id: "1", company: "Acme", role: "Eng", startDate: "2020", endDate: "2021", current: false, location: "", description: "" },
          })
        }
      >
        add
      </button>
    </div>
  );
}

test("loads initial state from persistence", () => {
  const persistence = new InMemoryPersistence();
  persistence.save({ ...emptyResume(), skills: [{ id: "s1", name: "TS" }] });
  render(
    <ResumeProvider persistence={persistence}>
      <Probe />
    </ResumeProvider>,
  );
  expect(screen.getByTestId("skills").textContent).toBe("1"); // seeded skill loaded from persistence
});

test("auto-saves committed changes to persistence", async () => {
  const persistence = new InMemoryPersistence();
  render(
    <ResumeProvider persistence={persistence}>
      <Probe />
    </ResumeProvider>,
  );
  await act(async () => {
    screen.getByText("add").click();
  });
  expect(persistence.load()?.experience).toHaveLength(1);
});

test("useResume throws outside a provider", () => {
  function Orphan() {
    useResume();
    return null;
  }
  expect(() => render(<Orphan />)).toThrow(/ResumeProvider/);
});
