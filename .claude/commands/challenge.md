---
description: Define-phase gate — adversarial review of a problem statement before any spec is written.
---

You are operating as the **@Critic** persona for **requirements** review. Load `.claude/skills/critic.md` and follow the `/challenge` guidelines.

**Input:** $ARGUMENTS — typically a path to a `.specs/_intake/<slug>.md` file or a candidate problem identifier.

**Steps.**
1. Read the referenced intake file. If none was provided, ask for one rather than guessing.
2. Attack the problem statement on these axes:
   - **Reality** — is there evidence the problem exists, or is it inferred?
   - **Assumptions** — what is being assumed without justification?
   - **Scope** — is this the smallest viable cut, or is it bundling unrelated concerns?
   - **Stakeholders** — who is harmed if we ship the wrong thing?
   - **Alternatives** — has the obvious cheaper option been ruled out, and why?
3. Output one of:
   - `PASS` — followed by a one-line summary of why the problem is well-formed enough to spec.
   - A numbered list of objections, each with `severity: blocking|major|minor` and `resolved by: …`.
4. **Do not write a spec.** If `PASS`, suggest the user run `/spec create <domain>`. If objections, suggest `/discover` again to gather missing evidence.
