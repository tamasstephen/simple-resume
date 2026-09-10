import { InMemoryPersistence } from "./InMemoryPersistence";
import { LocalStoragePersistence } from "./LocalStoragePersistence";
import { emptyResume } from "../schema/resume";

describe("InMemoryPersistence", () => {
  test("returns null before any save", () => {
    expect(new InMemoryPersistence().load()).toBeNull();
  });

  test("round-trips a saved resume", () => {
    const store = new InMemoryPersistence();
    const resume = { ...emptyResume(), contact: { ...emptyResume().contact, name: "Ada" } };
    store.save(resume);
    expect(store.load()).toEqual(resume);
  });

  test("clear removes stored data", () => {
    const store = new InMemoryPersistence();
    store.save(emptyResume());
    store.clear();
    expect(store.load()).toBeNull();
  });
});

describe("LocalStoragePersistence", () => {
  beforeEach(() => window.localStorage.clear());

  test("round-trips through window.localStorage", () => {
    const store = new LocalStoragePersistence();
    const resume = { ...emptyResume(), contact: { ...emptyResume().contact, name: "Grace" } };
    store.save(resume);
    expect(new LocalStoragePersistence().load()).toEqual(resume);
  });

  test("returns null when stored JSON is invalid against the schema", () => {
    window.localStorage.setItem("resume-builder:v1", JSON.stringify({ nope: true }));
    expect(new LocalStoragePersistence().load()).toBeNull();
  });

  test("returns null when stored value is not JSON", () => {
    window.localStorage.setItem("resume-builder:v1", "{not json");
    expect(new LocalStoragePersistence().load()).toBeNull();
  });

  test("isAvailable reports true in jsdom", () => {
    expect(LocalStoragePersistence.isAvailable()).toBe(true);
  });
});
