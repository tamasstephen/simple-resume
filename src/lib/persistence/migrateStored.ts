import { z } from "zod";
import { resumeSchema, SCHEMA_VERSION, type Resume } from "../schema/resume";

const envelopeSchema = z.object({ schemaVersion: z.number() });

/**
 * Migration steps, keyed by the schema version they migrate FROM, each
 * producing a value shaped for the NEXT schema version (schemaVersion + 1).
 * There is currently only one schema version (SCHEMA_VERSION = 1), so this
 * map is empty. It is the obvious, localized place to add a `1: (v1Value) =>
 * v2Shape` entry once SCHEMA_VERSION bumps to 2, instead of letting older
 * stored data become indistinguishable from corruption.
 */
const migrations: Record<number, (value: unknown) => unknown> = {};

/**
 * Turns an arbitrary parsed-JSON value (from localStorage or elsewhere) into
 * a validated Resume, running any necessary schema migrations first.
 *
 * Returns null when the value is not recognizable as our data at all, when
 * its schemaVersion is newer than we know how to handle, or when it fails
 * full schema validation after migration.
 *
 * NOTE: surfacing a distinct "incompatible version" error to the user (PRD
 * S13/S14) is deferred to the JSON-import plan; for now an unrecognized or
 * unmigratable version is treated the same as "no saved resume" (null),
 * exactly like today's corrupt-data handling.
 */
export function migrateStored(value: unknown): Resume | null {
  const envelope = envelopeSchema.safeParse(value);
  if (!envelope.success) return null;

  let migrated: unknown = value;
  let version = envelope.data.schemaVersion;

  while (version !== SCHEMA_VERSION) {
    const migrate = migrations[version];
    if (!migrate) return null; // unknown version: no migration path (too old) or newer than we support
    migrated = migrate(migrated);
    version += 1;
  }

  const result = resumeSchema.safeParse(migrated);
  return result.success ? result.data : null;
}
