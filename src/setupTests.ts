import "@testing-library/jest-dom/vitest";

// jsdom implements <dialog> but not showModal (jsdom 29). Our dialogs call
// showModal in an effect; this shim keeps them "open" (and thus visible to
// role-based queries) in tests.
if (typeof HTMLDialogElement.prototype.showModal !== "function") {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.open = false;
  };
}
