import { resumeSchema, type Resume } from "../schema/resume";
import type { PersistenceProvider } from "./PersistenceProvider";

const DEFAULT_KEY = "resume-builder:v1";

export class LocalStoragePersistence implements PersistenceProvider {
  constructor(
    private readonly storage: Storage = window.localStorage,
    private readonly key: string = DEFAULT_KEY,
  ) {}

  static isAvailable(storage: Storage = window.localStorage): boolean {
    try {
      const probe = "__resume_probe__";
      storage.setItem(probe, "1");
      storage.removeItem(probe);
      return true;
    } catch {
      return false;
    }
  }

  load(): Resume | null {
    const raw = this.storage.getItem(this.key);
    if (raw === null) return null;
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      return null;
    }
    const result = resumeSchema.safeParse(parsed);
    return result.success ? result.data : null;
  }

  save(resume: Resume): void {
    this.storage.setItem(this.key, JSON.stringify(resume));
  }

  clear(): void {
    this.storage.removeItem(this.key);
  }
}
