import { z } from "zod";
import { resumeSchema, SCHEMA_VERSION, type Resume } from "../schema/resume";

const envelopeSchema = z.object({ schemaVersion: z.number() });

const recordSchema = z.record(z.string(), z.unknown());

/** v1 → v2: the template list changed. v1 offered no template choice — every
 *  resume rendered ATS — so its stored value is a default, not a preference,
 *  and moves to the new default. A non-object is passed through for the final
 *  schema check to reject. */
function migrateV1ToV2(value: unknown): unknown {
  const record = recordSchema.safeParse(value);
  if (!record.success) return value;
  return { ...record.data, schemaVersion: 2, template: "minimal" };
}

/**
 * Migration steps, keyed by the schema version they migrate FROM, each
 * producing a value shaped for the NEXT schema version (schemaVersion + 1),
 * so older stored data is upgraded rather than mistaken for corruption.
 */
const migrations: Record<number, (value: unknown) => unknown> = { 1: migrateV1ToV2 };

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
