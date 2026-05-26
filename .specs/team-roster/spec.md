# Feature: Team Roster Widget

## Blueprint

### Context

The learner wants a "People page"-style admin panel widget showing a small table of employees. Each row displays name, role, department, and manager name. Clicking a row expands an inline detail panel directly below it — showing a larger avatar, full role and department, and a "Reports to" card with the manager's avatar and name. Data is static mocked fixture (5–6 employees); no persistence or API integration is in scope. The widget lives at `src/app/widgets/team-roster/` and is self-contained and deletable in one `rm -rf`.

The learner's stated tone goal is "visually clean, like a real internal tool." No Figma reference was provided; the Visual Contract below is derived from the platform's design-contract defaults and has been confirmed by the learner.

### Decisions

1. **Single-row accordion.** Only one row may be expanded at a time. Clicking an already-expanded row collapses it. Clicking a different row collapses the currently open one and opens the new one. This is the simplest behavior consistent with "admin panel" conventions and avoids a cluttered multi-expansion experience.

2. **Avatar source: generated initials.** Avatars are rendered as colored circles with the employee's initials (two characters: first and last name initials). The color is derived deterministically from the employee's name (e.g. pick from a small fixed palette by index of name). No external image URLs, no Gravatar. This removes the dependency on any image-hosting concern for a mocked fixture and keeps the component fully self-contained.

3. **Manager reference is denormalized in the fixture.** The mock data stores `managerId` pointing to another record in the same array. The table row shows the manager's name as a plain string (looked up from the array). The expanded detail renders the manager's initials avatar and name as a "Reports to" card, looked up the same way. If `managerId` is `null` (top-level employee), the table row shows `"—"` in the Manager column and the expanded detail omits the "Reports to" card entirely (the slot is empty, not an error).

4. **Row expansion is client-side state.** The table and expansion logic require `useState`, so the component carrying the toggle state is a `"use client"` component. The route page (`page.tsx`) is a server component that renders it.

5. **No sorting, filtering, or actions.** The table is a flat read-only list. No column sort controls, no search input, no edit/email/contact buttons in the expanded panel. These are out of scope for the current PBI.

6. **Desktop-first layout.** No mobile table reflow is required. The widget targets desktop viewport (≥ `768px`). On narrower viewports the table scrolls horizontally — no custom breakpoint behavior.

### Architecture

- **New files:**
  - `src/app/widgets/team-roster/page.tsx` — server component route for `/widgets/team-roster`, renders the widget heading and the `<RosterTable>` client component.
  - `src/app/widgets/team-roster/RosterTable.tsx` — `"use client"` component owning accordion expansion state and rendering the `<table>`, rows, and inline detail panels.
  - `src/app/widgets/team-roster/RosterTable.test.tsx` — Vitest + Testing Library coverage (see Scenarios).
  - `src/app/widgets/team-roster/employees.ts` — plain TypeScript module exporting the `Employee` type and the `EMPLOYEES` mock fixture array. No `"use client"` directive; it is pure data.
  - `src/app/widgets/team-roster/Avatar.tsx` — server-renderable component that renders an initials circle. Receives `name: string` and `size: "sm" | "lg"` props. No state, no browser APIs — no `"use client"` needed.

- **Data model** — defined in `src/app/widgets/team-roster/employees.ts`:

  ```ts
  type Employee = {
    id: string;
    name: string; // full name, e.g. "Ada Lovelace"
    role: string; // e.g. "Engineering Lead"
    department: string; // e.g. "Engineering"
    managerId: string | null; // null for top-level employees
  };
  ```

  The fixture contains exactly 6 employees, at least one of whom has `managerId: null` (to exercise the no-manager edge case).

- **Dependencies:**
  - `lucide-react` — already present; used for the expand/collapse chevron icon on each row.
  - No new `npm` packages.

- **Constraints:**
  - The widget folder is self-contained. No imports from other widget folders. No widget-specific code in `src/lib/`.
  - `RosterTable.tsx` carries the only `"use client"` boundary; `page.tsx` and `Avatar.tsx` and `employees.ts` are server-safe.
  - The `Avatar` component must render identically on server and client (no browser-API reads, no `Math.random()` at render time — the color derivation must be deterministic from `name`).

### Visual Contract

No Figma reference was provided. The following literals are derived from the platform design-contract defaults and aligned with the Pomodoro widget aesthetic so the widget family feels cohesive. This contract is approved.

**Platform chrome (inherited, fixed):**

- Page background: `#030712`
- Container max-width: `1280px`; padding: `48px` on all four sides (owned by `src/app/layout.tsx`; the widget inherits these without override).

**Card surface — Option A (Standard):**

- Background: `#101828`
- Border: `1px solid #1E2939`
- Radius: `10px`
- Padding: `24px`

**Typography — Scale 2 (Compact), appropriate for a data-dense table:**

- Page heading: text literal `"Team Roster"`, Space Grotesk Bold `28px / 32px`, gradient text `linear-gradient(90deg, #51A2FF 0%, #AD46FF 100%)` (matches the Widget Showcase home heading aesthetic).
- Table header cells: Inter Regular `12px / 16px`, color `#99A1AF`, uppercase. (Standard admin-panel convention for column labels.)
- Table body cells (primary): Inter Regular `14px / 20px`, color `#FFFFFF`.
- Table body cells (secondary — role, department, manager name): Inter Regular `14px / 20px`, color `#99A1AF`.
- Detail panel labels ("Role", "Department", "Reports to"): Inter Regular `12px / 16px`, color `#99A1AF`.
- Detail panel values: Inter Regular `14px / 20px`, color `#FFFFFF`.
- Employee name in detail panel: Space Grotesk Bold `16px / 24px`, color `#FFFFFF`.

**Spacing — Rhythm 2 (4-grid, dense), because this is an information-dense table widget:**

- `gap-[8px]` between avatar and name within a table cell.
- `gap-[16px]` between the table and its card border internally.
- `gap-[12px]` between sections within the expanded detail panel.
- `gap-[20px]` between the page heading and the card.

**Foreground / accent — Blue (default, Pomodoro-aligned):**

- Row hover background: `#1E2939` (the secondary-button background token doubles as a subtle hover state on dark surfaces).
- Expanded row background: `#1E2939` (same token; marks the active row visually).
- Expanded detail panel background: `#0F172A` (one step darker than `#101828` to create visual separation).
- Chevron icon and interactive focus ring: `#3B82F6`.
- Row click target focus ring: `focus-visible:ring-2 focus-visible:ring-[#3B82F6]`.

**Avatar colors — fixed palette, index derived from name:**
Five background colors cycling by `name.charCodeAt(0) % 5`:

- `0`: background `#1E3A5F`, text `#93C5FD` (blue)
- `1`: background `#1B4332`, text `#6EE7B7` (green)
- `2`: background `#3B1F5E`, text `#C4B5FD` (violet)
- `3`: background `#4C1D24`, text `#FCA5A5` (red)
- `4`: background `#451A03`, text `#FCD34D` (amber)

Small avatar (`size="sm"`): `32px × 32px`, radius `9999px`, Inter Regular `12px`.
Large avatar (`size="lg"`): `48px × 48px`, radius `9999px`, Inter Regular `16px`.

**Table row structure:**

- Columns: Avatar+Name | Role | Department | Manager | Expand chevron.
- Column widths: `Name` ~`240px` (flex-grow); `Role`, `Department`, `Manager` each ~`160px` (fixed); chevron `40px`.
- Row height: `56px` (to fit the `sm` avatar with vertical padding).
- Dividers: `1px solid #1E2939` between rows. No outer border on the table itself — the card border provides the outer frame.
- The chevron (`ChevronDown` from `lucide-react`, `20px`, stroke `2`) rotates `180deg` when the row is expanded (CSS `transition: transform 150ms ease`).

**Expanded detail panel:**

- Full-width row below the employee row (spans all columns).
- Background: `#0F172A`.
- Padding: `20px 24px`.
- Layout: horizontal flex, `gap-[24px]`: large avatar on the left, text block in the center (name, role, department), "Reports to" card on the right (if `managerId` is not null).
- "Reports to" card: small rounded container (`background: #101828`, `border: 1px solid #1E2939`, `border-radius: 8px`, `padding: 12px`), row layout with small avatar + manager name label above and name below.
- No action buttons in the panel.

**Accessibility floor (non-negotiable):**

- Each row's clickable element is a real `<button type="button">` or the `<tr>` uses `role="button"` with `tabIndex={0}` and both `onClick` and `onKeyDown` (`Enter` / `Space` trigger expand). The recommended implementation uses a `<button>` rendered as the expand-control within the chevron column so the rest of the `<tr>` cells remain non-interactive, while the entire row also has a `cursor-pointer` visual affordance. The binding constraint is that keyboard-only users can expand/collapse rows.
- Expanded region has `role="region"` or is a `<tr>` containing a `<td colSpan={5}>` with `id` paired to the controlling button's `aria-controls`.
- Button has `aria-expanded={isExpanded}` and `aria-label` that identifies which row it controls (e.g. `aria-label="Expand Ada Lovelace"`).
- All text on dark backgrounds passes WCAG AA contrast (the proposed tokens above satisfy this at `14px`+ sizes — `#FFFFFF` on `#101828` is 15.6:1; `#99A1AF` on `#101828` is 5.7:1).
- Focus rings use `focus-visible:ring-2 focus-visible:ring-[#3B82F6]` on all interactive elements.

---

## Contract

### Definition of Done

- [ ] Route `/widgets/team-roster` renders without runtime errors (`npm run build` passes).
- [ ] `npm run lint` passes with no errors.
- [ ] `npm run test:run` passes; all tests in `src/app/widgets/team-roster/` are green.
- [ ] The page renders a card containing a table with exactly 6 rows (one per mock employee).
- [ ] Table columns are: name (with small avatar), role, department, manager name, and a chevron control.
- [ ] Clicking the chevron button on a collapsed row expands the inline detail panel below that row; the panel contains the employee's large avatar, name, role, and department.
- [ ] For an employee with a manager, the expanded detail panel contains a "Reports to" card showing the manager's small avatar and name.
- [ ] For an employee with `managerId: null`, the expanded detail panel contains no "Reports to" card.
- [ ] Clicking the chevron button on an already-expanded row collapses its detail panel.
- [ ] Expanding a second row collapses the previously expanded row (single-expand accordion).
- [ ] The `Avatar` component renders the employee's initials (two characters) and does not render an `<img>` tag.
- [ ] `page.tsx` contains no `"use client"` directive.
- [ ] `employees.ts` and `Avatar.tsx` contain no `"use client"` directive.
- [ ] `RosterTable.tsx` begins with `"use client"`.
- [ ] No cross-widget imports exist in any file under `src/app/widgets/team-roster/`.
- [ ] No widget-specific code exists in `src/lib/`.
- [ ] The card root element's `className` includes `bg-[#101828]`.
- [ ] The page heading rendered by `page.tsx` has the text content `"Team Roster"` and its `className` encodes the gradient `linear-gradient(90deg, #51A2FF 0%, #AD46FF 100%)` (e.g. via `bg-[linear-gradient(90deg,#51A2FF_0%,#AD46FF_100%)]` or equivalent Tailwind arbitrary-value utility).
- [ ] Each chevron button has `aria-expanded` and `aria-label` attributes.
- [ ] No `console.error` is emitted in a Vitest test that mounts `<RosterTable>` (hydration guardrail).
- [ ] `git grep -nE "font-\[var\(--font-" src/app/widgets/team-roster` returns no matches (font-family class shape guardrail).

### Regression Guardrails

- The widget folder `src/app/widgets/team-roster/` is self-contained: deleting it entirely must leave the rest of the build passing.
- The `Employee` type in `employees.ts` must not be imported by any file outside `src/app/widgets/team-roster/`.
- The `Avatar` component must render identically on server and client: no reads of browser APIs, no `Math.random()` at render time, and no numeric CSS custom property values at the React-style boundary (Constitution, hydration-unsafe patterns clause).
- A Vitest test that mounts `<RosterTable>` must install a `console.error` spy and assert it was not called (per AGENTS.md "Pomodoro Amendment 2026-05-08 #6" pattern).
- Every font-family CSS variable binding in any file under `src/app/widgets/team-roster/` uses the explicit arbitrary-property form `[font-family:var(--font-inter)]` or `[font-family:var(--font-space-grotesk)]`. The shorthand `font-[var(--font-` form is ambiguous between Tailwind's `font-family` and `font-weight` utility namespaces under Tailwind v4's PostCSS pipeline and produces inconsistent class output across server and client renders; the explicit `[font-family:var(--font-…)]` form is unambiguous and renders identically on both sides of hydration (per AGENTS.md "Pomodoro Amendment 2026-05-08 #6").

### Scenarios

```gherkin
Scenario: Table renders all mock employees
  Given the user navigates to /widgets/team-roster
  When the page finishes loading
  Then the table body contains exactly 6 rows
  And each row displays the employee's name, role, department, and manager name (or "—")

Scenario: Expanding a row shows the inline detail panel
  Given the table is rendered with all rows collapsed
  When the user clicks the expand button on the "Ada Lovelace" row
  Then the detail panel for "Ada Lovelace" becomes visible in the DOM
  And the panel contains "Ada Lovelace"'s name, role, and department
  And the chevron button has aria-expanded="true"

Scenario: Detail panel shows Reports-to card for employee with a manager
  Given the "Ada Lovelace" row is expanded
  And "Ada Lovelace" has a non-null managerId
  When the detail panel is visible
  Then the panel contains a "Reports to" section with the manager's name

Scenario: Detail panel omits Reports-to card for top-level employee
  Given a top-level employee row (managerId is null) is expanded
  When the detail panel is visible
  Then the panel does not contain a "Reports to" heading or card

Scenario: Accordion collapses previously open row when a new row is opened
  Given the "Ada Lovelace" row is expanded
  When the user clicks the expand button on the "Grace Hopper" row
  Then the detail panel for "Ada Lovelace" is no longer visible
  And the detail panel for "Grace Hopper" becomes visible

Scenario: Clicking the expand button on an open row collapses it
  Given the "Ada Lovelace" row is expanded
  When the user clicks the expand button on the "Ada Lovelace" row again
  Then the detail panel for "Ada Lovelace" is no longer visible
  And the chevron button has aria-expanded="false"

Scenario: Avatar renders initials, not an image
  Given the table is rendered
  When the component tree is queried
  Then no <img> element exists inside any Avatar component
  And each Avatar contains exactly two uppercase characters matching the employee's initials

Scenario: No hydration mismatch on mount
  Given a console.error spy is installed before rendering <RosterTable>
  When the component is mounted in the test environment
  Then console.error is not called
```
