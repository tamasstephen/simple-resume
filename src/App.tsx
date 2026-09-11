import { ResumeProvider } from "./features/resume/ResumeProvider";
import { LocalStoragePersistence } from "./lib/persistence/LocalStoragePersistence";
import { Editor } from "./features/editor/Editor";
import { Preview } from "./features/preview/Preview";

const persistence = new LocalStoragePersistence();

export default function App() {
  return (
    <ResumeProvider persistence={persistence}>
      <main className="app-shell">
        <section aria-label="Editor" className="editor-pane">
          <Editor />
        </section>
        <section aria-label="Preview" className="preview-pane">
          <Preview />
        </section>
      </main>
    </ResumeProvider>
  );
}
