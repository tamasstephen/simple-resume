import { render, screen, act } from "@testing-library/react";
import { ResumeProvider } from "./ResumeProvider";
import { useResumeState, useResumeDispatch } from "./useResume";
import { InMemoryPersistence } from "../../lib/persistence/InMemoryPersistence";
import { emptyResume } from "../../lib/schema/resume";

function Probe() {
  const state = useResumeState();
  const dispatch = useResumeDispatch();
  return (
    <div>
      <span data-testid="skills">{state.committed.skills.length}</span>
      <button
        onClick={() =>
          dispatch({ type: "SAVE_ITEM", section: "skills", item: { id: "s1", name: "TS" } })
        }
      >
        add
      </button>
    </div>
  );
}

test("loads initial state from persistence", () => {
  const persistence = new InMemoryPersistence();
  persistence.save({ ...emptyResume(), skills: [{ id: "seed", name: "Go" }] });
  render(
    <ResumeProvider persistence={persistence}>
      <Probe />
    </ResumeProvider>,
  );
  expect(screen.getByTestId("skills").textContent).toBe("1");
});

test("auto-saves committed changes to persistence", () => {
  const persistence = new InMemoryPersistence();
  render(
    <ResumeProvider persistence={persistence}>
      <Probe />
    </ResumeProvider>,
  );
  act(() => {
    screen.getByText("add").click();
  });
  expect(persistence.load()?.skills).toHaveLength(1);
});

test("useResumeState throws outside a provider", () => {
  function Orphan() {
    useResumeState();
    return null;
  }
  expect(() => render(<Orphan />)).toThrow(/ResumeProvider/);
});

test("useResumeDispatch throws outside a provider", () => {
  function Orphan() {
    useResumeDispatch();
    return null;
  }
  expect(() => render(<Orphan />)).toThrow(/ResumeProvider/);
});
