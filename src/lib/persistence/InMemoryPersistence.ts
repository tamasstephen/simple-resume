import type { Resume } from "../schema/resume";
import type { PersistenceProvider } from "./PersistenceProvider";

export class InMemoryPersistence implements PersistenceProvider {
  private stored: Resume | null = null;

  load(): Resume | null {
    return this.stored;
  }

  save(resume: Resume): void {
    this.stored = resume;
  }

  clear(): void {
    this.stored = null;
  }
}
