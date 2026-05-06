---
description: Define-phase gate — adversarial review of a problem statement before any spec is written.
---

Dispatch this task to the `critic` subagent via the Agent tool (`subagent_type: critic`). A fresh subagent is required so prior reasoning does not leak into the review. Relay the verdict verbatim to the user.

**Input:** $ARGUMENTS — typically a path to a `.specs/_intake/<slug>.md` file or a candidate problem identifier. If none is provided, ask the user for one rather than guessing.

**Subagent prompt to send:**

> Adversarial Requirements Review (`/challenge` mode).
>
> Intake: $ARGUMENTS
> Read the referenced intake file end to end before doing anything else.
>
> Attack the problem statement on the five axes from your `/challenge` guidelines (Reality, Assumptions, Scope, Stakeholders, Alternatives).
>
> Output one of:
>
> - `PASS` — followed by a one-line summary of why the problem is well-formed enough to spec.
> - A numbered list of objections, each with `severity: blocking|major|minor` and `resolved by: …`.
>
> Do not write a spec. Do not edit any files.

After relaying:

- If `PASS` → suggest `/spec create <domain>`.
- If objections → suggest `/discover` again to gather missing evidence.
