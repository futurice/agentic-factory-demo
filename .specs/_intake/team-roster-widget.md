# Topic: Team Roster Widget

## Sources

- Raw signal (direct input, 2026-05-26): "I want to build a team roster widget — a table showing our team, like the People page in an admin panel. Each row is an employee with their name, role, department, and the name of their manager. Clicking a row expands an inline detail panel underneath that shows more about that person — a bigger avatar, full role + department, and a little "Reports to:" card with their manager's avatar and name. Use mocked data for now, maybe five or six employees so you can see the layout work. Keep it visually clean, like a real internal tool."

## Patterns

### Data Model

- **Employee attributes (primary table):** name, role, department, manager name (quoted signal: "name, role, department, and the name of their manager")
- **Employee attributes (expanded detail):** avatar, full role, full department, manager avatar + name (quoted signal: "a bigger avatar, full role + department, and a little 'Reports to:' card with their manager's avatar and name")
- **Sample size:** 5–6 employees for layout validation (quoted signal: "maybe five or six employees")
- **(hypothesis)** Manager reference is a denormalized name in the table view, but rendered as a card (avatar + name) in the expanded view — suggests manager records may exist separately or be queried via a relationship

### UI Shape

- **Container:** table (quoted signal: "a table showing our team")
- **Row structure:** collapsible; clicking a row expands an "inline detail panel underneath" (quoted signal: "Clicking a row expands an inline detail panel underneath")
- **Detail layout:** multi-section — larger avatar, role/department block, "Reports to" manager card (quoted signal: "a bigger avatar, full role + department, and a little 'Reports to:' card")
- **(hypothesis)** Row selection/expansion is toggle behavior (click to open, click to close implied)
- **(hypothesis)** "Inline detail panel underneath" suggests the detail row is a sibling row in the table DOM, not an overlay or drawer

### Visual / UX Goals

- **Tone:** "visually clean, like a real internal tool" (quoted signal: "Keep it visually clean, like a real internal tool")
- **Precedent:** "like the People page in an admin panel" (quoted signal: "like the People page in an admin panel")
- **(hypothesis)** Learner is reaching for a familiar pattern (admin/dashboard UI convention) rather than inventing; visual should be understated, professional

### Data Sourcing

- **Approach:** mocked data (quoted signal: "Use mocked data for now")
- **(hypothesis)** No API integration, no persistence — static fixture for layout validation only

## Open Questions

1. **Manager relationship:** Is every employee expected to have a manager, or are some employees (e.g., executives, contractors) without one? How should the "Reports to" card render if the manager field is absent?
2. **Expanded detail — layout specifics:** Is the expanded panel always a full-width row below the clicked row, or does it have constrained width / alignment? Does it have a close button, or does re-clicking the row toggle it?
3. **Interactivity scope:** Should only one row be expanded at a time (accordion), or can multiple rows expand simultaneously (disclosure group)?
4. **Avatar source:** Where do avatars come from (initials, placeholder, external URL in mock data, Gravatar)? Does the table row show an avatar alongside name, or just the name, with avatar appearing only in the expanded panel?
5. **Sorting / filtering:** Are there sorting controls on the table columns (name, role, department, manager), or is it a flat list of mocked rows?
6. **Responsive design:** Should the table reflow on mobile, or is it desktop-only for now?
7. **Copy/action buttons:** Does the expanded detail panel include actions (edit, email, contact), or is it view-only?

## Candidate Problems

- **P1: Render a collapsible table of employees with rows showing name, role, department, manager name, and clicking a row expands an inline detail panel with avatar, full details, and manager "Reports to" card.**
  - Scope: single widget, mocked data, no persistence or API
  - Blocker candidates: ambiguous manager-absent handling, unclear expanded-panel layout constraints, unclear multi-expand behavior

- **P2: Handle manager references in both table (text) and expanded detail (card with avatar).**
  - Scope: data model question; minor compared to P1 if manager is always present and denormalized in the fixture
  - Blocker candidate: how to fetch/render manager avatar if not in primary employee record

- **P3: Make the UI "visually clean, like a real internal tool" — justify design choices (spacing, color, typography) against that goal.**
  - Scope: visual/UX validation; likely a `/review` or manual design check, not a blocker
  - Note: learner reached for a pattern (admin UI) rather than describing visual in detail — suggests openness to Critic or Lead guidance on conventions
