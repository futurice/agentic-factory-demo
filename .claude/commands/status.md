---
description: Print the pipeline state for one domain — what artifacts exist, which PBIs are built, reviewed, shipped. Pure read-only diagnostic.
---

Read-only, runs in the main thread. Used by learners to answer "where am I?" without asking the instructor. No subagent dispatch.

**Input:** $ARGUMENTS — a domain name (e.g. `pomodoro`). If empty, list all domains under `.specs/` and stop.

## Steps

1. **Locate the domain.** Check `.specs/<domain>/`. If missing, look for a matching intake at `.specs/_intake/<domain>*.md` and report "intake exists, no spec yet — next step is `/challenge` then `/spec create <domain>`." Stop.

2. **Read the artifact graph.** For the domain:
   - Intake: `.specs/_intake/<slug>.md` — exists / missing.
   - Spec: `.specs/<domain>/spec.md` — exists / missing. If exists, list section headers and the date of the most recent amendment line.
   - PBIs: enumerate `.specs/<domain>/pbi/*.md`.

3. **For each PBI, infer state from git history and file content.**
   - **Built?** `git log --oneline -- src/app/widgets/<widget>/` (or whatever the PBI's "Files in scope" section names) — does any commit message reference the PBI id?
   - **Reviewed PASS?** Look in the conversation transcript or the PBI file itself for a `## Review` section / verdict line. If neither exists, mark "review status unknown — re-run `/review <pbi-id>` to confirm."
   - **Shipped?** Has a PR been opened that mentions the PBI id? (Best-effort: `gh pr list --search "<pbi-id>"` if `gh` is available; otherwise mark unknown.)
   - **Rejected?** Look for a `## Rejected` section in the PBI file.

4. **Print the status table.** Format:

   ```
   Domain: <name>
   Intake:    <path or "missing">
   Spec:      <path or "missing"> (last amended: <date> or "no amendments")
   PBIs:
     <id> — built: ✓/✗  reviewed: PASS / violations / unknown  shipped: ✓/✗
     ...
   Next suggested step: <one line>
   ```

5. **Suggest the next step** based on the lowest-numbered PBI that isn't shipped:
   - No spec → `/challenge <intake>` then `/spec create <domain>`
   - Spec but no PBIs → `/plan <domain>`
   - PBIs but none built → `/build <first-pbi-id>`
   - Built but not reviewed → `/review <pbi-id>`
   - Reviewed PASS but not shipped → `/ship <pbi-id>`
   - All PBIs shipped → "Domain complete. Use `/triage` to feed back any production signals."

## Boundaries

- Pure read. Never edits any artifact. Never runs builds or tests. Never pushes.
- Best-effort: if a state cannot be reliably inferred from the filesystem and git history, mark it `unknown` rather than guessing.
- Does not dispatch to subagents.
