import { useEffect, useRef, useState } from "react";
import { Previewer } from "pagedjs";
import { useResumeState } from "../resume/useResume";
import { renderResumeHtml } from "../render/renderResumeHtml";
import { pageStyles } from "../render/pageStyles";

// A4 width at 96dpi (210mm) — used to scale the rendered page to fit the pane.
const PAGE_WIDTH_PX = 794;

export function Preview() {
  const resume = useResumeState().committed;
  const scrollRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Re-paginate whenever the committed resume changes. Each run paginates
  // into its own target element so a superseded (or StrictMode-doubled) run
  // is removed on cleanup and cannot stack a stale copy of the pages.
  useEffect(() => {
    const container = pagesRef.current;
    if (container === null) return;
    const target = document.createElement("div");
    container.replaceChildren(target);
    const previewer = new Previewer();
    void previewer
      .preview(renderResumeHtml(resume), [{ "resume-page": pageStyles }], target)
      .catch((error: unknown) => {
        console.error("Preview pagination failed", error);
      });
    return () => {
      target.remove();
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
        ref={pagesRef}
        className="preview-pages"
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
      />
    </div>
  );
}
