# Next session — todos

Logged 2026-10-17 from manual testing of the restyled editor at `/create/` (branch `feat/landing-create-route`).

1. ~~**Section rail scroll position.**~~ Done 2026-10-17 (d4d9713): scroll-spy by reading line plus desktop bottom room.
2. ~~**Clear button.**~~ Done 2026-10-17 (10fe687): header Clear clears the whole resume after a confirmation.
3. **Form validation is missing.** Invalid values are accepted. For example, the email field accepts `yep@`, and phone numbers aren't checked.
   - This is the planned **Wave 3** (validation + error states). The designs are in Paper: page "Resume Builder Redesign", artboard "Editor — Edit dialog, validation", and the "Form states" and "Feedback & messages" sections of the design system.
   - It covers email format, phone characters, the YYYY-MM date format with month 01–12, start date ≤ end date, and URLs. Errors show inline under the field (red border, icon, message on how to fix it), as a summary alert in the dialog, and as an error badge on the rail.

## Future improvements

1. **Export / import (JSON backup).** Save the whole resume to a `.json` file and load it back, for backups, moving between browsers and devices, and recovering after site data is cleared.
   - Backlog story **S13** in `docs/STORIES.md`. The redesign's header "Backup" button (Paper, "Editor — Desktop") is the entry point.
   - Imports must go through the existing Zod schema and `migrateStored`. Rich text is already sanitised at render, but an imported file is untrusted input.
2. **Template selector.** Let users switch the resume template.
   - Backlog story **S11**. The data model (`templateSchema = ["ats", "designed"]`) and the reducer's `SELECT_TEMPLATE` already exist, but nothing in the UI uses them yet.
   - It is blocked on the second template: **S10** (two-column "designed" template), which depends on the **SP-2** two-column pagination spike. Today both options render the ATS template.
   - The redesign shows the picker at the bottom of the section rail.
