---
description: Spec phase — create, reverse-engineer, or update a living feature spec at .specs/<domain>/spec.md.
---

Dispatch this task to the `lead` subagent via the Agent tool (`subagent_type: lead`). Relay the subagent's report (file path written + one-line summary) to the user.

**Input:** $ARGUMENTS — one of:

- `create <domain>` (default if omitted) — write a new spec from intake or user description
- `reverse <path-or-domain>` — derive a spec from existing code
- `update <domain>` — refresh an existing spec to reflect current code/intent

**Subagent prompt to send:**

> Spec-phase task ($ARGUMENTS).
>
> Pipeline:
>
> 1. **Context loading.**
>    - Read `.specs/TEMPLATE.md` as the base structure.
>    - For `create`: read any referenced `.specs/_intake/<slug>.md` first.
>    - For `reverse`: systematically read source files in the feature area; trace data flow, schemas, error handling, edge cases. Reconstruct intent from patterns.
>    - For `update`: read the existing `.specs/<domain>/spec.md` and `git diff` recent changes; identify stale sections.
>    - If the ASDLC MCP is available and you need methodology refresh, call `mcp__asdlc__get_article` for `the-spec`, `living-specs`, or `spec-driven-development`.
>    - If the intake or signal references a **Figma URL** and the visual contract needs grounding, try the figma desktop MCP first (`mcp__figma-desktop__get_metadata`, `mcp__figma-desktop__get_screenshot`, `mcp__figma-desktop__get_design_context`, `mcp__figma-desktop__get_variable_defs`). Extract the `nodeId` from the URL (e.g. `?node-id=1-3` → `1:3`). If the MCP is not connected (the call returns a "no such tool" / "MCP not available" error), do **not** invent visual tokens — pin the spec's visual contract to whatever evidence the intake records and flag the gap explicitly in the Blueprint.
> 2. **Authoring principles.**
>    - State constraints **positively**. No "Anti-Patterns" sections.
>    - Use Gherkin scenarios to absorb failure modes (`Given / When / Then`).
>    - Reference specific file paths, not abstract descriptions.
>    - Match depth to complexity — omit sections that add nothing.
>    - Every Definition of Done item must be independently machine-verifiable.
> 3. **Write to** `.specs/<domain>/spec.md`.
> 4. **Update mode only.** Mark outdated sections `[DEPRECATED YYYY-MM-DD — <reason>]` rather than deleting.
> 5. **Validate** before reporting done:
>    - [ ] Each DoD item is independently verifiable (not vague, not compound)
>    - [ ] Scenarios cover happy path + at least one error case + relevant edges
>    - [ ] All referenced file paths exist (reverse/update modes)
>    - [ ] No anti-pattern warnings disguised as constraints
> 6. Return the spec path.
>
> Do not write implementation code. Do not modify files outside `.specs/`.

After relaying, suggest `/plan <domain>` as the next step.
