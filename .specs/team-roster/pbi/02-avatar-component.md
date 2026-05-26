# PBI 02: Avatar component

## Directive

Create `src/app/widgets/team-roster/Avatar.tsx`, a server-renderable React component that renders an employee's initials inside a colored circle. The component accepts `name: string` and `size: "sm" | "lg"` props. Color is derived deterministically from `name.charCodeAt(0) % 5` using the fixed five-color palette defined in the Visual Contract. Colors must be applied via Tailwind `className` attributes — not via inline `style={{}}` props — so that tests can assert palette correctness via className substring matching. No `"use client"` directive, no browser API reads, no `Math.random()` at render time. The component never renders an `<img>` element. Nothing outside `src/app/widgets/team-roster/` is created or modified.

## Spec pointer

- .specs/team-roster/spec.md#architecture (Avatar.tsx description)
- .specs/team-roster/spec.md#decisions (Decision 2: avatar initials and deterministic color)
- .specs/team-roster/spec.md#visual-contract (Avatar colors section; size dimensions)
- .specs/team-roster/spec.md#definition-of-done (Avatar initials, no img tag, no "use client" in Avatar.tsx)

## Files in scope

- `src/app/widgets/team-roster/Avatar.tsx`

## Acceptance (from spec Contract)

- [ ] `Avatar.tsx` accepts props `name: string` and `size: "sm" | "lg"`.
- [ ] The rendered element for `size="sm"` has Tailwind classes encoding `32px × 32px` and `border-radius: 9999px` (e.g. `w-8 h-8 rounded-full`).
- [ ] The rendered element for `size="lg"` has Tailwind classes encoding `48px × 48px` and `border-radius: 9999px` (e.g. `w-12 h-12 rounded-full`).
- [ ] The displayed text is exactly two uppercase characters: the first letter of the first word and the first letter of the last word of `name`.
- [ ] The background and text color are chosen from the five-palette table in the spec using `name.charCodeAt(0) % 5`; the same `name` always produces the same color.
- [ ] Colors are applied via className, not inline `style={{}}`. Specifically, the root element's `className` contains each of the following substrings for the corresponding palette slot:
  - Index 0 (`name.charCodeAt(0) % 5 === 0`): `bg-[#1E3A5F]` and `text-[#93C5FD]`
  - Index 1: `bg-[#1B4332]` and `text-[#6EE7B7]`
  - Index 2: `bg-[#3B1F5E]` and `text-[#C4B5FD]`
  - Index 3: `bg-[#4C1D24]` and `text-[#FCA5A5]`
  - Index 4: `bg-[#451A03]` and `text-[#FCD34D]`
- [ ] No `<img>` element is rendered.
- [ ] The file contains no `"use client"` directive.
- [ ] The file contains no browser API calls (`window`, `document`, `navigator`, etc.).
- [ ] The file contains no imports from any file outside `src/app/widgets/team-roster/`.
- [ ] `npm run lint` passes with no errors after adding this file.
- [ ] `npx tsc --noEmit` passes after adding this file.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit`
- Scenario(s): .specs/team-roster/spec.md — Scenario "Avatar renders initials, not an image". Palette className correctness is verified by PBI 05's tests via className substring assertions.

## Dependencies

- Requires: none

## Refinement rule

If reality diverges from the spec while implementing, stop and request a `/spec update team-roster` rather than improvising.
