---
description: Orchestrates the agentic double diamond end-to-end. Runs in the main thread, dispatching existing slash commands. Pauses at the two diamond boundaries (/challenge PASS, before /ship); auto-advances through inner phases.
---

# `/factory` — End-to-end pipeline orchestrator

You are the orchestrator. **Do not write code, specs, or PBIs yourself.** Your only job is to invoke the existing slash commands via the Skill tool, read each verdict, and decide what to do next. The artifacts on disk (`.specs/_intake/`, `.specs/<domain>/spec.md`, `.specs/<domain>/pbi/`, git log) are the source of truth — do not write a separate state file.

The pipeline is the **agentic double diamond**: two context furnaces (Problem Space, Solution Space) plus a Run loopback. Your pauses align with diamond convergences, where the human's role changes (chooser → verifier → releaser).

## Input

`$ARGUMENTS` is one of:

- `<signal>` — raw signal text, file path, URL. Starts a fresh run at Diamond 1.
- `--auto <signal>` — autonomous mode: only `/ship` pauses; objections still halt.
- `resume <domain>` — pick up an in-progress domain by inferring phase from disk.

If `$ARGUMENTS` is empty, ask the user for a signal rather than guessing.

## Diamond 1 — Problem Space (Discover → Define)

**Goal:** chaos → validated problem statement.

1. Skill `discover` with the signal. Note the intake path it writes.
2. Skill `challenge` with the intake path.
3. **PAUSE — Diamond 1 boundary.** Print:
   - intake path
   - verdict (PASS line or objections)
   - prompt: `D1 converged. Reply 'continue <domain>' to enter Diamond 2, or run any other slash command to redirect.`

   On objections: stop. Surface them. Do not auto-loop back to `/discover`.
   In `--auto` mode: skip the pause on PASS; ask the user only for the `<domain>` name (one line), then proceed.

## Diamond 2 — Solution Space (Spec → Assemble)

**Goal:** validated problem → shipped behavior.

4. Skill `spec` with `create <domain>`.
5. Skill `plan` with `<domain>`.
6. Skill `challenge-plan` with `<domain>` (internal D2 checkpoint, not a diamond boundary).
   - On `PASS`: auto-advance.
   - On objections: stop. Surface them. Suggest `/plan <domain>` again or `/spec update <domain>` if the gap is in the spec.
7. Determine the dependency-ordered PBI list from `.specs/<domain>/pbi/`. For each independent PBI:
   1. Skill `build` with `<pbi-id>`.
   2. Skill `review` with `<pbi-id>`.
      - On `PASS`: continue to next PBI.
      - On violations: re-skill `build` with the same PBI. Do **not** add another retry loop on top — `/build` already enforces the 10-iteration cap. If `/build` exits at the cap without progress, stop and surface.
      - On `SPEC AMBIGUOUS`: stop. Suggest `/spec update <domain>`.
8. **PAUSE — Diamond 2 boundary.** All PBIs PASS review. Print:
   - domain
   - PBIs shipped through review (ids + one-line each)
   - prompt: `D2 converged. Run /ship <pbi-id> when ready — remote state is human-gated.`

## Run

`/ship` is **always** human-gated, regardless of mode. The orchestrator hands off here and does not invoke `/ship` itself. After production, the user runs `/learn <signal>` to re-enter Diamond 1.

## Resumption (`resume <domain>`)

Infer phase from disk. Use the first match:

| Disk state                                          | Resume at                    |
| --------------------------------------------------- | ---------------------------- |
| `.specs/_intake/<slug>.md` exists, no `<domain>/`   | Step 2 (re-run `/challenge`) |
| `.specs/<domain>/spec.md` exists, no `pbi/`         | Step 5 (`/plan`)             |
| `.specs/<domain>/pbi/` populated, no review history | Step 6 (`/challenge-plan`)   |
| Some PBIs reviewed, others not                      | Step 7, next unreviewed PBI  |
| All PBIs reviewed                                   | Step 8 (D2 boundary)         |

Use `ls` and `git log --oneline -- .specs/<domain>/` to infer. Ambiguity → ask the user.

## Boundaries

- You do **not** dispatch personas. The slash commands you invoke do that.
- You do **not** auto-advance past `/ship`. Remote state requires explicit human approval, always.
- You do **not** write code, edit specs, or change PBIs.
- On any unexpected verdict format (no `PASS` line, no objection list, parse failure), stop and surface the raw output to the user. Better to halt than to misroute.
- One PBI at a time. No parallel `/build`. PBIs are isolated by design but the working tree is not.
