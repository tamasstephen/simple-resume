import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Preview } from "./Preview";
import { ResumeProvider } from "../resume/ResumeProvider";
import { useResumeDispatch } from "../resume/useResume";
import { InMemoryPersistence } from "../../lib/persistence/InMemoryPersistence";
import { emptyResume } from "../../lib/schema/resume";
import { pageStyles } from "../render/pageStyles";

// Paged.js needs real layout (unavailable in jsdom); mock it and assert our
// integration passes the right content + stylesheets. Real pagination is a
// manual/Playwright concern.
const { previewMock } = vi.hoisted(() => ({ previewMock: vi.fn() }));
vi.mock("pagedjs", () => ({
  Previewer: vi.fn(function Previewer() {
    return { preview: previewMock };
  }),
}));

beforeEach(() => {
  previewMock.mockReset();
  previewMock.mockResolvedValue({ total: 1 });
});

function Rename() {
  const dispatch = useResumeDispatch();
  return (
    <button
      onClick={() =>
        dispatch({ type: "SET_CONTACT", contact: { name: "Grace Hopper", title: "", email: "", phone: "", location: "" } })
      }
    >
      rename
    </button>
  );
}

test("renders the committed resume through Paged.js with the page styles", () => {
  const persistence = new InMemoryPersistence();
  persistence.save({ ...emptyResume(), contact: { name: "Ada Lovelace", title: "", email: "", phone: "", location: "" } });
  render(
    <ResumeProvider persistence={persistence}>
      <Preview />
    </ResumeProvider>,
  );
  expect(previewMock).toHaveBeenCalledWith(
    expect.stringContaining("Ada Lovelace"),
    [{ "resume-page": pageStyles }],
    expect.anything(),
  );
});

test("re-renders the preview when committed state changes", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <Preview />
      <Rename />
    </ResumeProvider>,
  );
  await userEvent.click(screen.getByText("rename"));
  expect(previewMock).toHaveBeenCalledWith(
    expect.stringContaining("Grace Hopper"),
    [{ "resume-page": pageStyles }],
    expect.anything(),
  );
});
