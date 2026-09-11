import { useEffect, useRef, useState } from "react";
import { Previewer } from "pagedjs";
import { useResumeState } from "../resume/useResume";
import { renderResumeHtml } from "../render/renderResumeHtml";
import { pageStyles } from "../render/pageStyles";

// A4 width at 96dpi (210mm) — used to scale the rendered page to fit the pane.
const PAGE_WIDTH_PX = 794;

// Pagination runs are serialized app-wide. StrictMode double-mounts the
// effect in dev, and a superseded Previewer keeps chunking inside its
// already-removed target — Paged.js's Layout reads element.offsetParent,
// which is null for detached DOM, so the zombie run throws. Chaining runs
// keeps at most one chunker alive and lets each cleanup remove its target
// only after its run has settled.
let paginationQueue: Promise<void> = Promise.resolve();

export function Preview() {
  const resume = useResumeState().committed;
  const scrollRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  // Unscaled layout size of the paginated content, measured after each run.
  // The sizer wrapper exposes scale × this as the real scrollable area —
  // transforms do not affect layout, so the bare scaled element would leave
  // a phantom (1-scale) dead zone at the bottom of the scroll pane.
  const [contentSize, setContentSize] = useState<{ width: number; height: number } | null>(null);

  // Re-paginate whenever the committed resume changes. Each run chunks
  // OFF-SCREEN and UNSCALED, then moves the finished pages into the scaled
  // container. Chunking inside the transform:scale() subtree skews Paged.js's
  // rounded overflow comparisons — content that lands exactly on the page
  // boundary can slip into the chunker's phantom second column instead of
  // breaking onto a new page (reproduced: long summary + 2 one-line projects
  // → Languages invisible). The queue guarantees a superseded (or
  // StrictMode-doubled) run finishes before the next one starts.
  useEffect(() => {
    const container = pagesRef.current;
    if (container === null) return;
    const stage = document.createElement("div");
    const run = async () => {
      stage.className = "preview-stage";
      stage.style.cssText = `position:absolute;left:-9999px;top:0;width:${PAGE_WIDTH_PX}px;`;
      document.body.appendChild(stage);
      const previewer = new Previewer();
      try {
        await previewer.preview(renderResumeHtml(resume), [{ "resume-page": pageStyles }], stage);
        container.replaceChildren(...stage.children);
        const el = pagesRef.current;
        if (el !== null) setContentSize({ width: el.offsetWidth, height: el.offsetHeight });
      } catch (error) {
        console.error("Preview pagination failed", error);
      } finally {
        stage.remove();
      }
    };
    const queued = paginationQueue.then(run);
    paginationQueue = queued.then(
      () => undefined,
      () => undefined,
    );
    return () => {
      void queued.then(() => stage.remove());
    };
  }, [resume]);

  // Fit the A4 page width to the available pane width.
  useEffect(() => {
    const fit = () => {
      const scroll = scrollRef.current;
      if (scroll === null) return;
      const width = scroll.clientWidth;
      if (width > 0) setScale(Math.min(1, width / PAGE_WIDTH_PX));
    };
    fit();
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <div ref={scrollRef} className="preview-scroll">
      <div
        className="preview-sizer"
        style={
          contentSize === null
            ? undefined
            : { width: contentSize.width * scale, height: contentSize.height * scale }
        }
      >
        <div
          ref={pagesRef}
          className="preview-pages"
          style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
        />
      </div>
    </div>
  );
}
