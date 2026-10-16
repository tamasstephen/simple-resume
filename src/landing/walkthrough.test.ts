import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { bindWalkthroughControls, nextStep, startWalkthrough } from "./walkthrough";

function buildDom(): { root: HTMLElement; pageCount: HTMLElement; steps: HTMLElement[] } {
  document.body.innerHTML = `
    <span id="page-count">A4 · 2 PAGES</span>
    <ol data-walkthrough>
      <li class="step"></li>
      <li class="step step--active"></li>
      <li class="step"></li>
    </ol>`;
  const root = document.querySelector<HTMLElement>("[data-walkthrough]");
  const pageCount = document.querySelector<HTMLElement>("#page-count");
  if (!root || !pageCount) throw new Error("fixture missing");
  return { root, pageCount, steps: [...root.querySelectorAll<HTMLElement>("li")] };
}

function activeIndexes(steps: HTMLElement[]): number[] {
  return steps.flatMap((step, index) => (step.classList.contains("step--active") ? [index] : []));
}

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test("nextStep cycles 0 -> 1 -> 2 -> 0", () => {
  expect(nextStep(0)).toBe(1);
  expect(nextStep(1)).toBe(2);
  expect(nextStep(2)).toBe(0);
});

test("advances one step per interval and updates the page count", () => {
  const { root, pageCount, steps } = buildDom();
  startWalkthrough({ root, intervalMs: 4000, prefersReducedMotion: false });
  expect(activeIndexes(steps)).toEqual([1]);

  vi.advanceTimersByTime(4000);
  expect(activeIndexes(steps)).toEqual([2]);
  expect(pageCount.textContent).toBe("A4 · 2 PAGES");

  vi.advanceTimersByTime(4000);
  expect(activeIndexes(steps)).toEqual([0]);
  expect(pageCount.textContent).toBe("A4 · 1 PAGE");
});

test("reduced motion keeps step 02 and schedules no timer", () => {
  const { root, pageCount, steps } = buildDom();
  startWalkthrough({ root, intervalMs: 4000, prefersReducedMotion: true });
  expect(activeIndexes(steps)).toEqual([1]);
  expect(vi.getTimerCount()).toBe(0);
  vi.advanceTimersByTime(20000);
  expect(activeIndexes(steps)).toEqual([1]);
  expect(pageCount.textContent).toBe("A4 · 2 PAGES");
});

test("stop() clears the timer", () => {
  const { root } = buildDom();
  const controller = startWalkthrough({ root, intervalMs: 4000, prefersReducedMotion: false });
  expect(vi.getTimerCount()).toBe(1);
  controller.stop();
  expect(vi.getTimerCount()).toBe(0);
});

test("pause() stops advancing and resume() continues", () => {
  const { root, steps } = buildDom();
  const controller = startWalkthrough({ root, intervalMs: 4000, prefersReducedMotion: false });
  controller.pause();
  expect(controller.isPaused()).toBe(true);
  expect(root.hasAttribute("data-paused")).toBe(true);
  vi.advanceTimersByTime(20000);
  expect(activeIndexes(steps)).toEqual([1]);

  controller.resume();
  expect(root.hasAttribute("data-paused")).toBe(false);
  vi.advanceTimersByTime(4000);
  expect(activeIndexes(steps)).toEqual([2]);
});

test("resume() waits only for the time left in the step and keeps one timer", () => {
  const { root, steps } = buildDom();
  const controller = startWalkthrough({ root, intervalMs: 4000, prefersReducedMotion: false });
  vi.advanceTimersByTime(3000);
  controller.pause();
  controller.pause();
  controller.resume();
  controller.resume();
  expect(vi.getTimerCount()).toBe(1);
  vi.advanceTimersByTime(999);
  expect(activeIndexes(steps)).toEqual([1]);
  vi.advanceTimersByTime(1);
  expect(activeIndexes(steps)).toEqual([2]);
});

test("reduced motion returns an inert controller", () => {
  const { root } = buildDom();
  const controller = startWalkthrough({ root, intervalMs: 4000, prefersReducedMotion: true });
  controller.resume();
  expect(vi.getTimerCount()).toBe(0);
  expect(controller.isPaused()).toBe(false);
});

function buildBoundControls() {
  const { root, steps } = buildDom();
  const button = document.createElement("button");
  button.textContent = "Pause";
  button.setAttribute("aria-pressed", "false");
  document.body.append(button);
  const controller = startWalkthrough({ root, intervalMs: 4000, prefersReducedMotion: false });
  bindWalkthroughControls({ root, button, controller });
  return { root, steps, button, controller };
}

test("the button toggles aria-pressed, label and playback", () => {
  const { steps, button, controller } = buildBoundControls();
  button.click();
  expect(button.getAttribute("aria-pressed")).toBe("true");
  expect(button.textContent).toBe("Play");
  expect(controller.isPaused()).toBe(true);
  vi.advanceTimersByTime(20000);
  expect(activeIndexes(steps)).toEqual([1]);

  button.click();
  expect(button.getAttribute("aria-pressed")).toBe("false");
  expect(button.textContent).toBe("Pause");
  expect(controller.isPaused()).toBe(false);
});

test("hover pauses and mouseleave resumes", () => {
  const { root, controller } = buildBoundControls();
  root.dispatchEvent(new MouseEvent("mouseenter"));
  expect(controller.isPaused()).toBe(true);
  root.dispatchEvent(new MouseEvent("mouseleave"));
  expect(controller.isPaused()).toBe(false);
});

test("mouseleave does not resume after the user pressed Pause", () => {
  const { root, button, controller } = buildBoundControls();
  root.dispatchEvent(new MouseEvent("mouseenter"));
  button.click();
  root.dispatchEvent(new MouseEvent("mouseleave"));
  expect(controller.isPaused()).toBe(true);
});

test("focus-within pauses and a hidden tab pauses", () => {
  const { root, controller } = buildBoundControls();
  root.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
  expect(controller.isPaused()).toBe(true);
  root.dispatchEvent(new FocusEvent("focusout", { bubbles: true }));
  expect(controller.isPaused()).toBe(false);

  const hidden = vi.spyOn(document, "hidden", "get").mockReturnValue(true);
  document.dispatchEvent(new Event("visibilitychange"));
  expect(controller.isPaused()).toBe(true);
  hidden.mockReturnValue(false);
  document.dispatchEvent(new Event("visibilitychange"));
  expect(controller.isPaused()).toBe(false);
  hidden.mockRestore();
});

test("moving focus between children inside the list keeps it paused", () => {
  const { root, controller } = buildBoundControls();
  const [first, second] = [...root.querySelectorAll<HTMLElement>("li")];
  if (!first || !second) throw new Error("fixture missing");
  first.tabIndex = 0;
  second.tabIndex = 0;

  root.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
  root.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: second }));
  expect(controller.isPaused()).toBe(true);

  root.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: null }));
  expect(controller.isPaused()).toBe(false);
});

test("after stop() the controller is inert", () => {
  const { root, steps, controller } = buildBoundControls();
  controller.stop();
  root.dispatchEvent(new MouseEvent("mouseenter"));
  root.dispatchEvent(new MouseEvent("mouseleave"));
  vi.advanceTimersByTime(20000);
  expect(activeIndexes(steps)).toEqual([1]);
  expect(vi.getTimerCount()).toBe(0);
});
