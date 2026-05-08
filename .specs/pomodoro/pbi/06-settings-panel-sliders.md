# PBI 06: Settings button, collapsible panel, and Work/Rest length sliders

> Build order: `04 → 05 → 06 → 07`. PBI 06 lands **after** PBI 05 because both modify `PomodoroCard.tsx` and its colocated test, and the rest-length slider scenario benefits from the ring already being phase-aware. Pinning 05 → 06 also avoids merge contention on the same two files.

## Directive

Replace the decorative `aria-hidden` settings gear with a real `<button type="button">` whose accessible name is "Settings" (the existing gear glyph becomes that button's child icon). Clicking the button toggles a collapsible `<section aria-label="Timer settings">` rendered inside the card; the panel is collapsed by default. When open, the panel contains exactly two `<input type="range">` sliders: "Work length" (`min="5"`, `max="60"`, `step="1"`, default `25`, bound to the `workMinutes` state introduced in PBI 04) and "Rest length" (`min="1"`, `max="30"`, `step="1"`, default `5`, bound to `restMinutes`). Each slider row shows its name and current value (e.g. `"Work length — 25 min"`) via an `<label>` and uses Tailwind utilities for the existing palette only (`bg-[#101828]` or `bg-[#0B1220]` panel root, `border-[#1E2939]` divider, `accent-[#3B82F6]` on each `<input type="range">`). State is **session-only**: both sliders return to their defaults after a hard reload (no `localStorage`, `sessionStorage`, cookies, or URL persistence). While `idle`, the time display tracks `workMinutes * 60` so changing the Work length slider to `30` immediately updates the display to `30:00`; while a phase is active, slider changes do not retroactively rescale the current `secondsRemaining` — the new value applies at the next entry to that phase or on reset. Per spec Contract C5, this PBI is **explicitly authorized** to replace the decorative-gear test at `PomodoroCard.test.tsx:45-48` with an assertion that a real Settings `<button>` exists; that replacement is not a regression. Scope is strictly `PomodoroCard.tsx` and its test file; no new files, no shared tokens, no upward imports, no polish utilities (hover/focus/transition land in PBI 07).

## Spec pointer

- .specs/pomodoro/spec.md#blueprint — Decision 5, "Settings button" + "Settings panel (open state)" bullets in the Visual contract
- .specs/pomodoro/spec.md#contract — "Settings button + panel (Decision 5)" and "Test rewrite authorization (C5)" — second bullet

## Files in scope

- `src/app/widgets/pomodoro/PomodoroCard.tsx`
- `src/app/widgets/pomodoro/PomodoroCard.test.tsx`

## Acceptance (from spec Contract)

- [ ] The card renders a `<button type="button">` with accessible name "Settings" (queryable via `getByRole("button", { name: /settings/i })`).
- [ ] On initial mount, no element with accessible name "Timer settings" is in the document; clicking the Settings button toggles the panel into and out of the document (or hides it such that `queryByRole("region", { name: /timer settings/i })` returns `null`).
- [ ] When open, the panel contains exactly two `<input type="range">` elements: one with accessible name matching `/work length/i` (`min="5"`, `max="60"`, `step="1"`, default `value="25"`) bound to `workMinutes`, and one with accessible name matching `/rest length/i` (`min="1"`, `max="30"`, `step="1"`, default `value="5"`) bound to `restMinutes`.
- [ ] When the user changes the Work length slider to `30` while in `idle`, the time display updates to `30:00` within the same render.
- [ ] When the user changes the Rest length slider to `10` while in `idle`, then clicks Start, then advances timers until the work interval reaches `00:00`, the card transitions to `resting` and the time display shows `10:00`.
- [ ] After a hard reload of `/widgets/pomodoro` (modeled by fully unmounting and re-mounting `<PomodoroCard />` in a Vitest scenario), both sliders return to their defaults (`25` and `5`).
- [ ] Slider changes mid-interval do not modify the current `secondsRemaining`; verified by a Vitest scenario that starts the timer, advances 10 seconds, slides Work length to `45`, and asserts the time display is unchanged from the value it held immediately before the slider change.
- [ ] `git grep -n "localStorage\|sessionStorage" src/app/widgets/pomodoro` returns no matches.
- [ ] The decorative-gear test at `PomodoroCard.test.tsx:45-48` is replaced (or removed and superseded) by an assertion that a real Settings `<button>` exists. This replacement is authorized by spec Contract C5 and is not a regression.
- [ ] No new file is added under `src/lib/` or `src/components/` by this PBI.
- [ ] `git grep -nE "from ['\"]\\.\\./" src/app/widgets/pomodoro` continues to return no matches.
- [ ] The existing `src/smoke.test.tsx` continues to pass unchanged.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
- Scenarios:
  - "Settings panel toggles open and closed"
  - "Sliders default to 25 and 5 minutes after reload"
  - "Changing Work length while idle updates the time display"
  - "Changing Rest length while idle does not change the time display"
  - "Slider changes mid-running do not retroactively rescale the current interval"
  - "Slider boundaries"
  - "User opens settings panel during resting"
  - "No persistence is added"
  - "Idle render of the Pomodoro card" — regression; the Settings button now exists and the Timer settings region does not.

## Dependencies

- Requires: `04-resting-state-alternation` (the sliders mutate the `workMinutes` / `restMinutes` `useState` values introduced there; the rest-length scenario also exercises the `running → resting` transition).
- Requires: `05-dynamic-ring-drain` (build-order pin: PBI 05 and PBI 06 both modify `PomodoroCard.tsx` plus its colocated test, so they cannot land in parallel without merge contention. Sequencing 05 → 06 also lets the rest-length slider scenario assert against ring-aware behavior already in tree).

## Refinement rule

If reality diverges from the spec while implementing, stop and request a `/spec update pomodoro` rather than improvising.
