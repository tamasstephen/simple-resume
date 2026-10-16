import { render, screen, act } from "@testing-library/react";
import { useActiveSection } from "./useActiveSection";
import type { SectionId } from "./sectionMeta";

const IDS: readonly SectionId[] = ["contact", "links"];

function Probe() {
  return <span data-testid="active">{useActiveSection(IDS) ?? "none"}</span>;
}

function renderSections() {
  return render(
    <>
      <section id="section-contact" />
      <section id="section-links" />
      <Probe />
    </>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

test("returns null without throwing where IntersectionObserver is missing", () => {
  vi.stubGlobal("IntersectionObserver", undefined);
  renderSections();
  expect(screen.getByTestId("active")).toHaveTextContent("none");
});

function rectAt(top: number): DOMRectReadOnly {
  return {
    x: 0,
    y: top,
    width: 0,
    height: 0,
    top,
    right: 0,
    bottom: top,
    left: 0,
    toJSON: () => ({}),
  };
}

class FakeObserver implements IntersectionObserver {
  static latest: FakeObserver | null = null;
  readonly root = null;
  readonly rootMargin = "";
  readonly scrollMargin = "";
  readonly thresholds: readonly number[] = [];

  constructor(private readonly callback: IntersectionObserverCallback) {
    FakeObserver.latest = this;
  }

  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }

  emit(entries: IntersectionObserverEntry[]) {
    this.callback(entries, this);
  }
}

function intersecting({ id, top }: { id: string; top: number }): IntersectionObserverEntry {
  const target = document.getElementById(id);
  if (target === null) throw new Error(`missing #${id}`);
  return {
    target,
    isIntersecting: true,
    boundingClientRect: rectAt(top),
    intersectionRatio: 1,
    intersectionRect: rectAt(top),
    rootBounds: null,
    time: 0,
  };
}

test("the intersecting section nearest the top wins", () => {
  vi.stubGlobal("IntersectionObserver", FakeObserver);
  renderSections();
  act(() => {
    FakeObserver.latest?.emit([
      intersecting({ id: "section-links", top: 300 }),
      intersecting({ id: "section-contact", top: 40 }),
    ]);
  });
  expect(screen.getByTestId("active")).toHaveTextContent("contact");
});
