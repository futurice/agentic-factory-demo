---
description: Discover phase — turn a raw signal into a Problem Graph at .specs/_intake/.
---

Dispatch this task to the `analyst` subagent via the Agent tool (`subagent_type: analyst`). The subagent owns the @Analyst persona; do not perform the work in the main thread. Relay the subagent's result verbatim to the user.

**Input:** $ARGUMENTS

**Subagent prompt to send:**

> Discover-phase task: turn the raw signal below into a Problem Graph.
>
> Signal: $ARGUMENTS
> If the signal references a file, URL, issue, or transcript, read it. Otherwise treat the argument string as the raw signal itself.
>
> Steps:
>
> 1. Cluster the input into named patterns. For each pattern, cite the source (file:line, URL, or quoted excerpt).
> 2. Separate observations from interpretations — tag the latter `(hypothesis)`.
> 3. Write the result to `.specs/_intake/<slug>.md` using:
>    - `# Topic: <title>`
>    - `## Sources` — list of inputs with provenance
>    - `## Patterns` — clustered observations with citations
>    - `## Open Questions` — what evidence is missing
>    - `## Candidate Problems` — bullet list, each one a candidate for `/challenge`
> 4. Do **not** propose solutions or write specs.
>
> Return the file path you wrote and a one-line summary.

After relaying, suggest the user run `/challenge <intake-path>` next.
