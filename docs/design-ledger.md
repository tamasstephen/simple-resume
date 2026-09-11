# Design Ledger — resume-builder

## Identity

- Narrative archetype: print catalog / editorial index — the app frames a
  working document, not a dashboard.
- Primary constraint: ink-on-paper monochrome. Pure black on warm paper
  `#f6f6f4`, opacity variants for hierarchy, zero color. `border-radius: 0`
  everywhere; no shadows except a 1px hairline ring on preview page sheets.
- Tactile metaphor: a printed catalog on warm stock — small, precise type;
  hairline rules; numbered sections.
- Interaction tone: noble and unhurried — 150ms fades to 50% opacity and
  underline sweeps, no springs or bounces.
- References: https://andmade.jp/ — adopted its paper/ink palette, small
  precise type scale (12px body, 20px titles at 1.05), Courier Prime mono
  as the editorial accent, zero radius, underline-sweep hovers, black band
  header. Akzidenz-Grotesk (commercial) substituted with Inter.

## Tokens

Live in `src/index.css` `:root`:

```css
--paper: #f6f6f4;            --ink: #000;
--ink-50: rgb(0 0 0 / 50%);  --hairline: rgb(0 0 0 / 15%);
--white: #fff;               --paper-60-on-ink: rgb(255 255 255 / 60%);
--font-sans: "Inter", system-ui, sans-serif;          /* self-hosted @fontsource 400/500/600 */
--font-mono: "Courier Prime", ui-monospace, monospace; /* self-hosted @fontsource 400/700 */
--fs-micro: 10px; --fs-body: 12px; --fs-lead: 14px; --fs-title: 20px;
--lh-tight: 1.05; --lh-body: 1.5;
--space-1..6: 4/8/16/24/32/48px;  --header-h: 52px;
color-scheme: light;  /* light-only by design */
```

## Type roles

| Role | Family / size / weight / line-height |
|---|---|
| Wordmark | sans 600 13px / 1, white |
| Header meta | mono 400 10px / 1, white 60% |
| Section index + counts + empty states | mono 400 10px / 1.05, ink-50 |
| Form labels | mono 400 10px, ink-50, uppercase, +0.08em tracking |
| Section titles | sans 500 20px / 1.05, ink |
| Item summaries / inputs | sans 400 12px / 1.5 |
| Boxed buttons | sans 500 12px / 1.2 |
| Item actions (Edit/Delete) + toolbar toggles | mono 400 11px / 1 |

## Component language

- **Buttons** (commit strength ladder): `btn--primary` black solid, white
  text — the only solid fill, reserved for Save/commit (hover 50%, disabled
  pinned 50% + default cursor). `btn--secondary` 1px ink border, transparent
  — invitations (Add). `btn--text` borderless underline-sweep — dismissals
  and micro-actions (Cancel/Edit/Delete). `btn--toggle` mono, inverts to
  black box when `aria-pressed="true"` (ink density = state). On the black
  band, secondary inverts to white (`.app-header__export`).
- **Fields**: mono uppercase micro labels above white boxed inputs with 1px
  hairline borders; focus-visible = 1px ink outline, 2px offset; checkboxes
  render inline-row with `accent-color: var(--ink)`.
- **Item lists**: hairline dividers between rows; row hover fades the
  summary span to 50% (buttons keep their own language — never compound
  opacity); "— none yet" mono empty state.
- **Chrome**: sticky 52px black band (wordmark left; mono meta + inverted
  secondary action right); sections numbered 01–09 via CSS counter with
  hairline top dividers; editor content column max 640px.

## Motion

150ms ease throughout: opacity fades to 50% on hover; underline sweep =
flat 1px `background-image` underline growing `background-size` 0→100%.

## Adopted patterns / Excluded patterns

- Adopted: CSS-counter section indices; self-hosted fonts via `@fontsource`
  (zero external font requests); scoped element resets (app chrome only).
- Excluded: gradients, glassmorphism, rounded corners, shadows (except the
  preview page hairline ring), decorative color, dark mode.
- **Out of scope by design**: the resume document layer
  (`src/features/render/pageStyles.ts`) is a print artifact with its own
  Arial/pt system — never restyle it with app-chrome tokens.

## Corrections

(append-only; user corrections outrank everything above)

- none yet

## Open decisions

- T2 (designed two-column) template direction — blocked on the SP-2
  two-column pagination spike.
- Empty-resume states (preview + export warning) — S14.
