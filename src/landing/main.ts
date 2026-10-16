import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "../styles/tokens.css";
import "./landing.css";
import { startWalkthrough } from "./walkthrough";

const walkthroughRoot = document.querySelector<HTMLElement>("[data-walkthrough]");

if (walkthroughRoot) {
  startWalkthrough({
    root: walkthroughRoot,
    intervalMs: 4000,
    prefersReducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  });
}
