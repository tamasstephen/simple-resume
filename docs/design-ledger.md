# Design Ledger — resume-builder

## Identity

- Narrative archetype: print catalog / editorial index — the app frames a
  working document, not a dashboard.
- Primary constraint: ink-on-paper monochrome. Soft black `#242424` on warm
  paper `#f6f6f4`, opacity variants for hierarchy, zero color (sole
  exception: `--danger` red on Delete). `border-radius: 0`
  everywhere; no shadows except a 1px hairline ring on preview page sheets.
- Tactile metaphor: a printed catalog on warm stock — small, precise type;
  hairline rules; light serif titles (IBM Plex Serif 300) over an Inter
  body.
- Interaction tone: noble and unhurried — 150ms fades to 50% opacity and
  underline sweeps, no springs or bounces.
- References: https://andmade.jp/ — adopted its paper/ink palette, small
  precise type scale (12px body, 22px titles at 1.05), Courier Prime mono
  as the editorial accent, zero radius, underline-sweep hovers, black band
  header (band since removed — see Corrections). Akzidenz-Grotesk
  (commercial) substituted with Inter.
  Pass 2 (2026-09-11, computed-style extraction): titles 22px, wordmark
  14px/1.5 w500, item rows whitespace-separated (8px gap, no hairlines —
  site uses zero rules in lists), 0.7s wipe-through underline sweep copied
  verbatim from the site's keyframes, 150ms cubic-bezier(0.4,0,0.2,1)
  easing. Same-day user corrections reshaped the type system — see
  Corrections; current state: IBM Plex Serif 300 lives ONLY in section
  titles (the single non-sans voice), everything else is Inter.

## Tokens

Live in `src/styles/tokens.css` (shared with the landing page). `src/index.css`
adds only `--color-focus` (20% primary, the input focus halo) and `--ease-out`.

## Type roles

| Role                           | Family / size / weight / line-height    |
| ------------------------------ | --------------------------------------- |
| Wordmark ("Simple Resume")     | serif 300 22px / 1.05, ink              |
| Header meta                    | sans 400 12px / 1, ink-50               |
| Empty states                   | sans 400 12px / 1.05, ink-50            |
| Form labels                    | sans 400 12px, ink-50, sentence-case    |
| Section titles                 | serif 300 22px / 1.05, ink              |
| Item summaries / inputs        | sans 400 12px / 1.5                     |
| Boxed buttons                  | sans 500 12px / 1.2                     |
| Toolbar toggles                | sans 400 12px / 1                       |
| Kebab menu items (Edit/Delete) | sans 400 12px / 1.5; Delete in --danger |

## Component language

- **Buttons** (commit strength ladder): `btn--primary` black solid, white
  text — the only solid fill, reserved for Save/commit actions (dialog
  Save + header Export PDF; hover 50%, disabled pinned 50% + default
  cursor). `btn--secondary` 1px ink border, transparent — invitations
  (Add). `btn--text` borderless underline-sweep — dismissals and
  micro-actions (Cancel). `btn--toggle` inverts to a black box when
  `aria-pressed="true"` (ink density = state).
- **Fields**: sans sentence-case micro labels (12px, ink-50) above white
  boxed inputs with 1px hairline borders; focus-visible = 1px ink
  outline, 2px offset; checkboxes render inline-row with
  `accent-color: var(--ink)`.
- **Item table**: rows in a bordered grid (`<table>`, hairline row
  separators + outer frame, no vertical rule between name and kebab;
  `width: fit-content` — never the full column width); names
  truncate at 420px with an ellipsis; row hover fades the name to 50%
  (the kebab keeps its own language — never compound opacity); "— none
  yet" sans empty state. Each row carries a kebab menu (KebabMenu.tsx):
  borderless 24×24 ink trigger (SVG dots, hover fades 50%); menu = white
  stock, 1px ink border, zero radius, no shadow, min-width 128px; items
  are sans 12px/1.5 with 150ms fade hover; Delete in `--danger` red.
- **Text buttons** (`btn--text`): permanently carry a 1px currentColor
  underline (::after, bottom -0.15em); on hover it plays the site's
  signature wipe-through (line exits right, re-enters left) while the label
  fades to 50%. Used for Cancel in the draft form (row Edit/Delete moved
  into the kebab menu 2026-09-11).
- **Add/edit dialog** (`ItemDialog`): native `<dialog>` popup for the
  repeatable sections — white card, 1px ink border, 480px, zero radius,
  ink scrim 32%; serif 300 title "Add/Edit {Section}"; first field
  autofocuses; 24px between the last field and the Save/Cancel row
  (Save = primary — disabled until valid, Cancel = text button); Esc and
  backdrop clicks cancel the draft, clicks on the card's own padding do
  not. Sits in `.editor-pane` DOM-wise, so print strips it.
- **Chrome**: opaque paper band with a 1px hairline bottom divider,
  auto height (~79px) — items vertically centered with `padding: 24px
var(--space-6)` (inline padding mirrors the editor pane): serif 300
  "Simple Resume" wordmark left; sans ink-50 meta + primary (black
  solid) Export PDF right. Frame: `#root` = flex column ONLY
  `@media screen and (min-width: 961px)`, shell `flex: 1` (no viewport-
  height math; ≤960px stacked mode keeps block flow + body scroll).
  Hairline top dividers between sections; editor content column max
  640px.

## Motion

150ms `var(--ease-out)` = cubic-bezier(0.4, 0, 0.2, 1) throughout: opacity
fades to 50% on hover. Signature: `underline-sweep` — 0.7s linear keyframes
copied verbatim from andmade.jp (per-stop cubic-bezier(0.6, 0.18, 0.17,
0.72); full → exits right `translate(100%) scaleX(0)` at step-end →
re-enters left and regrows). `prefers-reduced-motion: reduce` disables the
sweep (our a11y addition; the reference lacks it).

## Adopted patterns / Excluded patterns

- Adopted: self-hosted fonts via `@fontsource` (zero external font
  requests); scoped element resets (app chrome only); IBM Plex Serif 300 as
  the single non-sans voice, reserved for section titles (user-directed);
  the verbatim wipe-through sweep; whitespace-separated item rows.
- Excluded: gradients, glassmorphism, rounded corners, shadows (except the
  preview page hairline ring), decorative color, dark mode.
  Reference pass 2 exclusions (user-confirmed 2026-09-11): the site's
  single blue accent `#0022ff` (pills + statement text) — strict
  monochrome retained; the site's rounded 30px pill chips; the 500ms
  wordmark fade and scroll-driven fixed layers (marketing-site patterns).
  Corrected out same day (see Corrections): CSS-counter 01–09 section
  indices; Courier in labels/meta/actions; tracking tokens.
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
