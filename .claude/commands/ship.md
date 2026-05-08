---
description: Acceptance gate — deterministic preflight + strategic-fit checklist, then open the PR. The only command that touches remote state.
---

This is the human Acceptance Gate, run in the main thread (not delegated to a subagent — the human approval step is interactive). You facilitate; the human is the decision-maker. You only prepare the package, run the deterministic preflight, and execute their approval.

The goal is for a learner to clear `/ship` self-service. The preflight catches mechanical violations the Critic might have missed at `/review`; the strategic-fit checklist remains pull-based and can be answered by the learner alone in the common case.

**Input:** $ARGUMENTS — a PBI id whose `/review` returned `PASS`.

## Steps

### 1. Verify preconditions

- PBI exists and its acceptance items are checked.
- Latest `/review` for this PBI returned `PASS` (ask the user to confirm if not visible in transcript).
- Working tree is clean and on a feature branch (not `main`).

### 2. Run deterministic preflight (Constitutional checks against the diff)

Compute the diff against `main`: `git diff --name-only main...HEAD`. Then run each check below and record green / red.

- **Diff scope** — every changed path falls under one of:
  - `src/app/widgets/<name>/**` (the widget being shipped)
  - `.specs/<domain>/**` (its spec/PBI)
  - Conditionally allowed (call out, do not fail): `src/app/layout.tsx`, `src/app/page.tsx`, `src/lib/**` — these change the platform itself and warrant a sentence of justification in the PR body.
  - Anything else → red.
- **Cross-widget imports** — for each `.ts(x)` file under `src/app/widgets/<a>/`, check that no import path resolves into a different `src/app/widgets/<b>/`. Use `grep -rn "@/app/widgets/" src/app/widgets/<a>/` and confirm every match's target equals `<a>`.
- **`src/lib/` growth** — if any file under `src/lib/` was added or modified, mark yellow and require a one-line justification (Constitution: only universal utilities allowed there).
- **No layered-directory introduction** — `git diff --name-only main...HEAD --diff-filter=A` must not introduce top-level dirs under `src/` other than the existing `app/` and `lib/`.
- **No gate-bypass markers in diff** — grep the diff for `--no-verify`, `@ts-ignore`, `it.skip`, `describe.skip`, `xit(`, `xdescribe(`. Any hit is red.
- **Same-commit-rule check (Constitution §27).** For each commit on the branch since `main`, if the commit touches `src/app/widgets/<name>/` for any widget `<name>` whose `.specs/<name>/spec.md` was modified on the same branch but in a _different_ commit, mark red and surface the offending pair `(<code-commit-sha>, <spec-commit-sha>)`. Concretely: walk `git log --format="%H" main..HEAD` and `git show --name-only <sha>` per commit; flag cases where a code path under `src/app/widgets/<name>/` and the matching `.specs/<name>/spec.md` are split across commits. Catch-up commits (a single "docs(specs): land …" commit covering multiple prior code commits) are the canonical failure mode this check exists to prevent.

Print the results as a green/red checklist. If any check is red, stop and ask the learner whether to fix or to proceed (rare cases where a red is intentional — e.g. an explicit Constitution amendment).

### 3. Prepare the acceptance package

Print:

- Branch name and commits ahead of `main`.
- Files changed (footprint, not line-by-line).
- Spec sections fulfilled.
- Strategic-fit checklist for the human:
  - [ ] Does this solve the problem the spec claims to solve?
  - [ ] Footprint is what we expected — no surprise files? (Already partially answered by preflight.)
  - [ ] Is this the right time to ship (release windows, freezes)?
  - [ ] Provenance: builder iterations, critic verdict, spec version recorded?

### 4. Stop and ask the human (the learner) to approve

Do not proceed without an explicit "ship it" / "yes" / equivalent.

### 5. On approval

- Push the branch.
- Open a PR with title referencing the PBI id and a body containing: spec link, PBI link, critic verdict summary, preflight results, strategic-fit checklist outcome.
- Print the PR URL.
- **Nudge `/retro`.** After the PR URL, print: `Pipeline trail is fresh — consider running '/retro <domain>' to distill any learnings into proposed amendments.` Do not auto-invoke; this is pull-based.

### 6. On rejection

Capture the human's reasoning into the PBI file under a `## Rejected` section with timestamp, then stop. Do not push.

## Boundaries

- Never push without explicit human approval in the same session.
- Never force-push or modify `main` directly.
- Never skip CI hooks or signing.
- Preflight is informational + blocking on red. It never auto-fixes; if a check fails, surface it and let the learner decide.
