# PBI 04: `resting` state and strict work/rest alternation

> Build order: `04 → 05 → 06 → 07`. PBI 04 lands first; PBI 05 adds the dynamic ring drain on top; PBI 06 then wires the sliders against the post-05 state; PBI 07 closes with polish.

## Directive

Extend the `PomodoroCard` state machine to support strict work/rest alternation per spec Decision 6. Add `"resting"` to the `TimerState` union and introduce `workMinutes` (default `25`) and `restMinutes` (default `5`) as `useState` values inside `PomodoroCard.tsx`. When a `running` work interval reaches `0`, transition to `resting` with `secondsRemaining = restMinutes * 60` and the card title text "Rest Time"; when a `resting` interval reaches `0`, transition to `running` (a fresh work interval) with `secondsRemaining = workMinutes * 60` and title "Work Time". Reset always returns to `idle` with `secondsRemaining = workMinutes * 60` and title "Work Time"; the play/pause button shows the pause icon (accessible name matches `/pause/i`) in both `running` and `resting` and the play icon (matches `/start|play|resume/i`) in `idle` and `paused`. Card title text is dynamic: `"Work Time"` in `idle | running | paused | completed`, `"Rest Time"` in `resting`. The `completed` member of the union is retained but no transition produces it under this PBI. No settings UI, no ring-drain math, no polish utilities — those land in PBIs 05–07.

**Ring contract during this PBI:** the ring continues to render the four-segment static pattern PBI 03 already ships in **every** state — `idle`, `running`, `paused`, and the new `resting` state. The dynamic drain (including the `resting`-state branch with `restMinutes * 60` denominator) lands in PBI 05. Do not introduce any `pathLength` attribute, `stroke-dasharray="1 1"`, or per-state `stroke-dashoffset` arithmetic in this PBI; the `running → resting` and `resting → running` transitions reassign `secondsRemaining` only, not ring attributes.

**Unused-setter guidance.** The two new `useState` values introduce setters that have no UI consumer until PBI 06 ships sliders, and no ring consumer until PBI 05 ships the dynamic drain. The repo's eslint config flags unused locals as `@typescript-eslint/no-unused-vars` and that fails `npm run lint` — blocking the gate. `setWorkMinutes` already has a natural consumer via reset (reset re-reads `workMinutes` and the simplest implementation re-applies it through the setter), so wire reset through `setWorkMinutes` if it isn't already. `setRestMinutes` is the genuine concern: there is no natural consumer until PBI 06. Resolve in this order of preference: (1) wire a temporary internal consumer that genuinely uses `setRestMinutes` (e.g. reset writes both `setWorkMinutes(workMinutes)` and `setRestMinutes(restMinutes)` as a no-op identity reassignment, or the `resting → running` transition routes through `setRestMinutes` on the next entry); (2) only as a fallback, attach a narrowly-scoped `// eslint-disable-next-line @typescript-eslint/no-unused-vars` comment to the **specific** declaration line for `setRestMinutes`. Do not blanket-disable the rule, do not disable it file-wide, and do not introduce `_setRestMinutes` underscore-prefix renames if they don't satisfy the project lint config.

Scope is strictly `PomodoroCard.tsx` and its colocated test file; no new files, no shared tokens, no upward imports.

## Spec pointer

- .specs/pomodoro/spec.md#blueprint — Decision 6, "State machine for the timer card"
- .specs/pomodoro/spec.md#contract — "Strict-alternation cycle (Decision 6)"

## Files in scope

- `src/app/widgets/pomodoro/PomodoroCard.tsx`
- `src/app/widgets/pomodoro/PomodoroCard.test.tsx`

## Acceptance (from spec Contract)

- [ ] The `TimerState` union in `PomodoroCard.tsx` includes the literal `"resting"`.
- [ ] `workMinutes` and `restMinutes` exist as `useState` values in `PomodoroCard.tsx` with defaults `25` and `5` respectively (no setters wired to UI yet — that lands in PBI 06).
- [ ] When `running` from a work interval and `secondsRemaining` reaches `0`, the state becomes `resting`, `secondsRemaining` is reassigned to `restMinutes * 60`, and the card title text becomes "Rest Time".
- [ ] When in `resting` and `secondsRemaining` reaches `0`, the state becomes `running`, `secondsRemaining` is reassigned to `workMinutes * 60`, and the card title text becomes "Work Time".
- [ ] Reset from any state returns the card to `idle` with `secondsRemaining = workMinutes * 60` and title "Work Time".
- [ ] The play/pause button's accessible name matches `/pause/i` in both `running` and `resting`, and `/start|play|resume/i` in `idle` and `paused`.
- [ ] No new file is added under `src/lib/` or `src/components/` by this PBI.
- [ ] `git grep -nE "from ['\"]\\.\\./" src/app/widgets/pomodoro` continues to return no matches.
- [ ] The existing `src/smoke.test.tsx` continues to pass unchanged.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
- Scenarios:
  - "Work interval reaching zero advances to resting (strict alternation)"
  - "Rest interval reaching zero advances to a fresh work interval"
  - "Reset returns to the initial work time" (regression — title and seconds reassignment now read `workMinutes`)
  - "Reset while paused returns to idle" (regression)
  - "Start transitions idle to running and decrements once per second" (regression)
  - "Pause freezes the displayed time" — this PBI owns only the seconds-frozen half of spec scenario "Pause freezes the displayed time and the ring offset". Implement the test as a single `it("pause freezes the displayed time", ...)` block asserting only the time-frozen behavior, plus a sibling `it.todo("pause freezes the ring offset")` placeholder. PBI 05's verification fills in the `it.todo` (see PBI 05 cross-handoff). Do **not** assert any `stroke-dashoffset` behavior in this PBI's test file.

## Dependencies

- Requires: `01-pomodoro-widget` (the `PomodoroCard` scaffold and test file already exist).

## Refinement rule

If reality diverges from the spec while implementing, stop and request a `/spec update pomodoro` rather than improvising.
