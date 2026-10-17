import { render, screen, act, fireEvent } from "@testing-library/react";
import { useActiveSection } from "./useActiveSection";
import type { SectionId } from "./sectionMeta";

const IDS: readonly SectionId[] = ["contact", "links"];

function SelectProbe() {
  const [activeId, selectSection] = useActiveSection(IDS);
  return (
    <>
      <span data-testid="active">{activeId ?? "none"}</span>
      <button onClick={() => selectSection("links")}>pick</button>
    </>
  );
}

function renderPane() {
  render(
    <div data-testid="pane">
      <section id="section-contact" />
      <section id="section-links" />
      <SelectProbe />
    </div>,
  );
  return screen.getByTestId("pane");
}

// jsdom lays nothing out; each section reports the top a test gives it, and
// unplaced sections sit below the reading line.
const tops = new Map<string, number>();

function placeSection({ id, top }: { id: string; top: number }) {
  tops.set(id, top);
}

function setScroll({ pane, scrollTop }: { pane: HTMLElement; scrollTop: number }) {
  Object.defineProperties(pane, {
    scrollHeight: { configurable: true, value: 2000 },
    clientHeight: { configurable: true, value: 800 },
    scrollTop: { configurable: true, value: scrollTop },
  });
}

beforeEach(() => {
  tops.clear();
  window.innerHeight = 1000;
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (
    this: HTMLElement,
  ) {
    return DOMRect.fromRect({ y: tops.get(this.id) ?? 900 });
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("the first section is active before any scrolling", () => {
  renderPane();
  expect(screen.getByTestId("active")).toHaveTextContent("contact");
});

test("scrolling the pane activates the last section above the reading line", () => {
  const pane = renderPane();
  placeSection({ id: "section-contact", top: -500 });
  placeSection({ id: "section-links", top: 300 });
  setScroll({ pane, scrollTop: 600 });
  fireEvent.scroll(pane);
  expect(screen.getByTestId("active")).toHaveTextContent("links");
});

test("reaching the end of the pane activates the last section even below the line", () => {
  const pane = renderPane();
  placeSection({ id: "section-contact", top: -500 });
  placeSection({ id: "section-links", top: 700 });
  setScroll({ pane, scrollTop: 1200 });
  fireEvent.scroll(pane);
  expect(screen.getByTestId("active")).toHaveTextContent("links");
});

test("a scroller that does not hold the sections is ignored", () => {
  renderPane();
  placeSection({ id: "section-links", top: 0 });
  const unrelated = document.createElement("div");
  document.body.append(unrelated);
  fireEvent.scroll(unrelated);
  expect(screen.getByTestId("active")).toHaveTextContent("contact");
  unrelated.remove();
});

test("a selected section stays active against scrolling until the user scrolls", () => {
  const pane = renderPane();
  act(() => screen.getByText("pick").click());
  placeSection({ id: "section-links", top: 900 });
  setScroll({ pane, scrollTop: 0 });
  fireEvent.scroll(pane);
  expect(screen.getByTestId("active")).toHaveTextContent("links");
  fireEvent.wheel(window);
  fireEvent.scroll(pane);
  expect(screen.getByTestId("active")).toHaveTextContent("contact");
});
