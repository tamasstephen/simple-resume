import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StrictMode } from "react";
import { Preview } from "./Preview";
import { ResumeProvider } from "../resume/ResumeProvider";
import { useResumeDispatch } from "../resume/useResume";
import { InMemoryPersistence } from "../../lib/persistence/InMemoryPersistence";
import { emptyResume } from "../../lib/schema/resume";
import { minimalStyles } from "../render/minimalStyles";
import { executiveStyles } from "../render/executiveStyles";

// Paged.js needs real layout (unavailable in jsdom); mock it and assert our
// integration passes the right content + stylesheets. Real pagination is a
// manual/Playwright concern.
const { previewMock, destroyMocks } = vi.hoisted(() => {
  // One destroy spy per Previewer, in creation order.
  const destroyMocks: ReturnType<typeof vi.fn>[] = [];
  return { previewMock: vi.fn(), destroyMocks };
});
vi.mock("pagedjs", () => ({
  Previewer: vi.fn(function Previewer() {
    const destroy = vi.fn();
    destroyMocks.push(destroy);
    return { preview: previewMock, polisher: { destroy } };
  }),
}));

beforeEach(() => {
  previewMock.mockReset();
  previewMock.mockResolvedValue({ total: 1 });
  destroyMocks.length = 0;
});

function Rename() {
  const dispatch = useResumeDispatch();
  return (
    <button
      onClick={() =>
        dispatch({
          type: "SET_CONTACT",
          contact: {
            name: "Grace Hopper",
            title: "",
            email: "",
            phone: "",
            location: "",
            website: "",
          },
        })
      }
    >
      rename
    </button>
  );
}

test("renders the committed resume through Paged.js with the page styles", async () => {
  const persistence = new InMemoryPersistence();
  persistence.save({
    ...emptyResume(),
    contact: { name: "Ada Lovelace", title: "", email: "", phone: "", location: "", website: "" },
  });
  render(
    <ResumeProvider persistence={persistence}>
      <Preview />
    </ResumeProvider>,
  );
  // Runs execute on the serialization queue (a microtask chain), not
  // synchronously inside the effect.
  await vi.waitFor(() => expect(previewMock).toHaveBeenCalled());
  expect(previewMock).toHaveBeenCalledWith(
    expect.stringContaining("Ada Lovelace"),
    [{ "resume-page": minimalStyles }],
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
    [{ "resume-page": minimalStyles }],
    expect.anything(),
  );
});

function ChooseExecutive() {
  const dispatch = useResumeDispatch();
  return (
    <button onClick={() => dispatch({ type: "SELECT_TEMPLATE", template: "executive" })}>
      executive
    </button>
  );
}

test("switching template paginates with that template's styles and drops the old ones", async () => {
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <Preview />
      <ChooseExecutive />
    </ResumeProvider>,
  );
  await vi.waitFor(() => expect(previewMock).toHaveBeenCalledTimes(1));
  await userEvent.click(screen.getByText("executive"));
  await vi.waitFor(() => expect(previewMock).toHaveBeenCalledTimes(2));
  expect(previewMock).toHaveBeenLastCalledWith(
    expect.stringContaining("resume-root"),
    [{ "resume-page": executiveStyles }],
    expect.anything(),
  );
  // The first run's styles go once the second run's pages replace its own;
  // the live run keeps its styles.
  await vi.waitFor(() => expect(destroyMocks.at(-2)).toHaveBeenCalled());
  expect(destroyMocks.at(-1)).not.toHaveBeenCalled();
});

test("a superseded pagination run cannot leave stale pages behind", async () => {
  const targets: HTMLElement[] = [];
  previewMock.mockImplementation((_html: unknown, _styles: unknown, target: HTMLElement) => {
    target.dataset.run = String(targets.length + 1);
    // simulate Paged.js mounting its pages root inside the target
    const pagesRoot = document.createElement("div");
    pagesRoot.className = "pagedjs_pages";
    pagesRoot.dataset.run = target.dataset.run;
    target.appendChild(pagesRoot);
    targets.push(target);
    return Promise.resolve({ total: 1 });
  });
  const { container: reactContainer } = render(
    <StrictMode>
      <ResumeProvider persistence={new InMemoryPersistence()}>
        <Preview />
      </ResumeProvider>
    </StrictMode>,
  );
  // Serialized: StrictMode's first run completes off-screen, its stage is
  // removed, and only then the second run chunks and moves its pages in.
  await vi.waitFor(() => expect(targets).toHaveLength(2));
  const pagesHolder = reactContainer.querySelector<HTMLElement>(".preview-pages");
  const pagesRoot = pagesHolder?.querySelector<HTMLElement>(".pagedjs_pages");
  expect(pagesRoot?.parentElement).toBe(pagesHolder);
  // Only the LAST run's pages are live; both stages are gone entirely.
  expect(pagesRoot?.dataset.run).toBe("2");
  expect(pagesHolder?.querySelectorAll(".pagedjs_pages")).toHaveLength(1);
  expect(targets[0]?.isConnected).toBe(false);
  expect(targets[1]?.isConnected).toBe(false);
});

test("scroll overflow/height come from CSS, not inline — only scale stays inline", () => {
  const { container } = render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <Preview />
    </ResumeProvider>,
  );
  const scrollStyle =
    container.querySelector<HTMLElement>(".preview-scroll")?.getAttribute("style") ?? "";
  expect(scrollStyle).not.toContain("overflow");
  expect(scrollStyle).not.toContain("height");
  // The dynamic fit-to-pane scale is runtime state and must remain inline.
  const pagesStyle =
    container.querySelector<HTMLElement>(".preview-pages")?.getAttribute("style") ?? "";
  expect(pagesStyle).toContain("transform");
});

/** Makes the mocked Paged.js run mount `count` page boxes in its target. */
function mockRunWithPages(count: number) {
  previewMock.mockImplementation((_html: unknown, _styles: unknown, target: HTMLElement) => {
    for (let index = 0; index < count; index++) {
      const page = document.createElement("div");
      page.className = "pagedjs_page";
      target.appendChild(page);
    }
    return Promise.resolve({ total: count });
  });
}

test("reports how many pages a finished run produced", async () => {
  mockRunWithPages(3);
  const onPaginated = vi.fn();
  render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <Preview onPaginated={onPaginated} />
    </ResumeProvider>,
  );
  await vi.waitFor(() => expect(onPaginated).toHaveBeenCalledWith(3));
});

test("a new callback identity does not trigger another pagination run", async () => {
  mockRunWithPages(1);
  const { rerender } = render(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <Preview onPaginated={() => {}} />
    </ResumeProvider>,
  );
  await vi.waitFor(() => expect(previewMock).toHaveBeenCalledTimes(1));
  rerender(
    <ResumeProvider persistence={new InMemoryPersistence()}>
      <Preview onPaginated={() => {}} />
    </ResumeProvider>,
  );
  await vi.waitFor(() => expect(previewMock).toHaveBeenCalledTimes(1));
});
