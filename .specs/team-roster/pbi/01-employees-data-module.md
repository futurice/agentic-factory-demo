# PBI 01: Employees data module

## Directive

Create the pure TypeScript data module `src/app/widgets/team-roster/employees.ts`. It exports the `Employee` type and the `EMPLOYEES` constant array containing exactly 6 mock records. At least one record has `managerId: null` (top-level employee). All non-null `managerId` values reference an `id` that exists within the same array. Every `id` in the array is unique (no two employees share the same `id`). The file has no `"use client"` directive, no React imports, no browser API calls, and no `Math.random()`. Nothing outside `src/app/widgets/team-roster/` is created or modified.

## Spec pointer

- .specs/team-roster/spec.md#architecture (Data model section)
- .specs/team-roster/spec.md#decisions (Decision 3: manager denormalization)
- .specs/team-roster/spec.md#definition-of-done (items: 6 rows, managerId null edge case, no "use client" in employees.ts)

## Files in scope

- `src/app/widgets/team-roster/employees.ts`

## Acceptance (from spec Contract)

- [ ] `employees.ts` exports a `type Employee` with fields `id: string`, `name: string`, `role: string`, `department: string`, `managerId: string | null`.
- [ ] `employees.ts` exports a `const EMPLOYEES: Employee[]` array with exactly 6 elements.
- [ ] At least one `Employee` record has `managerId: null`.
- [ ] All non-null `managerId` values reference an `id` that exists within the same `EMPLOYEES` array.
- [ ] No two employees in `EMPLOYEES` share the same `id` (uniqueness invariant — verifiable by a unit assertion or an inline TS const-array check that confirms all ids are distinct).
- [ ] The file contains no `"use client"` directive.
- [ ] The file contains no imports from any file outside `src/app/widgets/team-roster/`.
- [ ] `npm run lint` passes with no errors after adding this file.
- [ ] `npx tsc --noEmit` passes after adding this file.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit`
- Scenario(s): .specs/team-roster/spec.md — Scenario "Table renders all mock employees" (data fixture drives the 6-row assertion).

## Dependencies

- Requires: none

## Refinement rule

If reality diverges from the spec while implementing, stop and request a `/spec update team-roster` rather than improvising.
