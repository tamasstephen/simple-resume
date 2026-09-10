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
