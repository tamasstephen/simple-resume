import { useState } from "react";
import { ResumeProvider } from "./features/resume/ResumeProvider";
import { LocalStoragePersistence } from "./lib/persistence/LocalStoragePersistence";
import { AppHeader } from "./AppHeader";
import { Editor } from "./features/editor/Editor";
import { SectionRail } from "./features/editor/SectionRail";
import { useActiveSection } from "./features/editor/useActiveSection";
import { SECTIONS } from "./features/editor/sectionMeta";
import { Preview } from "./features/preview/Preview";
import { PreviewBar } from "./features/preview/PreviewBar";
import { printStyles } from "./features/render/printStyles";

const persistence = new LocalStoragePersistence();
const SECTION_IDS = SECTIONS.map((section) => section.id);

export default function App() {
  // The preview bar shows how many A4 pages the current resume makes; only
  // the preview's pagination run knows, so App holds the number between them.
  const [pageCount, setPageCount] = useState(0);
  const activeSectionId = useActiveSection(SECTION_IDS);

  return (
    <ResumeProvider persistence={persistence}>
      {/* Print CSS for native print-to-PDF (S12). Renders inside #root —
          after index.css in <head> — so its rules win on document order. */}
      <style>{printStyles}</style>
      <AppHeader />
      <main className="app-shell">
        <SectionRail activeId={activeSectionId} />
        <section aria-label="Editor" className="editor-pane">
          <Editor />
        </section>
        <section id="preview" aria-label="Preview" className="preview-pane">
          <PreviewBar pageCount={pageCount} />
          <Preview onPaginated={setPageCount} />
        </section>
      </main>
    </ResumeProvider>
  );
}
