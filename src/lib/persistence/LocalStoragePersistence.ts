import type { Resume } from "../schema/resume";
import type { PersistenceProvider } from "./PersistenceProvider";
import { migrateStored } from "./migrateStored";

export const DEFAULT_KEY = "resume-builder:v1";

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
    // Delegates schema-version migration/validation to migrateStored so an
    // older-but-migratable schemaVersion isn't discarded as if it were
    // corrupt data (see migrateStored.ts for the migration seam).
    return migrateStored(parsed);
  }

  save(resume: Resume): void {
    this.storage.setItem(this.key, JSON.stringify(resume));
  }

  clear(): void {
    this.storage.removeItem(this.key);
  }
}
