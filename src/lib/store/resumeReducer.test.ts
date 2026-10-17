import { resumeReducer, initialState } from "./resumeReducer";
import { emptyResume, type ExperienceItem } from "../schema/resume";

const expItem = (id: string, company: string): ExperienceItem => ({
  id,
  company,
  role: "Eng",
  startDate: "2020",
  endDate: "2021",
  current: false,
  location: "",
  description: "",
});

test("SAVE_ITEM appends a new item", () => {
  const state = initialState();
  const next = resumeReducer(state, {
    type: "SAVE_ITEM",
    section: "experience",
    item: expItem("1", "Acme"),
  });
  expect(next.committed.experience).toHaveLength(1);
  expect(next.committed.experience[0]?.company).toBe("Acme");
});

test("SAVE_ITEM with an existing id replaces in place (edit), preserving order", () => {
  let state = initialState();
  state = resumeReducer(state, {
    type: "SAVE_ITEM",
    section: "experience",
    item: expItem("1", "Acme"),
  });
  state = resumeReducer(state, {
    type: "SAVE_ITEM",
    section: "experience",
    item: expItem("2", "Beta"),
  });
  const next = resumeReducer(state, {
    type: "SAVE_ITEM",
    section: "experience",
    item: expItem("1", "Acme Corp"),
  });
  expect(next.committed.experience.map((e) => e.id)).toEqual(["1", "2"]);
  expect(next.committed.experience[0]?.company).toBe("Acme Corp");
});

test("DELETE_ITEM removes by id", () => {
  let state = initialState();
  state = resumeReducer(state, {
    type: "SAVE_ITEM",
    section: "experience",
    item: expItem("1", "Acme"),
  });
  const next = resumeReducer(state, { type: "DELETE_ITEM", section: "experience", id: "1" });
  expect(next.committed.experience).toHaveLength(0);
});

test("SELECT_TEMPLATE updates template without touching data", () => {
  let state = initialState();
  state = resumeReducer(state, {
    type: "SAVE_ITEM",
    section: "skills",
    item: { id: "s1", name: "TS" },
  });
  const next = resumeReducer(state, { type: "SELECT_TEMPLATE", template: "executive" });
  expect(next.committed.template).toBe("executive");
  expect(next.committed.skills).toHaveLength(1);
});

test("reducer does not mutate the previous state", () => {
  const state = initialState();
  const next = resumeReducer(state, {
    type: "SAVE_ITEM",
    section: "experience",
    item: expItem("1", "Acme"),
  });
  expect(state.committed.experience).toHaveLength(0);
  expect(next).not.toBe(state);
});

test("SAVE_ITEM rejects an item that does not match its section's type at compile time", () => {
  const state = initialState();
  // @ts-expect-error - a SkillItem-shaped object is not a valid "experience" item.
  resumeReducer(state, { type: "SAVE_ITEM", section: "experience", item: { id: "x", name: "TS" } });
});

test("SET_CONTACT replaces the contact header and preserves other sections", () => {
  let state = initialState();
  state = resumeReducer(state, {
    type: "SAVE_ITEM",
    section: "skills",
    item: { id: "s1", name: "TS" },
  });
  const contact = {
    name: "Ada Lovelace",
    title: "Engineer",
    email: "ada@example.com",
    phone: "",
    location: "",
  };
  const next = resumeReducer(state, { type: "SET_CONTACT", contact });
  expect(next.committed.contact).toEqual(contact);
  expect(next.committed.skills).toHaveLength(1);
  expect(state.committed.contact).not.toEqual(contact);
});

test("SET_SUMMARY replaces the summary and preserves other sections", () => {
  let state = initialState();
  state = resumeReducer(state, {
    type: "SAVE_ITEM",
    section: "skills",
    item: { id: "s1", name: "TS" },
  });
  const summary = { text: "Experienced engineer." };
  const next = resumeReducer(state, { type: "SET_SUMMARY", summary });
  expect(next.committed.summary).toEqual(summary);
  expect(next.committed.skills).toHaveLength(1);
  expect(state.committed.summary).not.toEqual(summary);
});

test("REPLACE_ALL swaps the entire committed resume without mutating the previous state", () => {
  const state = initialState();
  const replacement = { ...emptyResume(), skills: [{ id: "s1", name: "TS" }] };
  const next = resumeReducer(state, { type: "REPLACE_ALL", resume: replacement });
  expect(next.committed).toEqual(replacement);
  expect(state.committed.skills).toHaveLength(0);
});
