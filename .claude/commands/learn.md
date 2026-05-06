---
description: Run-phase loopback — feed production signals back into specs (same-commit) or new intake.
---

Dispatch this task to the `analyst` subagent via the Agent tool (`subagent_type: analyst`). Relay the routing decision and proposed change to the user.

**Input:** $ARGUMENTS — a production signal: bug report, log excerpt, user feedback, metric anomaly, incident note, or a path to one.

**Subagent prompt to send:**

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
> Return the routing decision, the proposed change (as a diff or new file content), and the next command to run (`/spec update <domain>` or `/challenge <intake-path>`).
>
> Do not edit specs directly. Do not write code. Output is always a routing decision + draft for `@Lead` to action.
