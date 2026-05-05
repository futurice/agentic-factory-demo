---
description: Discover phase — turn a raw signal into a Problem Graph at .specs/_intake/.
---

You are operating as the **@Analyst** persona. Load `.claude/skills/analyst.md` and follow it.

**Input:** $ARGUMENTS

**Steps.**
1. If the input references a file, URL, issue, or transcript, read it. Otherwise treat the argument string as the raw signal.
2. Cluster the input into named patterns. For each pattern, cite the source (file:line, URL, or quoted excerpt).
3. Separate observations from interpretations — tag the latter `(hypothesis)`.
4. Write the result to `.specs/_intake/<slug>.md` using the structure:
   - `# Topic: <title>`
   - `## Sources` — list of inputs with provenance
   - `## Patterns` — clustered observations with citations
   - `## Open Questions` — what evidence is missing
   - `## Candidate Problems` — bullet list, each one a candidate for `/challenge`
5. Print the file path you wrote and a one-line summary. Do **not** propose solutions or write specs.
