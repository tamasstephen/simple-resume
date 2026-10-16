export type StepIndex = 0 | 1 | 2;

const ACTIVE_CLASS = "step--active";
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

export function startWalkthrough({
  root,
  intervalMs,
  prefersReducedMotion,
}: {
  root: HTMLElement;
  intervalMs: number;
  prefersReducedMotion: boolean;
}): () => void {
  showStep({ root, step: INITIAL_STEP });
  if (prefersReducedMotion) return () => {};

  root.style.setProperty("--walkthrough-ms", `${intervalMs}ms`);
  let current = INITIAL_STEP;
  const timerId = window.setInterval(() => {
    current = nextStep(current);
    showStep({ root, step: current });
  }, intervalMs);

  return () => window.clearInterval(timerId);
}
