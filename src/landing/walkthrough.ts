export type StepIndex = 0 | 1 | 2;

export interface WalkthroughController {
  pause(): void;
  resume(): void;
  stop(): void;
  isPaused(): boolean;
}

const ACTIVE_CLASS = "step--active";
const PAUSED_ATTRIBUTE = "data-paused";
const INITIAL_STEP: StepIndex = 1;

export function nextStep(current: StepIndex): StepIndex {
  if (current === 0) return 1;
  if (current === 1) return 2;
  return 0;
}

function getPageCountLabel(step: StepIndex): string {
  return step === 0 ? "A4 · 1 PAGE" : "A4 · 2 PAGES";
}

function showStep({ root, step }: { root: HTMLElement; step: StepIndex }): void {
  const steps = [...root.querySelectorAll<HTMLElement>(":scope > li")];
  steps.forEach((item, index) => item.classList.toggle(ACTIVE_CLASS, index === step));
  const pageCount = document.getElementById("page-count");
  if (pageCount) pageCount.textContent = getPageCountLabel(step);
}

function createStaticController(): WalkthroughController {
  return { pause() {}, resume() {}, stop() {}, isPaused: () => false };
}

/**
 * Advances the active step every `intervalMs`. A single timeout handle is reused,
 * and pausing remembers the elapsed time so the CSS progress segment (which is
 * frozen, not reset) and the next step change stay in sync.
 */
export function startWalkthrough({
  root,
  intervalMs,
  prefersReducedMotion,
}: {
  root: HTMLElement;
  intervalMs: number;
  prefersReducedMotion: boolean;
}): WalkthroughController {
  showStep({ root, step: INITIAL_STEP });
  if (prefersReducedMotion) return createStaticController();

  root.style.setProperty("--walkthrough-ms", `${intervalMs}ms`);
  let current = INITIAL_STEP;
  let timerId: number | undefined;
  let stepStartedAt = Date.now();
  let elapsedMs = 0;
  let isStopped = false;

  const clearTimer = (): void => {
    if (timerId === undefined) return;
    window.clearTimeout(timerId);
    timerId = undefined;
  };

  const schedule = (delayMs: number): void => {
    clearTimer();
    stepStartedAt = Date.now() - (intervalMs - delayMs);
    timerId = window.setTimeout(() => {
      current = nextStep(current);
      showStep({ root, step: current });
      schedule(intervalMs);
    }, delayMs);
  };

  const pause = (): void => {
    if (isStopped || timerId === undefined) return;
    elapsedMs = Date.now() - stepStartedAt;
    clearTimer();
    root.setAttribute(PAUSED_ATTRIBUTE, "");
  };

  const resume = (): void => {
    if (isStopped || timerId !== undefined) return;
    root.removeAttribute(PAUSED_ATTRIBUTE);
    schedule(Math.max(intervalMs - elapsedMs, 0));
    elapsedMs = 0;
  };

  schedule(intervalMs);

  return {
    pause,
    resume,
    stop: () => {
      isStopped = true;
      clearTimer();
      root.removeAttribute(PAUSED_ATTRIBUTE);
    },
    isPaused: () => timerId === undefined,
  };
}

/** Wires the pause button plus automatic pausing on hover, focus and hidden tabs. */
export function bindWalkthroughControls({
  root,
  button,
  controller,
}: {
  root: HTMLElement;
  button: HTMLButtonElement;
  controller: WalkthroughController;
}): void {
  let isPausedByUser = false;
  let isHovered = false;
  let hasFocus = false;

  const sync = (): void => {
    const shouldRun = !isPausedByUser && !isHovered && !hasFocus && !document.hidden;
    if (shouldRun) controller.resume();
    else controller.pause();
  };

  button.addEventListener("click", () => {
    isPausedByUser = !isPausedByUser;
    button.textContent = isPausedByUser ? "Play" : "Pause";
    sync();
  });
  root.addEventListener("mouseenter", () => {
    isHovered = true;
    sync();
  });
  root.addEventListener("mouseleave", () => {
    isHovered = false;
    sync();
  });
  root.addEventListener("focusin", () => {
    hasFocus = true;
    sync();
  });
  root.addEventListener("focusout", (event) => {
    if (event.relatedTarget instanceof Node && root.contains(event.relatedTarget)) return;
    hasFocus = false;
    sync();
  });
  document.addEventListener("visibilitychange", sync);
}
