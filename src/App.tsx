import { ResumeProvider } from "./features/resume/ResumeProvider";
import { LocalStoragePersistence } from "./lib/persistence/LocalStoragePersistence";

const persistence = new LocalStoragePersistence();

export default function App() {
  return (
    <ResumeProvider persistence={persistence}>
      <main className="app-shell">
        <section aria-label="Editor" className="editor-pane" />
        <section aria-label="Preview" className="preview-pane" />
      </main>
    </ResumeProvider>
  );
}
