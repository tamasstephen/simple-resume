import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
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
        dispatch({
          type: "SET_CONTACT",
          contact: { name: "Grace Hopper", title: "", email: "", phone: "", location: "" },
        })
      }
    >
      rename
    </button>
  );
}

test("renders the committed resume through Paged.js with the page styles", () => {
  const persistence = new InMemoryPersistence();
  persistence.save({
    ...emptyResume(),
    contact: { name: "Ada Lovelace", title: "", email: "", phone: "", location: "" },
  });
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

test("a superseded pagination run cannot leave stale pages behind", async () => {
  const targets: HTMLElement[] = [];
  previewMock.mockImplementation((_html: unknown, _styles: unknown, target: HTMLElement) => {
    targets.push(target);
    return Promise.resolve({ total: 1 });
  });
  render(
    <StrictMode>
      <ResumeProvider persistence={new InMemoryPersistence()}>
        <Preview />
      </ResumeProvider>
    </StrictMode>,
  );
  // StrictMode double-mounts the effect: the first run's target must be
  // removed by cleanup so its late async output cannot stack a second copy.
  expect(targets).toHaveLength(2);
  const [staleTarget, liveTarget] = targets;
  expect(staleTarget?.isConnected).toBe(false);
  expect(liveTarget?.isConnected).toBe(true);
  expect(liveTarget?.parentElement?.children).toHaveLength(1);
});

test("scroll overflow/height come from CSS, not inline — only scale stays inline", () => {
  const { container } = render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <Preview />
    </ResumeProvider>,
  );
  const scrollStyle = container.querySelector<HTMLElement>(".preview-scroll")?.getAttribute("style") ?? "";
  expect(scrollStyle).not.toContain("overflow");
  expect(scrollStyle).not.toContain("height");
  // The dynamic fit-to-pane scale is runtime state and must remain inline.
  const pagesStyle = container.querySelector<HTMLElement>(".preview-pages")?.getAttribute("style") ?? "";
  expect(pagesStyle).toContain("transform");
});
