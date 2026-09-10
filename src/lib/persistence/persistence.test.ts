import { InMemoryPersistence } from "./InMemoryPersistence";
import { LocalStoragePersistence, DEFAULT_KEY } from "./LocalStoragePersistence";
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

  test("mutating the object passed to save() does not change what load() returns", () => {
    const store = new InMemoryPersistence();
    const resume = { ...emptyResume(), contact: { ...emptyResume().contact, name: "Ada" } };
    store.save(resume);
    resume.contact.name = "Mutated";
    expect(store.load()?.contact.name).toBe("Ada");
  });

  test("mutating a loaded object does not change what a later load() returns", () => {
    const store = new InMemoryPersistence();
    store.save({ ...emptyResume(), contact: { ...emptyResume().contact, name: "Ada" } });
    const loaded = store.load();
    if (loaded) loaded.contact.name = "Mutated";
    expect(store.load()?.contact.name).toBe("Ada");
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
    window.localStorage.setItem(DEFAULT_KEY, JSON.stringify({ nope: true }));
    expect(new LocalStoragePersistence().load()).toBeNull();
  });

  test("returns null when stored value is not JSON", () => {
    window.localStorage.setItem(DEFAULT_KEY, "{not json");
    expect(new LocalStoragePersistence().load()).toBeNull();
  });

  test("isAvailable reports true in jsdom", () => {
    expect(LocalStoragePersistence.isAvailable()).toBe(true);
  });

  test("returns null when nothing is stored", () => {
    expect(new LocalStoragePersistence().load()).toBeNull();
  });

  test("clear removes stored data", () => {
    const store = new LocalStoragePersistence();
    store.save(emptyResume());
    store.clear();
    expect(store.load()).toBeNull();
  });
});
