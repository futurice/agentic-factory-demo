# PBI 01: Pomodoro widget at `/widgets/pomodoro`

## Directive

Create the self-contained Pomodoro widget under `src/app/widgets/pomodoro/`: a server-component route, a client-side `PomodoroCard` owning the `idle | running | paused | completed` state machine and the `setInterval` lifecycle, a pure `formatMmSs` helper, and Vitest coverage for both the helper and the card. Add `Space_Grotesk` (700) and `Inter` (400) from `next/font/google` to `src/app/layout.tsx` as `--font-space-grotesk` and `--font-inter` CSS variables on `<html>`, leaving the existing Geist variables untouched. Render the settings gear as a decorative element (`aria-hidden="true"`, not a `<button>`, no click handler). Inline color/spacing/typography literals from Figma node `1:3` as Tailwind utility values; introduce no shared theme tokens, no files under `src/lib/` or `src/components/`, and no upward (`../`) imports out of the widget folder. Scope is the widget plus the narrow `layout.tsx` font addition; the home route is out of scope (PBI 02).

## Spec pointer

- .specs/pomodoro/spec.md#blueprint (Decisions 2 and 3, Architecture, State machine, Constraints)
- .specs/pomodoro/spec.md#contract

## Files in scope

- `src/app/widgets/pomodoro/page.tsx` (new, server component)
- `src/app/widgets/pomodoro/PomodoroCard.tsx` (new, `"use client"`)
- `src/app/widgets/pomodoro/PomodoroCard.test.tsx` (new)
- `src/app/widgets/pomodoro/format-time.ts` (new)
- `src/app/widgets/pomodoro/format-time.test.ts` (new)
- `src/app/layout.tsx` (modified: add `Space_Grotesk` + `Inter` font variables alongside Geist)

## Acceptance (from spec Contract)

- [ ] `src/app/widgets/pomodoro/page.tsx` exists and is a server component (no `"use client"` directive on the file).
- [ ] `src/app/widgets/pomodoro/PomodoroCard.tsx` exists and starts with `"use client"`.
- [ ] `src/app/widgets/pomodoro/format-time.ts` exports a pure function `formatMmSs(seconds: number): string` returning a zero-padded `MM:SS` string for non-negative integer inputs.
- [ ] Visiting `/widgets/pomodoro` renders an element with accessible name "Work Time" (queryable via `getByRole("heading", { name: /work time/i })`).
- [ ] Visiting `/widgets/pomodoro` renders an element whose text content is exactly `25:00` on initial mount.
- [ ] Visiting `/widgets/pomodoro` renders a button with accessible name matching `/start|play/i` and a button with accessible name matching `/reset/i`.
- [ ] The settings gear element on the card has `aria-hidden="true"` and is not a `<button>` (verified by `queryByRole("button", { name: /settings/i })` returning `null`).
- [ ] `src/app/layout.tsx` imports `Space_Grotesk` and `Inter` from `next/font/google` and applies their CSS variables (`--font-space-grotesk`, `--font-inter`) on the `<html>` element alongside the existing Geist variables.
- [ ] `git grep -nE "from ['\"]\\.\\./" src/app/widgets/pomodoro` returns no matches.
- [ ] No new file is added under `src/lib/` or `src/components/` by this PBI.
- [ ] The existing `src/smoke.test.tsx` continues to pass unchanged.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
- Scenarios:
  - "Idle render of the Pomodoro card" (.specs/pomodoro/spec.md, Scenarios block)
  - "Start transitions idle to running and decrements once per second"
  - "Pause freezes the displayed time"
  - "Reset returns to the initial work time"
  - "Reset while paused returns to idle"
  - "Timer reaches zero and stops"
  - "format-time helper zero-pads minutes and seconds"
  - "Widget route is reachable without the home route"
  - "Settings gear is decorative"
  - "Widget remains isolated" (the `from '../'` half — outbound isolation)

## Dependencies

- Requires: none

## Refinement rule

If reality diverges from the spec while implementing, stop and request a `/spec update pomodoro` rather than improvising.
