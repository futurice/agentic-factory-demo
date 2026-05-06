---
description: Plan-phase gate — adversarial review of a PBI decomposition before any code is written.
---

Dispatch this task to the `critic` subagent via the Agent tool (`subagent_type: critic`). A fresh subagent is required so prior reasoning does not leak into the review. Relay the verdict verbatim to the user.

**Input:** $ARGUMENTS — `<domain>` matching an existing `.specs/<domain>/` with a populated `pbi/` directory. If none is provided, ask the user for one rather than guessing.

**Subagent prompt to send:**

> Adversarial Plan Review (`/challenge-plan` mode).
>
> Domain: $ARGUMENTS
> Read `.specs/$ARGUMENTS/spec.md`and every file under`.specs/$ARGUMENTS/pbi/` end to end before doing anything else. If either is missing, stop and report which step is needed (`/spec create $ARGUMENTS`or`/plan $ARGUMENTS`).
>
> Attack the PBI set on the axes from your `/challenge-plan` guidelines (Atomicity, Isolation, Self-testability, Boundedness, Coverage, Dependencies).
>
> Output one of:
>
> - `PASS` — followed by a one-line summary of why the plan is well-formed enough to build.
> - A numbered list of objections, each with `severity: blocking|major|minor`, `pbi: <NN-slug or "set">`, and `resolved by: …`.
>
> Do not write code. Do not edit specs or PBIs.

After relaying:

- If `PASS` → suggest `/build <first-pbi-id>`.
- If objections → suggest `/plan $ARGUMENTS` again (or `/spec update $ARGUMENTS` if the gap is in the spec, not the decomposition).
