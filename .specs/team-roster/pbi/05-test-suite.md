# PBI 05: Test suite

## Directive

Create `src/app/widgets/team-roster/RosterTable.test.tsx`, the Vitest + Testing Library test file covering all Gherkin scenarios in the spec. The test file mounts `<RosterTable />` (which internally uses the real `EMPLOYEES` fixture and real `Avatar` component). It installs a `console.error` spy before each test and asserts it was never called (hydration guardrail per AGENTS.md Pomodoro Amendment pattern). All 8 Gherkin scenarios in the spec must have corresponding test coverage.

This PBI also owns the behavioral acceptance for the accordion state transitions that PBI 03 defers: expand/collapse, single-open accordion, and Reports-to card presence/absence on interaction. It also owns the Avatar palette className assertions (enabled by PBI 02's className-not-style contract) and the id-uniqueness assertion for the EMPLOYEES fixture (enabled by PBI 01's uniqueness invariant). Nothing outside `src/app/widgets/team-roster/` is created or modified.

## Spec pointer

- .specs/team-roster/spec.md#scenarios (all 8 Gherkin scenarios)
- .specs/team-roster/spec.md#regression-guardrails (console.error spy requirement; font-family class shape guardrail)
- .specs/team-roster/spec.md#definition-of-done (npm run test:run passes; no console.error emitted)
- .specs/team-roster/spec.md#visual-contract (Avatar colors palette — className assertions)

## Files in scope

- `src/app/widgets/team-roster/RosterTable.test.tsx`

## Acceptance (from spec Contract)

**Hydration and structural guardrails:**

- [ ] A `console.error` spy is installed before rendering `<RosterTable>` and asserted to have not been called (hydration guardrail — covers Scenario "No hydration mismatch on mount").
- [ ] The test imports `EMPLOYEES` from `./employees` and asserts that all `id` values are unique (covers PBI 01 id-uniqueness invariant).

**Table rendering (Scenario "Table renders all mock employees"):**

- [ ] The table body contains exactly 6 rows.
- [ ] Each row displays the employee's name, role, department, and manager name, or `"—"` when `managerId` is null.

**Expand behavior (Scenario "Expanding a row shows the inline detail panel"):**

- [ ] Clicking the expand button on a collapsed row makes the detail panel visible in the DOM.
- [ ] After clicking, the chevron button's `aria-expanded` is `"true"`.
- [ ] The visible detail panel contains the expanded employee's name, role, and department.

**Reports-to card — with manager (Scenario "Detail panel shows Reports-to card for employee with a manager"):**

- [ ] When an employee with a non-null `managerId` is expanded, the detail panel contains a "Reports to" section with the manager's name.

**Reports-to card — no manager (Scenario "Detail panel omits Reports-to card for top-level employee"):**

- [ ] When a top-level employee (null `managerId`) is expanded, the detail panel does not contain a "Reports to" heading or card.

**Accordion collapse (Scenario "Accordion collapses previously open row when a new row is opened"):**

- [ ] After expanding employee A and then clicking the expand button for employee B, employee A's detail panel is no longer visible.
- [ ] Employee B's detail panel is visible.

**Collapse on re-click (Scenario "Clicking the expand button on an open row collapses it"):**

- [ ] Clicking the expand button on an already-expanded row makes the detail panel disappear from the DOM.
- [ ] After collapsing, the chevron button's `aria-expanded` is `"false"`.

**Avatar correctness (Scenario "Avatar renders initials, not an image"):**

- [ ] No `<img>` element exists inside any Avatar component rendered in the table.
- [ ] Each Avatar contains exactly two uppercase characters matching the employee's initials (first letter of first word + first letter of last word of `name`).
- [ ] For an employee whose `name.charCodeAt(0) % 5 === 0`, the Avatar's root element `className` contains `bg-[#1E3A5F]` and `text-[#93C5FD]`.
- [ ] For an employee whose `name.charCodeAt(0) % 5 === 1`, the Avatar's root element `className` contains `bg-[#1B4332]` and `text-[#6EE7B7]`.
- [ ] For an employee whose `name.charCodeAt(0) % 5 === 2`, the Avatar's root element `className` contains `bg-[#3B1F5E]` and `text-[#C4B5FD]`.

> **Note — palette indices 3 and 4:** Coverage for `name.charCodeAt(0) % 5 === 3` (`bg-[#4C1D24]` / `text-[#FCA5A5]`) and `% 5 === 4` (`bg-[#451A03]` / `text-[#FCD34D]`) is provided by `Avatar.test.tsx` (PBI 02) using synthetic names chosen to hit those slots. The `EMPLOYEES` fixture uses real employee names and deliberately does not include anyone whose first-character code happens to fall in palette slots 3 or 4; synthesizing names into the fixture solely to hit palette slots would compromise its realism. `RosterTable.test.tsx` therefore only asserts palette indices 0, 1, and 2, which the real fixture does reach. All five palette slots remain covered end-to-end across the test suite.

**Quality gates:**

- [ ] `npm run test:run` passes with no skipped or failing tests.
- [ ] No imports from any file outside `src/app/widgets/team-roster/`.
- [ ] `npm run lint` passes with no errors after adding this file.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
- Scenario(s): .specs/team-roster/spec.md — all 8 scenarios: "Table renders all mock employees", "Expanding a row shows the inline detail panel", "Detail panel shows Reports-to card for employee with a manager", "Detail panel omits Reports-to card for top-level employee", "Accordion collapses previously open row when a new row is opened", "Clicking the expand button on an open row collapses it", "Avatar renders initials, not an image", "No hydration mismatch on mount".

## Dependencies

- Requires: PBI 01 (employees.ts), PBI 02 (Avatar.tsx), PBI 03 (RosterTable.tsx)

## Refinement rule

If reality diverges from the spec while implementing, stop and request a `/spec update team-roster` rather than improvising.
