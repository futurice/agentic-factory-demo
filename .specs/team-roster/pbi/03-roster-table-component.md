# PBI 03: RosterTable client component

## Directive

Create `src/app/widgets/team-roster/RosterTable.tsx`, the `"use client"` component that owns accordion expansion state and renders the full card surface plus the `<table>` with inline detail panels. The component is responsible for the entire card wrapper — background `#101828`, border `1px solid #1E2939`, radius `10px`, and padding `24px` — as well as all table rows, chevron controls, and expanded detail panels. It imports `EMPLOYEES` and `Employee` from `./employees` and `Avatar` from `./Avatar`. Columns rendered: Avatar+Name, Role, Department, Manager, and a chevron expand control.

**Accessibility implementation (option a — elected):** The expand control is rendered as a real `<button type="button">` within the chevron column cell. The `<tr>` itself is not `role="button"`. The button carries `aria-expanded`, `aria-label`, and `aria-controls`; the expanded row's `<td>` carries the matching `id`. This is the cleaner shape and matches the spec's "chevron button" phrasing throughout.

All Visual Contract tokens (colors, spacing, typography class names, accessibility attributes) must be applied. Every font-family CSS variable binding in this file must use the explicit arbitrary-property form `[font-family:var(--font-inter)]` or `[font-family:var(--font-space-grotesk)]` — the shorthand `font-[var(--font-` form is forbidden (spec Regression Guardrail). No new `npm` packages; `lucide-react` (`ChevronDown`) is the only icon dependency. Nothing outside `src/app/widgets/team-roster/` is created or modified.

Structural and visual correctness is the scope of this PBI. Behavioral correctness (accordion state transitions) is verified by PBI 05's test scenarios.

## Spec pointer

- .specs/team-roster/spec.md#architecture (RosterTable.tsx description)
- .specs/team-roster/spec.md#decisions (Decisions 1, 4, 5)
- .specs/team-roster/spec.md#visual-contract (Card surface — Option A; Table row structure; Expanded detail panel; Accessibility floor; Spacing — Rhythm 2; Avatar colors; Typography — Scale 2)
- .specs/team-roster/spec.md#definition-of-done (all structural items through "No widget-specific code exists in src/lib/" plus font-className guardrail)
- .specs/team-roster/spec.md#regression-guardrails (font-family class shape guardrail; console.error / hydration guardrail)

## Files in scope

- `src/app/widgets/team-roster/RosterTable.tsx`

## Acceptance (from spec Contract)

**Component boundary and server-safety:**

- [ ] `RosterTable.tsx` begins with `"use client"`.
- [ ] No imports from any file outside `src/app/widgets/team-roster/`.
- [ ] `git grep -nE "font-\[var\(--font-" src/app/widgets/team-roster/RosterTable.tsx` returns zero matches (font-family class shape guardrail).

**Card root tokens:**

- [ ] The card root element's `className` includes `bg-[#101828]`.
- [ ] The card root element's `className` includes a border token equivalent to `border border-[#1E2939]`.
- [ ] The card root element's `className` includes a radius token equivalent to `rounded-[10px]`.
- [ ] The card root element's `className` includes a padding token equivalent to `p-[24px]`.

**Row and cell tokens:**

- [ ] Each non-expanded data row's `className` includes a hover token of `hover:bg-[#1E2939]`.
- [ ] An expanded row's `className` includes `bg-[#1E2939]` (marking the active row).
- [ ] The avatar+name cell uses `gap-[8px]` between the avatar and the name text.

**Expanded detail panel tokens:**

- [ ] The expanded detail panel `<td>` or its direct wrapper has `className` containing `bg-[#0F172A]`.
- [ ] The expanded detail panel has padding encoded as `py-[20px] px-[24px]` or `p-[20px_24px]` (or equivalent Tailwind arbitrary values totalling `20px` top/bottom and `24px` left/right).
- [ ] The expanded detail panel layout is horizontal flex with `gap-[24px]` between the large avatar, the text block, and the "Reports to" card.
- [ ] The gap between the table content and the card border internally is `gap-[16px]` (e.g. on the inner wrapper).
- [ ] Sections within the expanded detail panel are separated by `gap-[12px]`.

**"Reports to" card tokens:**

- [ ] The "Reports to" card element's `className` includes `bg-[#101828]`.
- [ ] The "Reports to" card element's `className` includes `border border-[#1E2939]`.
- [ ] The "Reports to" card element's `className` includes `rounded-[8px]`.
- [ ] The "Reports to" card element's `className` includes `p-[12px]`.

**Chevron and interactivity:**

- [ ] Each expand control is a `<button type="button">` rendered inside the chevron column cell (option a of spec Accessibility floor).
- [ ] Each chevron button has `aria-expanded` (boolean string matching expansion state).
- [ ] Each chevron button has `aria-label` identifying the employee by name (e.g. `aria-label="Expand Ada Lovelace"`).
- [ ] Each chevron button has `aria-controls` whose value matches the `id` on the corresponding expanded detail row's `<td>` (or wrapping element).
- [ ] The `ChevronDown` icon rotates `180deg` when the row is expanded (CSS transform, transition `150ms ease`).
- [ ] Chevron buttons have `focus-visible:ring-2 focus-visible:ring-[#3B82F6]`.

**Table structure:**

- [ ] The component renders a `<table>` with exactly 6 `<tbody>` rows when given the mock `EMPLOYEES` fixture (one row per employee; expanded detail panels are additional rows but do not count toward the 6).
- [ ] Each expanded detail row's `<td>` has `colSpan={5}`.
- [ ] For an employee with `managerId: null`, the detail panel renders no "Reports to" card.
- [ ] For an employee with a non-null `managerId`, the detail panel renders a "Reports to" card.

**Quality gates:**

- [ ] `npm run lint` passes with no errors after adding this file.
- [ ] `npx tsc --noEmit` passes after adding this file.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit`
- Behavioral correctness (expand/collapse, accordion single-open, Reports-to card present/absent on click) is verified by PBI 05's test scenarios: "Expanding a row shows the inline detail panel", "Accordion collapses previously open row when a new row is opened", "Clicking the expand button on an open row collapses it", "Detail panel shows Reports-to card for employee with a manager", "Detail panel omits Reports-to card for top-level employee", "No hydration mismatch on mount".

## Dependencies

- Requires: PBI 01 (employees.ts), PBI 02 (Avatar.tsx)

## Refinement rule

If reality diverges from the spec while implementing, stop and request a `/spec update team-roster` rather than improvising.
