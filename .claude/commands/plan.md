---
description: Decompose a spec into atomic, isolated, self-testable PBIs under .specs/<domain>/pbi/.
---

Dispatch this task to the `lead` subagent via the Agent tool (`subagent_type: lead`). Relay the subagent's report (PBI list + dependency graph) to the user.

**Input:** $ARGUMENTS — `<domain>` matching an existing `.specs/<domain>/spec.md`.

**Subagent prompt to send:**

> Plan-phase task: decompose `.specs/$ARGUMENTS/spec.md` into PBIs.
>
> Steps:
>
> 1. Read `.specs/$ARGUMENTS/spec.md` end to end. If it does not exist, stop and report that `/spec create $ARGUMENTS` is needed.
> 2. Identify the smallest set of PBIs that together fulfill the spec's Contract. Each PBI must be:
>    - **Atomic** — lands as one merge unit, no partial states.
>    - **Isolated** — distinct files/modules from sibling PBIs (no merge contention).
>    - **Self-testable** — verifiable without other pending PBIs completing first.
>    - **Bounded** — touches a named, finite set of files.
> 3. For each PBI, write `.specs/$ARGUMENTS/pbi/<NN>-<slug>.md` with the structure:
>
>    ```md
>    # PBI <NN>: <title>
>
>    ## Directive
>
>    <one paragraph: what changes, scope limits>
>
>    ## Spec pointer
>
>    - .specs/$ARGUMENTS/spec.md#<section-anchor>
>
>    ## Files in scope
>
>    - <path/one>
>    - <path/two>
>
>    ## Acceptance (from spec Contract)
>
>    - [ ] <DoD item 1>
>    - [ ] <DoD item 2>
>
>    ## Verification
>
>    - Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
>    - Scenario(s): <link to Gherkin scenarios in the spec>
>
>    ## Dependencies
>
>    - Requires: <PBI ids or "none">
>
>    ## Refinement rule
>
>    If reality diverges from the spec while implementing, stop and request a `/spec update $ARGUMENTS` rather than improvising.
>    ```
>
> 4. Return the ordered list of PBI files written and the dependency graph (textual).
>
> Do not write code. Do not edit the spec itself — if the decomposition reveals gaps, report them so the user can run `/spec update $ARGUMENTS`.

After relaying, suggest `/build <pbi-id>` for the first independent PBI.
