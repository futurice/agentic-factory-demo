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

1. Read `.specs/<domain>/retro.md` and **surface the proposed amendments as a scannable card** in the main thread reply. The goal is to let the user evaluate the amendments without having to context-switch to the IDE. The card has four parts — header, amendment table, per-amendment unified diffs, producer-impact footer — followed by the apply invitation. The shape parallels `/triage`'s spec-amendment card so users can scan both with the same eyes.

   ### Card template

   `````
   ## 🔄 Retro distilled: `<domain>` — <N> amendment(s) proposed

   > **Pipeline** — <one-line summary: PBI count, /build cap hits, /review rejection count>
   > **Retro on disk** — `.specs/<domain>/retro.md`
   > **Headline finding** — <one-sentence summary of the friction most worth fixing>

   ---

   ### Proposed amendments

   | # | Target | Type | Headline |
   |---|--------|------|----------|
   | 1 | `<path>` | <➕ add / ✏️ edit / ♻️ replace / ➖ remove> | <one-line headline> <⭐ if headline> |
   | 2 | … | … | … |

   ---

   ### ① `<target file path>` <⭐ if headline>

   **Resolves** — <one sentence on which Friction item this addresses, with citation: line, commit, or iteration count>

   ````diff
   - <old line>
   + <new line>
   ````

   ### ② `<target file path>`

   **Resolves** — …

   ````diff
   …
   ````

   <repeat ③ ④ … for each amendment in the table>

   ---

   ### 🔎 Producer impact

   - **Personas affected:** <which agents change behavior, or "none — Constitution/template only">
   - **Gates affected:** <which slash-commands/gates see different verdicts as a result>
   - **Repo surface:** <count and rough scope of files touched if all amendments are applied>

   ---

   **To apply** — say e.g. `apply #1`, `apply #1 sharpened to <your edit>`, or `apply all`. I'll edit the files; you commit when ready.
   `````

   ### Rules for filling the template
   - **The amendment table is required.** One row per amendment, even when only one is proposed — the table is the scanning surface. The `#` column must match the circled-number headings (①②③…) below.
   - **Use unified-diff fences (` ```diff `) per amendment**, not Old:/New: blocks. The analyst's retro on disk may use either form; reformatting to unified diff is allowed. **Changing the textual content of any `+`/`-` line is not.** If an amendment is too structural to express as a unified diff (e.g. "split this file into two"), surface it verbatim in a plain ` ``` ` block and note the reason.
   - **Headline marker (`⭐`)** goes in both the table row and the card heading for the one amendment most directly tied to the production signal or recurring friction. At most one headline per retro; zero is also valid.
   - **Producer-impact footer is mandatory.** Its job is to make second-order effects (which gate starts behaving differently, which persona's instructions shift) visible before the user types `apply`. If the impact on a line is genuinely "none," write that — don't omit the line.
   - Preserve the order of amendments from the on-disk retro; the table and circled numbers reflect that order.

2. Suggest the next step:
   - If amendments are proposed → the invitation in step 1 already covers this. Also remind the user the retro is on disk at `.specs/<domain>/retro.md` for later reference.
   - If no amendments → "No retro action needed. Ready for the next widget — `/discover <signal>`."

3. **Do not auto-apply.** Wait for the user to name which amendments to apply and how (verbatim or with their edits). When they do, edit the target files directly (Edit/Write) and stop short of committing — the user owns the commit so the message references the retro consciously.

## Boundaries

- This command never edits the Constitution, AGENTS.md, personas, or templates. Diff application is human-gated, same posture as `/triage` toward spec amendments.
- Does not run code, tests, or builds.
- Does not push or modify remote state.
- Cross-domain retros (aggregating learnings across multiple widgets) are out of scope — this command operates on one domain at a time.
