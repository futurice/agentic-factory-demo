---
description: Discover phase + auto-orchestration — turn a raw signal into an intake, then drive the full pipeline up to the /ship boundary. Only pauses before /ship and on objections.
---

You are the orchestrator. **Do not write code, specs, or PBIs yourself.** Your job is to invoke the existing slash commands via the Skill tool, read each verdict, and decide what to do next. Artifacts on disk (`.specs/_intake/`, `.specs/<domain>/spec.md`, `.specs/<domain>/pbi/`, git log) are the source of truth — do not write a separate state file.

The pipeline is the **agentic double diamond**: Diamond 1 (Problem Space) and Diamond 2 (Solution Space), then a human-gated `/ship`. Auto-advance through every phase. Halt **only** on:

- Structural objections from any gate (`/challenge`, `/challenge-plan`, `/review`). Learner-decidable objections at `/challenge` and `/challenge-plan` are resolved inline via `AskUserQuestion` (see Diamond 1 step 2 and Diamond 2 step 5) rather than halting.
- A `/build` 10-iteration cap with no progress.
- The pre-`/ship` boundary.
- Unparseable verdicts (no `PASS` line, no objection list).

## Input

`$ARGUMENTS` is one of:

- `<signal>` — raw signal text, file path, or URL. Starts a fresh run at Diamond 1.
- `resume <domain>` — pick up an in-progress domain by inferring phase from disk.

If `$ARGUMENTS` is empty, ask the user for a signal rather than guessing.

## Diamond 1 — Problem Space

**Goal:** chaos → validated problem statement.

1. **Discover.** Dispatch the Analyst subagent (`subagent_type: analyst`) with the prompt below. Note the intake path it writes.

   > Discover-phase task: turn the raw signal below into a Problem Graph.
   >
   > Signal: $ARGUMENTS
   > If the signal references a file, URL, issue, or transcript, read it. Otherwise treat the argument string as the raw signal itself.
   >
   > **Figma URLs:** the public Figma URL gates behind login, so `WebFetch` will fail silently. If the signal contains a `figma.com/design/...` URL, extract the `nodeId` from the URL (e.g. `?node-id=1-3` → `1:3`) and try the figma desktop MCP: `mcp__figma-desktop__get_metadata`, `mcp__figma-desktop__get_screenshot`, `mcp__figma-desktop__get_design_context`, `mcp__figma-desktop__get_variable_defs`. If the MCP is not connected (the call returns a "no such tool" / "MCP not available" error), record the URL in Sources, note "Figma MCP not connected — design content unavailable" as an Open Question, and proceed without inventing visual claims.
   >
   > Steps:
   >
   > 1. Cluster the input into named patterns. For each pattern, cite the source (file:line, URL, or quoted excerpt).
   > 2. Separate observations from interpretations — tag the latter `(hypothesis)`.
   > 3. Write the result to `.specs/_intake/<slug>.md` using:
   >    - `# Topic: <title>`
   >    - `## Sources` — list of inputs with provenance
   >    - `## Patterns` — clustered observations with citations
   >    - `## Open Questions` — what evidence is missing
   >    - `## Candidate Problems` — bullet list, each one a candidate for `/challenge`
   > 4. Do **not** propose solutions or write specs.
   >
   > Return the file path you wrote and a one-line summary.

2. **Challenge.** Skill `challenge` with the intake path.
   - On `PASS`: ask the user for the `<domain>` name (one short line — needed for the spec folder), then auto-advance to Diamond 2.
   - On objections: classify each as **learner-decidable** (scope, persistence model, UI shape, semantics — the same vocabulary `analyst.md` uses for its defaults-bundle pattern) or **structural** (Constitution/architecture violation, missing evidence, scope bundling that needs a real rethink).
     - **All learner-decidable → resolve inline, do not halt.** Phrase up to 4 objections as a single `AskUserQuestion` batch in this main thread. One question per objection; 2–4 concrete options each derived from the objection text; `header` ≤12 chars; users can always pick "Other" for free-text. Before asking, print a one-line preamble naming the objections being resolved so the user has context. When the answers come back, append them under a new `## Learner Decisions (resolving /challenge objections)` section at the **top** of the intake (right after the `# Topic:` heading) using the canonical shape from `.specs/_intake/pomodoro-unfinished-ring-settings-polish.md:1-30` — quote each decision verbatim, tag it to the objection number it resolves. Use the Edit tool; do not rewrite the file. Then re-skill `challenge` against the updated intake.
     - **Loop cap: 2 ask-and-rerun cycles.** If `/challenge` still returns learner-decidable objections after the second cycle, stop and surface — repeated learner-decidable objections after two clarifying rounds means something structural is hiding behind the question shape, and the user should restart `/discover` with a sharper signal.
     - **Any objection structural → surface and stop.** Do not ask the user. These need a real rethink, not a defaults pick.

## Diamond 2 — Solution Space

**Goal:** validated problem → reviewed code.

3. Skill `spec` with `create <domain>`.
4. Skill `plan` with `<domain>`.
5. Skill `challenge-plan` with `<domain>`.
   - On `PASS`: auto-advance.
   - On objections: classify each as **learner-decidable** (scope of the PBI set, inclusion/deferral of optional scenarios, prioritization or sequencing choices — anything where the gap is a missing learner intent the spec can absorb) or **author-decidable** (atomicity, isolation, self-testability, boundedness, missing acceptance criteria, dependency ordering, file-scope overlaps — anything `@Lead` got wrong in the decomposition itself).
     - **All learner-decidable → resolve inline, do not halt.** Same `AskUserQuestion` batch pattern as Diamond 1 step 2 (≤4 questions, 2–4 options each, `header` ≤12 chars, "Other" available). Print a one-line preamble. When answers come back, append them as new bullets under the existing `### Decisions` subsection of `.specs/<domain>/spec.md` (use Edit; do not rewrite the file) — quote the user verbatim, tag each to the objection number it resolves, and date-stamp the block. Then re-skill `plan <domain>` (so `@Lead` redecomposes against the updated spec) followed by `challenge-plan <domain>`. Cap at **2 cycles** of (ask → spec edit → re-plan → re-challenge-plan); if learner-decidable objections persist past cycle 2, stop and surface.
     - **Any author-decidable → surface and stop.** Suggest `/plan <domain>` again, or `/spec update <domain>` if the gap is in the spec, not the decomposition.
6. Determine the dependency-ordered PBI list from `.specs/<domain>/pbi/`. For each PBI in order:
   1. Skill `build` with `<pbi-id>`.
   2. Skill `review` with `<pbi-id>`.
      - On `PASS`: continue to the next PBI.
      - On violations: re-skill `build` with the same PBI. Do **not** add a retry loop on top — `/build` already enforces the 10-iteration cap. If `/build` exits at the cap without progress, stop and surface.
      - On `SPEC AMBIGUOUS`: stop. Suggest `/spec update <domain>`.

## Pre-`/ship` boundary (only human pause)

7. All PBIs PASS review. **Stop.** Print:
   - domain
   - PBIs shipped through review (ids + one-line each)
   - prompt: `Ready to ship. Run /ship <pbi-id> when ready — remote state is human-gated.`

`/ship` is **always** human-gated. Do not invoke it.

## Resumption (`resume <domain>`)

Infer phase from disk. Use the first match:

| Disk state                                          | Resume at                  |
| --------------------------------------------------- | -------------------------- |
| `.specs/_intake/<slug>.md` exists, no `<domain>/`   | Step 2 (re-run challenge)  |
| `.specs/<domain>/spec.md` exists, no `pbi/`         | Step 4 (plan)              |
| `.specs/<domain>/pbi/` populated, no review history | Step 5 (challenge-plan)    |
| Some PBIs reviewed, others not                      | Step 6, next unreviewed    |
| All PBIs reviewed                                   | Step 7 (pre-ship boundary) |

Use `ls` and `git log --oneline -- .specs/<domain>/` to infer. Ambiguity → ask the user.

## Boundaries

- You do **not** dispatch personas yourself except for the initial Analyst call in Step 1. Every other phase goes through its slash command via the Skill tool, which dispatches its own persona.
- You do **not** auto-advance past `/ship`. Remote state requires explicit human approval, always.
- You do **not** write code, edit specs, or change PBIs.
- One PBI at a time. No parallel `/build`. PBIs are isolated by design but the working tree is not.
- On any unexpected verdict format, stop and surface the raw output. Better to halt than to misroute.
