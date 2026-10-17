import { act, renderHook } from "@testing-library/react";
import { useSectionDraft } from "./useSectionDraft";

interface Foo {
  id: string;
  name: string;
}
const makeEmpty = (): Foo => ({ id: "new", name: "" });

test("starts with no draft", () => {
  const { result } = renderHook(() => useSectionDraft(makeEmpty));
  expect(result.current.draft).toBeNull();
  expect(result.current.isEditing).toBe(false);
});

test("startAdd opens a fresh draft (not editing)", () => {
  const { result } = renderHook(() => useSectionDraft(makeEmpty));
  act(() => result.current.startAdd());
  expect(result.current.draft).toEqual({ id: "new", name: "" });
  expect(result.current.isEditing).toBe(false);
});

test("startEdit opens a copy of the item (editing) without aliasing", () => {
  const { result } = renderHook(() => useSectionDraft(makeEmpty));
  const item: Foo = { id: "1", name: "Ada" };
  act(() => result.current.startEdit(item));
  expect(result.current.draft).toEqual(item);
  expect(result.current.draft).not.toBe(item);
  expect(result.current.isEditing).toBe(true);
});

test("updateDraft merges a patch", () => {
  const { result } = renderHook(() => useSectionDraft(makeEmpty));
  act(() => result.current.startAdd());
  act(() => result.current.updateDraft({ name: "Grace" }));
  expect(result.current.draft).toEqual({ id: "new", name: "Grace" });
});

test("updateDraft is a no-op when no draft is open", () => {
  const { result } = renderHook(() => useSectionDraft(makeEmpty));
  act(() => result.current.updateDraft({ name: "x" }));
  expect(result.current.draft).toBeNull();
});

test("cancel discards the draft", () => {
  const { result } = renderHook(() => useSectionDraft(makeEmpty));
  act(() => result.current.startAdd());
  act(() => result.current.cancel());
  expect(result.current.draft).toBeNull();
});

const requireName = (item: Foo) => ({ name: item.name.length > 0 ? null : "Add a name." });

test("trySave commits a valid draft and closes it", () => {
  const { result } = renderHook(() => useSectionDraft(makeEmpty, requireName));
  const commit = vi.fn();
  act(() => result.current.startEdit({ id: "1", name: "Ada" }));
  act(() => result.current.trySave(commit));
  expect(commit).toHaveBeenCalledWith({ id: "1", name: "Ada" });
  expect(result.current.draft).toBeNull();
});

test("errors stay hidden until a save is blocked, then follow the edits", () => {
  const { result } = renderHook(() => useSectionDraft(makeEmpty, requireName));
  const commit = vi.fn();
  act(() => result.current.startAdd());
  expect(result.current.errors).toEqual({});
  act(() => result.current.trySave(commit));
  expect(commit).not.toHaveBeenCalled();
  expect(result.current.errors).toEqual({ name: "Add a name." });
  expect(result.current.blockedSaveCount).toBe(1);
  act(() => result.current.updateDraft({ name: "Ada" }));
  expect(result.current.errors).toEqual({ name: null });
});

test("opening another draft forgets the blocked save", () => {
  const { result } = renderHook(() => useSectionDraft(makeEmpty, requireName));
  act(() => result.current.startAdd());
  act(() => result.current.trySave(vi.fn()));
  act(() => result.current.startAdd());
  expect(result.current.blockedSaveCount).toBe(0);
  expect(result.current.errors).toEqual({});
});
