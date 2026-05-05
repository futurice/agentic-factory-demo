---
description: Adversarial code review of a PBI's diff against its spec. Runs in a fresh critic subagent for session separation.
---

Dispatch this task to the `critic` subagent via the Agent tool (`subagent_type: critic`). A fresh subagent is required so the Builder's reasoning does not leak into the Critic's context. Relay the verdict verbatim.

**Input:** $ARGUMENTS — a PBI id or path (e.g., `auth/01-login-form`).

**Orchestration steps performed in the main thread before dispatch.**

1. Resolve the PBI file (`.specs/<domain>/pbi/<id>.md`). If missing, stop.
2. Identify the spec section the PBI points to and read it.
3. Capture the diff for the PBI's commits — typically `git log` since the previous PBI's merge or `git diff <base>...HEAD` scoped to "Files in scope".

**Subagent prompt to send** (self-contained — do **not** include your own analysis or the Builder's commit messages beyond the bare diff):

> Adversarial Code Review (`/review` mode).
>
> Spec: <paste relevant spec section verbatim, or pass file path + anchor>
> PBI: <paste PBI file content>
> Diff: <paste the unified diff>
>
> Validate the diff against the spec's Blueprint constraints and Contract (DoD, Regression Guardrails, Scenarios). Output one of:
>
> - `PASS` — followed by one line on what you verified.
> - A numbered list of violations. For each: contract broken, impact, remediation path, regression test that would prevent it.
> - `SPEC AMBIGUOUS` — if the spec cannot decide the question. Name the gap.
>
> Do not edit any files. Do not propose alternative implementations beyond a one-line remediation pointer. Return your verdict only.

After relaying the verdict, suggest the next step:

- `PASS` → `/ship <pbi-id>`
- violations → `/build <pbi-id>` again, passing the violations as failure feedback
- `SPEC AMBIGUOUS` → `/spec update <domain>`

**Boundaries.** This command never edits code or specs.
