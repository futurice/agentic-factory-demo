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

- **Spec amendment** or **Regression guardrail**: stop. Surface the routing decision and the draft diff to the user. Suggest `/spec update <domain>`. The user takes it from there.

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
