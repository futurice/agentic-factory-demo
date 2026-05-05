# Feature: <Name>

## Blueprint

### Context
<1–2 paragraphs: why does this feature exist, what problem does it solve, who is affected.>

### Architecture
- **API contracts:**
  - `<METHOD> /api/...` — <description, request/response shape>
- **Data models:** defined in `<path>`, validated by `<path>`.
- **Dependencies:**
  - Depends on: <services, libraries, external APIs>
  - Depended on by: <downstream consumers>
- **Constraints:** <security, compliance, architectural boundaries — stated positively as facts. Only include constraints not already implied by the architecture above.>

## Contract

### Definition of Done
- [ ] <observable, independently verifiable criterion>
- [ ] <each item must be machine- or reviewer-checkable>

### Regression Guardrails
- <invariant that must never break across future changes>

### Scenarios
```gherkin
Scenario: <descriptive name>
  Given <precondition — system state before the action>
  When <action — what the user or system does>
  Then <expected outcome — observable, verifiable result>
```

---

**Authoring rules.**
- State constraints positively. No "Anti-Patterns" section.
- Use Gherkin to absorb failure modes (`Then the system does NOT …` is a verifiable contract).
- Reference concrete file paths, not abstract descriptions.
- Match depth to complexity — omit sections that add nothing.
- Mark outdated content `[DEPRECATED YYYY-MM-DD — <reason>]` rather than deleting.
