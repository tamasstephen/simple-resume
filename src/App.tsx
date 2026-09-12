import { useState } from "react";
import { ResumeProvider } from "./features/resume/ResumeProvider";
import { LocalStoragePersistence } from "./lib/persistence/LocalStoragePersistence";
import { AppHeader } from "./AppHeader";
import { Editor } from "./features/editor/Editor";
import { Preview } from "./features/preview/Preview";
import { printStyles } from "./features/render/printStyles";

const persistence = new LocalStoragePersistence();

export default function App() {
  // The header shows how many A4 pages the current resume makes; only the
  // preview's pagination run knows, so App holds the number between them.
  const [pageCount, setPageCount] = useState(0);

  return (
    <ResumeProvider persistence={persistence}>
      {/* Print CSS for native print-to-PDF (S12). Renders inside #root —
          after index.css in <head> — so its rules win on document order. */}
      <style>{printStyles}</style>
      <AppHeader pageCount={pageCount} />
      <main className="app-shell">
        <section aria-label="Editor" className="editor-pane">
          <Editor />
        </section>
        <section aria-label="Preview" className="preview-pane">
          <Preview onPaginated={setPageCount} />
        </section>
      </main>
    </ResumeProvider>
  );
}
