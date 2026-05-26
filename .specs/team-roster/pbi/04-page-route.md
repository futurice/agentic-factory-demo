# PBI 04: Page route

## Directive

Create `src/app/widgets/team-roster/page.tsx`, the Next.js App Router server component that registers the route `/widgets/team-roster`. The page renders the widget heading with the exact text literal `"Team Roster"` styled with the gradient text token from the Visual Contract, and renders `<RosterTable />` directly below the heading. The page does not own or wrap the card surface — `RosterTable` is responsible for its own card wrapper. The page must not contain a `"use client"` directive.

Every font-family CSS variable binding in this file must use the explicit arbitrary-property form `[font-family:var(--font-space-grotesk)]` — the shorthand `font-[var(--font-` form is forbidden (spec Regression Guardrail). No new `npm` packages. Nothing outside `src/app/widgets/team-roster/` is created or modified.

## Spec pointer

- .specs/team-roster/spec.md#architecture (page.tsx description: "renders the widget heading and the `<RosterTable>` client component")
- .specs/team-roster/spec.md#decisions (Decision 4: page.tsx is a server component)
- .specs/team-roster/spec.md#visual-contract (Page heading typography: text literal "Team Roster", Space Grotesk Bold 28px/32px, gradient linear-gradient(90deg, #51A2FF 0%, #AD46FF 100%); gap-[20px] between heading and card)
- .specs/team-roster/spec.md#definition-of-done (route renders without errors; no "use client" in page.tsx; heading text "Team Roster" with gradient className encoding; font-className guardrail)
- .specs/team-roster/spec.md#regression-guardrails (font-family class shape guardrail)

## Files in scope

- `src/app/widgets/team-roster/page.tsx`

## Acceptance (from spec Contract)

- [ ] `page.tsx` does not contain a `"use client"` directive.
- [ ] The route `/widgets/team-roster` renders without runtime errors (`npm run build` passes).
- [ ] The page heading element has the exact text content `"Team Roster"`.
- [ ] The page heading element's `className` includes a Tailwind arbitrary-value utility encoding the gradient `linear-gradient(90deg, #51A2FF 0%, #AD46FF 100%)` (e.g. `bg-[linear-gradient(90deg,#51A2FF_0%,#AD46FF_100%)]` or equivalent).
- [ ] The page heading element's `className` encodes `font-bold`, Space Grotesk font via `[font-family:var(--font-space-grotesk)]` (the explicit arbitrary-property form), `text-[28px]`, and `leading-[32px]`.
- [ ] The page renders `<RosterTable />` with a `gap-[20px]` (or equivalent) spacing between the heading and the component.
- [ ] `page.tsx` does not render any card wrapper element — no `bg-[#101828]` class appears on any element in `page.tsx`.
- [ ] No imports from any file outside `src/app/widgets/team-roster/`.
- [ ] `git grep -nE "font-\[var\(--font-" src/app/widgets/team-roster/page.tsx` returns zero matches (font-family class shape guardrail).
- [ ] `npm run lint` passes with no errors after adding this file.
- [ ] `npm run build` passes after adding this file.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run build`
- Scenario(s): .specs/team-roster/spec.md — Scenario "Table renders all mock employees" (the route must resolve for the table to render).

## Dependencies

- Requires: PBI 03 (RosterTable.tsx)

## Refinement rule

If reality diverges from the spec while implementing, stop and request a `/spec update team-roster` rather than improvising.
