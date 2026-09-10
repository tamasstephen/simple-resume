import type { Resume } from "../schema/resume";

export interface PersistenceProvider {
  load(): Resume | null;
  save(resume: Resume): void;
  clear(): void;
}
