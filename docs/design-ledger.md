# Design Ledger — resume-builder

## Identity

- Narrative archetype: a calm working document — the app frames a resume,
  not a dashboard.
- Primary constraint: personal design system. White stock, black ink
  (`--color-text`), grey secondary text and `--color-border` hairlines.
  Cobalt (`--color-primary`) only for focus rings and the active rail
  marker. Radius 6 (controls) / 8 (entry list) / 12 (dialog). Shadows only
  on the dialog, the kebab menu and the preview sheets.
- Type: Inter for UI and titles, IBM Plex Mono for eyebrows, meta and the
  preview bar.
- Interaction tone: unhurried — 150ms fades, no springs or bounces.
- References: https://andmade.jp/ — original source of the underline-sweep
  and easing; its palette, serif and zero-radius language were superseded
  (see Corrections).

## Tokens

Live in `src/styles/tokens.css` (shared with the landing page). `src/index.css`
defines only `--ease-out`, `--app-header-height` (64px) and
`--rail-strip-height` (53px, the sticky strip under the header below 960px).

## Type roles

| Role                    | Family / size / weight / line-height                |
| ----------------------- | --------------------------------------------------- |
| Wordmark                | Inter 700 16px / 20px, -0.02em                      |
| Section eyebrow         | mono 400 12px / 16px, 0.06em, secondary             |
| Section title (h2)      | Inter 700 32px / 36px, -0.035em (26px below 600px)  |
| Body / inputs           | Inter 400 14px / 1.5                                |
| Labels                  | Inter 600 14px                                      |
| Entry row title         | Inter 600 14px / 18px                               |
| Entry row subtitle      | Inter 400 13px, secondary                           |
| Entry meta, preview bar | mono 400 12px / 16px, secondary                     |

## Component language

- **Buttons**: `btn--primary` black solid, the commit action (dialog Save,
  header Export PDF); `btn--secondary` outlined, invitations (Add);
  `btn--text` underline-sweep, dismissals; `btn--toggle` inverts on
  `aria-pressed`.
- **Header**: identity (wordmark), `SAVED LOCALLY` status and Export PDF;
  64px, sticky, hairline bottom divider.
- **Section rail** (`SectionRail`, `useActiveSection`): numbered jump list
  with a scroll-spy active marker (cobalt, `aria-current="location"`).
  Full (number + name) at >=1280px; numbers-only 64px column at 961-1279px
  (names stay in the accessible name and `title`); horizontal sticky strip
  below 960px. Click focuses the section's heading.
- **Section heading**: mono eyebrow ("01 / CONTACT"), 32px h2 headline,
  secondary description; sections separated by a hairline.
- **Entry rows**: full-width bordered list (radius 8); title + optional
  subtitle left (ellipsis), mono meta in a 128px right-aligned slot, kebab
  at the end.
- **Kebab menu**: 32px trigger; menu is a shadowed white card with Edit and
  Delete (Delete in danger red).
- **Tags** (Skills, Languages): 32px pills with an edit label and a 24px
  remove target.
- **Empty state**: text left, Add right; wraps under 480px.
- **Dialog** (`ItemDialog`): native `<dialog>`, 560px, radius 12, shadow,
  scrim; mono eyebrow, h2 title (labels the dialog), Close button; first
  field focused on open; focus returns to the opener on close; Esc and
  backdrop click cancel. Sits in `.editor-pane`, so print strips it.
- **Preview bar**: mono page count above the sheets; screen-only.
- **Fields**: white boxed inputs, radius 6, focus ring in cobalt.

## Motion

150ms `var(--ease-out)` = cubic-bezier(0.4, 0, 0.2, 1) throughout: opacity
fades to 50% on hover. Signature: `underline-sweep` — 0.7s linear keyframes
copied verbatim from andmade.jp (per-stop cubic-bezier(0.6, 0.18, 0.17,
0.72); full → exits right `translate(100%) scaleX(0)` at step-end →
re-enters left and regrows). `prefers-reduced-motion: reduce` disables the
sweep (our a11y addition; the reference lacks it).

## Adopted patterns / Excluded patterns

- Adopted: self-hosted fonts via `@fontsource` (Inter, IBM Plex Mono);
  scoped element resets (app chrome only); the wipe-through underline sweep
  on `btn--text`; numbered section rail with scroll-spy; full-width entry
  rows.
- Excluded: gradients, decorative colour (cobalt is functional only; danger
  red on Delete), dark mode.
- **Out of scope by design**: the resume document layer
  (`src/features/render/pageStyles.ts`) is a print artifact with its own
  Arial/pt system — never restyle it with app-chrome tokens.

## Corrections

(append-only; user corrections outrank everything above)

- 2026-09-11 — Pass-2 alignment (10→12px micro, tracking, easing swap)
  read as "no relevant difference" to the user. Consequence: when the user
  asks for a visible change, prefer family-level/structural deltas over
  micro-tuning; verify the delta is perceivable before shipping.
- 2026-09-11 — "We do not need the numbers like 01 02." Consequence: the
  CSS-counter section indices are removed (`.section::before` +
  `counter-reset`/`counter-increment`); sections separate by hairline
  dividers only.
- 2026-09-11 — "The serif fonts don't fit as the form label" (user reads
  Courier Prime as serif); offered: Courier as section titles, or no
  Courier at all. Chose: typewriter titles only. Consequence:
  `.section__title` = Courier Prime 700 22px/1.05, no tracking; labels,
  header meta, counts, empty states, Edit/Delete actions, and toolbar
  toggles are all Inter; `--ls-title`/`--ls-mono` tokens removed.
  Superseded later the same day by the IBM Plex Serif correction below.
- 2026-09-11 — "use ibm plex serif 300 font weight." Supersedes the
  Courier-titles correction above. Consequence: `.section__title` =
  IBM Plex Serif 300 22px/1.05; token `--font-mono` → `--font-serif`
  (`"IBM Plex Serif", Georgia, serif`); `@fontsource/courier-prime`
  uninstalled (resolves the unused-400 note above — the family is gone
  entirely); `@fontsource/ibm-plex-serif/300` self-hosted. The app's single
  non-sans voice is now a light serif, not a typewriter mono.
- 2026-09-11 — "Remove the counter from the sections" (the item-count digit
  rendered next to section titles). Consequence: `.section__count` span
  removed from `SectionEditor.tsx` and its rule deleted from `index.css`;
  `.section__head` now contains only the title. Supersedes any role for
  counts in the type table — only empty states remain in that row.
- 2026-09-11 — "Instead of showing edit delete for those items … show a
  kebab menu … delete should be red." Consequence: inline row Edit/Delete
  text buttons replaced by a kebab menu (`src/features/editor/KebabMenu.tsx`
  — trigger 24×24, opens `role="menu"` with Edit + Delete menuitems;
  closes on selection, Escape, outside pointerdown, scroll, or focus
  leaving; arrow keys cycle items). First sanctioned color exception:
  `--danger: #b00020` on the Delete menuitem only — monochrome retained
  everywhere else. Supersedes the "Item actions (Edit/Delete)" text-button
  role; `.btn--text` remains for Cancel only.
- 2026-09-11 — "Place the items in a table with light borders … the table
  should not take up the whole horizontal available space … css ellipsis."
  Supersedes the whitespace-separated rows decision (8px gaps, no
  hairlines) above. Consequence: item lists are now
  `<table class="item-table">` — hairline cell grid, `width: fit-content`
  (hugs content, never spans the 640px column); long names truncate via
  `.item__truncate` (max-width 420px, nowrap, ellipsis); row hover still
  fades the name to 50%; kebab menu unchanged.
- 2026-09-11 — "Remove the border between the text and the kebab menu."
  Consequence: the item table keeps its row separators and outer frame,
  but the shared name↔kebab vertical edge is gone
  (`.item-table .item__summary { border-right: 0 }` +
  `.item-table .item__actions { border-left: 0 }`; both scoped under
  `.item-table` because the bare classes lose the cascade to the
  `.item-table td` border rule — border-collapse needs both sides at 0).
- 2026-09-11 — "Items should have 8px padding (vertical + horizontal) and
  the default text color on the page should be #242424 (for the kebab menu
  as well)." Consequence: `.item-table td` padding is `var(--space-2)`
  uniformly (the kebab cell's zero-block-padding hack removed); the ink
  token is now `--ink: #242424` (was #000) — body default text, item
  text, section titles, kebab trigger + menu items + menu border all
  resolve to rgb(36,36,36). Supersedes the "pure black" identity claim;
  `--danger` Delete and the derived `--ink-50`/`--hairline` (label +
  divider opacity variants) are unchanged.
- 2026-09-11 — "Where we add fields (so except contact and summary) …
  add and edit new items in a popup … between the save-cancel and the
  last form item there should be some spacing." Consequence: repeatable
  sections open their draft form in a modal (`src/features/editor/
ItemDialog.tsx`, native `<dialog>` + `showModal`: top layer, focus
  trap, Esc and backdrop clicks cancel the draft); scrim
  rgb(0 0 0 / 32%), card = white stock, 1px ink border, 480px, serif
  title "Add/Edit {Section}"; `.modal__actions` sits 24px below the last
  field. Contact/Summary stay inline; `.section__draft` styles removed.
  jsdom (29) lacks showModal — shimmed in `src/setupTests.ts` so the
  dialog renders open in tests.
- 2026-09-11 — Nav bar update: "remove the black background … the title
  should be simple resume, use the serif font … the CTA should be black …
  the nav bar should have a simple bottom divider." Consequence: the
  header is an opaque paper band with a 1px hairline bottom divider;
  wordmark = lowercase "resume" in IBM Plex Serif 300 22px (was sans 500
  14px white "Resume Builder"); meta is ink-50; Export PDF is
  `btn--primary` (black solid, white text) — the
  `.app-header__export` inverted-secondary class and the
  `--paper-60-on-ink` token are removed. Supersedes the black-band
  chrome language and the andmade.jp black-band adoption.
- 2026-09-11 — Header follow-ups: "the logo should be Simple Resume …
  items should have the same spacing from the top edge as from the
  bottom edge … their vertical padding should be the same from the edges
  as the form has." Supersedes the lowercase "resume" wordmark above.
  Consequence: wordmark = "Simple Resume" (serif 300 22px, title case);
  header items are vertically centered (`align-items: center`) with
  `padding: 40px var(--space-6)` — identical block/inline padding to
  the editor pane; header height is content-derived (~111px), so the
  app frame was restructured: `#root` is a screen-only flex column
  (header auto + `.app-shell { flex: 1; min-height: 0 }`), with a
  `@media print` block reverting `#root` to block/auto for the print
  artifact. The `--header-h: 52px` token is removed.
- 2026-09-11 — "Something went wrong regarding the preview — only the
  first page renders … pls reduce the vertical padding of the header."
  The preview regression was caused by the app frame introduced above:
  the unconditional `#root` flex column + `flex: 1` shell viewport-
  bounded the ≤960px stacked layout, whose auto grid rows then squeezed
  `.preview-pane` to 1px (reproduced at 900px). Fix: the flex frame now
  applies only `@media screen and (min-width: 961px)`; below 960px
  `#root` is block flow (shell height auto, body scrolls) as before; the
  print revert stays. Header vertical padding reduced 40px → 24px
  (inline stays 48px, matching the pane); header is now ~79px.
- 2026-10-16 — Redesign adopted from the personal design system (Paper):
  numbers 01–09 kept, Inter titles, radius 6/8/12, dialog and menu
  shadows, full-width entry rows. Supersedes the zero-radius, no-shadow,
  IBM Plex Serif, hugging-table and no-numbers corrections above.

## Open decisions

- T2 (designed two-column) template direction — blocked on the SP-2
  two-column pagination spike.
- Empty-resume states (preview + export warning) — S14.
