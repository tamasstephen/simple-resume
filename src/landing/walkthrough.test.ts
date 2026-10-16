import { afterEach, beforeEach, expect, test, vi } from "vitest";
import { nextStep, startWalkthrough } from "./walkthrough";

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

test("the returned stop function clears the timer", () => {
  const { root } = buildDom();
  const stop = startWalkthrough({ root, intervalMs: 4000, prefersReducedMotion: false });
  expect(vi.getTimerCount()).toBe(1);
  stop();
  expect(vi.getTimerCount()).toBe(0);
});
