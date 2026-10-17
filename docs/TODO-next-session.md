# Next session — todos

Logged 2026-10-17 from manual testing of the restyled editor at `/create/` (branch `feat/landing-create-route`).

1. ~~**Section rail scroll position.**~~ Done 2026-10-17 (d4d9713): scroll-spy by reading line plus desktop bottom room.
2. ~~**Clear button.**~~ Done 2026-10-17 (10fe687): header Clear clears the whole resume after a confirmation.
3. ~~**Form validation.**~~ Done 2026-10-17 (349a25e, 0531f4b, 45d6d69): email, phone, en-US month/year dates (03/2020, Mar 2020) with start ≤ end, web addresses; a role needs a start date. Dialog summary + inline errors; saved entries flagged in rows and on the rail.
   - Open: the rail badge is hidden in the collapsed rail (961–1279px) and the phone strip, where only the row error shows.

## Future improvements

1. **Export / import (JSON backup).** Save the whole resume to a `.json` file and load it back, for backups, moving between browsers and devices, and recovering after site data is cleared.
   - Backlog story **S13** in `docs/STORIES.md`. The redesign's header "Backup" button (Paper, "Editor — Desktop") is the entry point.
   - Imports must go through the existing Zod schema and `migrateStored`. Rich text is already sanitised at render, but an imported file is untrusted input.
2. **Template selector.** Let users switch the resume template.
   - Backlog story **S11**. The data model (`templateSchema = ["ats", "designed"]`) and the reducer's `SELECT_TEMPLATE` already exist, but nothing in the UI uses them yet.
   - It is blocked on the second template: **S10** (two-column "designed" template), which depends on the **SP-2** two-column pagination spike. Today both options render the ATS template.
   - The redesign shows the picker at the bottom of the section rail.
