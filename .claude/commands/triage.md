---
description: Run-phase loopback — feed production signals back into specs (same-commit) or new intake. Auto-chains into the pipeline when routing is "new intake".
---

You are the orchestrator for a Run-phase signal. Your first job is to **route** the signal; depending on the route, you either stop with a draft for the user, or auto-chain into the pipeline exactly like `/discover` does.

## Input

`$ARGUMENTS` — a production signal: bug report, log excerpt, user feedback, metric anomaly, incident note, or a path to one.

If `$ARGUMENTS` is empty, ask the user for a signal rather than guessing.

## Step 1 — Route the signal

Dispatch the Analyst subagent (`subagent_type: analyst`) with this prompt:

> Run-phase loopback task.
>
> Signal: $ARGUMENTS
> Read or accept the signal. Cite its source (URL, file:line, ticket id).
>
> **Figma URLs:** if the signal contains a `figma.com/design/...` URL, extract the `nodeId` (e.g. `?node-id=1-3` → `1:3`) and try the figma desktop MCP first (`mcp__figma-desktop__get_metadata`, `mcp__figma-desktop__get_screenshot`, `mcp__figma-desktop__get_design_context`, `mcp__figma-desktop__get_variable_defs`) — `WebFetch` will hit Figma's login wall. If the MCP is not connected, cite the URL and note "Figma MCP not connected — design content unavailable" rather than inventing visual claims.
>
> Decide the routing:
>
> - **Spec amendment** — if the signal contradicts or extends an existing `.specs/<domain>/spec.md`'s Contract, recommend `/spec update <domain>` and draft the diff. Do **not** apply it yourself — `@Lead` owns spec writes.
> - **New intake** — if the signal points to an unscoped problem, write `.specs/_intake/<slug>.md` exactly as `/discover` would.
> - **Regression guardrail** — if the signal is a recurrence of a previously fixed bug, propose adding a Gherkin scenario under the relevant spec's Regression Guardrails section.
>
> Return the routing decision, the proposed change (as a diff or new file content), and — if the route is "new intake" — the intake path you wrote.
>
> Do not edit specs directly. Do not write code.

## Step 2 — Branch on the route

- **Spec amendment** or **Regression guardrail**: stop. **Surface the routing decision and the draft diff as a scannable card** so the user can evaluate without context-switching to the IDE. The card has four parts — header, change table, per-hunk unified diffs, impact footer — followed by the apply invitation.

  ### Card template

  ````
  ## 🔄 Triage routed: **<Spec amendment | Regression guardrail>** — `<domain>`

  > **Signal** — <one-line restatement of the signal>
  > **Target** — <path to the spec file the analyst proposes editing>
  > **Why** — <one sentence on which spec clause this contradicts or extends, citing line numbers>

  ---

  ### What changes, at a glance

  | # | Section | Change | Line(s) |
  |---|---------|--------|---------|
  | 1 | <spec section name> | <➕ add / ✏️ edit / ♻️ replace / ➖ remove> <verb phrase> | <line range> |
  | 2 | … | … | … |

  ---

  ### ① <Section name> — *<short locator, e.g. "add Decision 2" or "L95">*

  ```diff
  - <old line removed verbatim from spec>
  + <new line as proposed by analyst>
  ```

  ### ② <Section name> — *<locator>*

  ```diff
  …
  ```

  <repeat ③ ④ … for each hunk in the table>

  ---

  ### 🔎 Impact

  - **Behavioral:** <one line: what the user-visible behavior change is>
  - **Test surface:** <one line: new/changed scenarios, what stays untouched>
  - **Constitution:** <one line: confirm no cross-widget reach, no `lib/` churn, widget still deletable in one `rm -rf` — or flag if any of these are at risk>

  ---

  **To apply** — say `apply` (verbatim) or `apply with <your edit>`. I'll edit the spec; run `/spec update <domain>` afterwards if you want Lead to re-validate. You own the commit.
  ````

  ### Rules for filling the template
  - **The change table is required.** One row per hunk. If there's only one hunk, still emit a one-row table — the table is the scanning surface.
  - **Use unified-diff fences (` ```diff `) per hunk**, not Old:/New: blocks. The analyst returns Old/New; you reformat to unified diff. Reformatting is allowed; **changing the spec content of any `+` or `-` line is not**. If the analyst's Old/New blocks are ambiguous to reformat, surface them verbatim in a plain ` ``` ` block under that hunk's heading and note the ambiguity.
  - **Circled-number headings (①②③④…)** mark each hunk and must match the table's `#` column so the reader can jump between them.
  - **Impact footer is mandatory** even when each line is "no change" — its job is to make architectural side-effects (or their absence) explicit before the user types `apply`.
  - **Do not auto-apply.** Wait for the user to name the action. When they do, edit the target file directly (Edit/Write) and stop short of committing — the user owns the commit.

- **New intake**: auto-chain into the pipeline. Take the intake path the Analyst wrote, then follow the **same orchestration as `/discover`** starting from its Step 2 (Challenge):
  1. Skill `challenge` with the intake path.
     - On `PASS`: ask the user for the `<domain>` name (one short line), then auto-advance.
     - On objections: surface them and stop.
  2. Skill `spec` with `create <domain>`.
  3. Skill `plan` with `<domain>`.
  4. Skill `challenge-plan` with `<domain>`.
     - On `PASS`: auto-advance.
     - On objections: stop and suggest `/plan <domain>` again or `/spec update <domain>`.
  5. For each PBI in dependency order:
     1. Skill `build` with `<pbi-id>`.
     2. Skill `review` with `<pbi-id>`.
        - On `PASS`: continue.
        - On violations: re-skill `build` with the same PBI. The 10-iteration cap is enforced inside `/build`; if it exits at the cap without progress, stop and surface.
        - On `SPEC AMBIGUOUS`: stop and suggest `/spec update <domain>`.
  6. **Pre-`/ship` boundary.** All PBIs PASS review. Stop. Print the domain, PBIs reviewed, and `Ready to ship. Run /ship <pbi-id> when ready — remote state is human-gated.`

## Boundaries

- Do **not** edit specs, write code, or change PBIs yourself.
- Do **not** auto-invoke `/ship`. Always human-gated.
- On any unexpected verdict format, stop and surface the raw output.
- One PBI at a time. No parallel `/build`, even across domains. PBIs are isolated by design but the working tree is not — concurrent dev sessions stage into the same tree and produce bundled, mislabeled commits (see pomodoro retro 2026-05-08 → commit `db1f8b3`, which mixed app-shell PBI 02 staging with pomodoro PBI 12 staging).
