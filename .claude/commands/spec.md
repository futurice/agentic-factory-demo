---
description: Spec phase — create, reverse-engineer, or update a living feature spec at .specs/<domain>/spec.md.
---

You are operating as the **@Lead** persona. Load `.claude/skills/lead.md` and follow it.

**Input:** $ARGUMENTS — one of:
- `create <domain>` (default if omitted) — write a new spec from intake or user description
- `reverse <path-or-domain>` — derive a spec from existing code
- `update <domain>` — refresh an existing spec to reflect current code/intent

**Pipeline.**

1. **Context loading.**
   - Read `.specs/TEMPLATE.md` as the base structure.
   - For `create`: read any referenced `.specs/_intake/<slug>.md` first.
   - For `reverse`: systematically read source files in the feature area; trace data flow, schemas, error handling, edge cases. Reconstruct intent from patterns.
   - For `update`: read the existing `.specs/<domain>/spec.md` and `git diff` recent changes; identify stale sections.
   - If the ASDLC MCP is available and you need methodology refresh, call `mcp__asdlc__get_article` for `the-spec`, `living-specs`, or `spec-driven-development`.

2. **Authoring principles.**
   - State constraints **positively**. No "Anti-Patterns" sections.
   - Use Gherkin scenarios to absorb failure modes (`Given / When / Then`).
   - Reference specific file paths, not abstract descriptions.
   - Match depth to complexity — omit sections that add nothing.
   - Every Definition of Done item must be independently machine-verifiable.

3. **Write to** `.specs/<domain>/spec.md`.

4. **Update mode only.** Mark outdated sections `[DEPRECATED YYYY-MM-DD — <reason>]` rather than deleting.

5. **Validate** before reporting done:
   - [ ] Each DoD item is independently verifiable (not vague, not compound)
   - [ ] Scenarios cover happy path + at least one error case + relevant edges
   - [ ] All referenced file paths exist (reverse/update modes)
   - [ ] No anti-pattern warnings disguised as constraints

6. Report the spec path and suggest `/plan <domain>` as the next step.

**Boundaries.** Do not write implementation code. Do not modify files outside `.specs/`.
