---
description: Agent Optimization Loop — distill a completed (or stalled) pipeline into proposed amendments to the Constitution, AGENTS.md, personas, and templates. Produces diffs, does not apply them.
---

This is the counterpart to the Ralph Loop. The Ralph Loop optimizes the _product_ (code) by iterating against quality gates; `/retro` optimizes the _producer_ (Constitution, AGENTS.md, personas, templates) by extracting learnings from a completed or stalled pipeline.

Dispatch this task to the `analyst` subagent (`subagent_type: analyst`) in a fresh subagent — Builder/Lead reasoning must not leak in.

**Input:** $ARGUMENTS — a domain name (e.g. `pomodoro`).

If empty, ask the user which domain to retro on rather than guessing. List candidate domains under `.specs/` to help.

## When to run

- After `/ship` opens a PR and the work is fresh in mind.
- After `/build` hits the 10-iteration cap on a PBI without converging.
- When a Constitution rule has been firing false-positives or being repeatedly objected to.

Skip retros on uneventful runs — fabricated findings are worse than silence.

## Orchestration steps performed in the main thread before dispatch

1. Resolve the domain. If `.specs/<domain>/` does not exist, stop and surface.
2. Capture the pipeline trail to pass into the subagent prompt:
   - `.specs/_intake/<slug>.md` if present
   - `.specs/<domain>/spec.md`
   - Every file under `.specs/<domain>/pbi/`
   - `.specs/<domain>/retro.md` if a prior retro exists (so amendments don't repeat)
   - `git log --oneline -- .specs/<domain>/ src/app/widgets/<widget>/` for chronology and `/build` iteration counts (count commits per PBI id)

## Subagent prompt to send

> Agent Optimization Loop retro (`/retro` mode).
>
> Domain: $ARGUMENTS
>
> Pipeline trail:
> <paste intake, spec, all PBIs, prior retro, git log output>
>
> Distill this trail into a retro at `.specs/<domain>/retro.md`. Follow the structure in your guidelines: Pipeline summary, Kept, Friction, Proposed amendments.
>
> **Critical:** propose diffs only, do not apply them. Targets allowed: `.specs/CONSTITUTION.md`, `AGENTS.md`, `.claude/agents/<name>.md`, `.claude/commands/<name>.md`, `.specs/_templates/<name>.md`. Anything else is out of scope.
>
> Cite evidence for every claim — line numbers, commit hashes, iteration counts. If nothing surprised anyone, write "No friction observed; no amendments proposed." and stop.

## After the subagent returns

1. Read `.specs/<domain>/retro.md` and **surface each proposed amendment as a scannable card** in the main thread reply. The goal is to let the user evaluate the amendments without having to context-switch to the IDE. Use this shape per amendment:

   ```
   ### N — <target file path> · <one-line headline>

   Rationale: <one sentence on which Friction item this resolves>

   Diff:
   <the diff block exactly as the analyst wrote it, fenced as a code block>
   ```

   - One card per amendment, in the order the analyst proposed them.
   - Preserve the diff body verbatim. Do not paraphrase or truncate.
   - If an amendment is the headline (the one most directly tied to the production signal or recurring friction), mark it with a `⭐ headline` tag next to the file path.
   - End the surfacing with a one-line invitation: *"To apply, say e.g. 'apply #N' or 'apply #N sharpened to <your edit>'. I'll edit the files; you commit when ready."*

2. Suggest the next step:
   - If amendments are proposed → the invitation in step 1 already covers this. Also remind the user the retro is on disk at `.specs/<domain>/retro.md` for later reference.
   - If no amendments → "No retro action needed. Ready for the next widget — `/discover <signal>`."

3. **Do not auto-apply.** Wait for the user to name which amendments to apply and how (verbatim or with their edits). When they do, edit the target files directly (Edit/Write) and stop short of committing — the user owns the commit so the message references the retro consciously.

## Boundaries

- This command never edits the Constitution, AGENTS.md, personas, or templates. Diff application is human-gated, same posture as `/triage` toward spec amendments.
- Does not run code, tests, or builds.
- Does not push or modify remote state.
- Cross-domain retros (aggregating learnings across multiple widgets) are out of scope — this command operates on one domain at a time.
