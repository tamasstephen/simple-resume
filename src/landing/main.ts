import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "../styles/tokens.css";
import "./landing.css";
import { bindWalkthroughControls, startWalkthrough } from "./walkthrough";

const walkthroughRoot = document.querySelector<HTMLElement>("[data-walkthrough]");
const walkthroughButton = document.querySelector<HTMLButtonElement>("[data-walkthrough-toggle]");

if (walkthroughRoot) {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const controller = startWalkthrough({
    root: walkthroughRoot,
    intervalMs: 4000,
    prefersReducedMotion,
  });
  if (walkthroughButton && !prefersReducedMotion) {
    bindWalkthroughControls({ root: walkthroughRoot, button: walkthroughButton, controller });
  }
}
