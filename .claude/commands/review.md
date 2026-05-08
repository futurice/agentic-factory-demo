---
description: Adversarial code review of a PBI's diff against its spec AND the platform Constitution. Runs in a fresh critic subagent for session separation.
---

Dispatch this task to the `critic` subagent via the Agent tool (`subagent_type: critic`). A fresh subagent is required so the Builder's reasoning does not leak into the Critic's context. Relay the verdict verbatim.

**Input:** $ARGUMENTS — a PBI id or path (e.g., `auth/01-login-form`).

**Orchestration steps performed in the main thread before dispatch.**

1. Resolve the PBI file (`.specs/<domain>/pbi/<id>.md`). If missing, stop.
2. Identify the spec section the PBI points to and read it.
3. Read `.specs/CONSTITUTION.md` (the platform's architectural contract). If missing, stop and surface — `/review` requires it.
4. Capture the diff for the PBI's commits — typically `git log` since the previous PBI's merge or `git diff <base>...HEAD` scoped to "Files in scope".

**Subagent prompt to send** (self-contained — do **not** include your own analysis or the Builder's commit messages beyond the bare diff):

> Adversarial Code Review (`/review` mode). Validate against TWO contracts: the Spec (functional) and the Constitution (architectural).
>
> Spec: <paste relevant spec section verbatim, or pass file path + anchor>
> Constitution: <paste `.specs/CONSTITUTION.md` content>
> PBI: <paste PBI file content>
> Diff: <paste the unified diff>
>
> Run two passes:
>
> 1. **Spec pass** — does the diff implement the spec's Blueprint constraints and Contract (DoD, Regression Guardrails, Scenarios)?
> 2. **Constitutional pass** — does the diff respect every NEVER/ALWAYS rule? Check explicitly for: cross-widget imports, additions to `src/lib/`, new layered directories, gate-bypass markers, missing test colocation.
>
> Output one of:
>
> - `PASS` — one line confirming both passes (e.g. "Spec DoD items 1–4 met; no Constitutional violations.").
> - A numbered list of violations, each tagged `[Spec]` or `[Constitution]`. For each: contract broken (cite clause), impact, remediation path, regression test or check.
> - `SPEC AMBIGUOUS` — if the spec cannot decide the question. Name the gap.
>
> Do not edit any files. Do not propose alternative implementations beyond a one-line remediation pointer. Return your verdict only.

After relaying the verdict, suggest the next step:

- `PASS` → `/ship <pbi-id>`
- violations → `/build <pbi-id>` again, passing the violations as failure feedback
- `SPEC AMBIGUOUS` → `/spec update <domain>`

**Boundaries.** This command never edits code or specs.
