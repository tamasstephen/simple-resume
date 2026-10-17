import { migrateStored } from "./migrateStored";
import { emptyResume, SCHEMA_VERSION } from "../schema/resume";

test("returns the validated resume when schemaVersion matches the current version", () => {
  const resume = { ...emptyResume(), contact: { ...emptyResume().contact, name: "Ada" } };
  expect(migrateStored(resume)).toEqual(resume);
});

test("returns null when schemaVersion is unknown (newer than supported)", () => {
  expect(migrateStored({ ...emptyResume(), schemaVersion: SCHEMA_VERSION + 998 })).toBeNull();
});

test("returns null when the value has no recognizable schemaVersion envelope", () => {
  expect(migrateStored({ nope: true })).toBeNull();
  expect(migrateStored(null)).toBeNull();
  expect(migrateStored("just a string")).toBeNull();
});

test("returns null when schemaVersion matches but the rest fails full schema validation", () => {
  expect(migrateStored({ schemaVersion: SCHEMA_VERSION, nope: true })).toBeNull();
});

// v1 offered no template choice (every resume rendered ATS), so its stored
// value is a default, not a preference: v2 moves it to the new default.
test.each(["ats", "designed"])(
  "migrates a v1 resume with template %s to v2 minimal",
  (template) => {
    const v1 = { ...emptyResume(), schemaVersion: 1, template, skills: [{ id: "s1", name: "TS" }] };
    const migrated = migrateStored(v1);
    expect(migrated?.schemaVersion).toBe(2);
    expect(migrated?.template).toBe("minimal");
    expect(migrated?.skills).toEqual([{ id: "s1", name: "TS" }]);
  },
);

test("returns null for a v1 value that still fails validation after migrating", () => {
  expect(migrateStored({ schemaVersion: 1 })).toBeNull();
});
