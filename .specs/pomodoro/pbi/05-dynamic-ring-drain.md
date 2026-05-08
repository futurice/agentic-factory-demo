# PBI 05: Dynamic ring drain (`pathLength=1`, clockwise, work/rest-aware)

> Build order: `04 → 05 → 06 → 07`. PBI 05 ships immediately after PBI 04 and **before** PBI 06; PBI 06's rest-length slider scenario depends on the ring already being phase-aware.

## Directive

Restore the elapsed/remaining ring visualization that PBI 03 (`b459920`) regressed against, in the form pinned by spec Decisions 4 and 7. In `idle`, preserve the four-segment dashed pattern PBI 03 already ships (no `pathLength` attribute, two-value `2:1` `stroke-dasharray`). In `running`, `paused`, and `resting`, the foreground `<circle>` switches to `pathLength="1"`, `stroke-dasharray="1 1"`, and `stroke-dashoffset = elapsed / duration` where `duration = workMinutes * 60` while the active phase is work (states `running` from a work interval and `paused` mid-work) and `restMinutes * 60` while in `resting`, and `elapsed = duration − secondsRemaining`. Direction of drain is **clockwise from the 12 o'clock anchor** (the visible arc retracts clockwise as time elapses), achieved by combining the existing `−90°` rotation about `(172.332, 128)` with positive `stroke-dashoffset` or any equivalent SVG construction. On `running → paused`, both `stroke-dasharray` and `stroke-dashoffset` freeze at their current values. On phase advance, `secondsRemaining` is reassigned and `stroke-dashoffset` resets to `0`. On reset, the foreground returns to the four-segment `idle` form (no `pathLength`, 2:1 dasharray, `stroke-dashoffset` `0` or absent). Numeric values may be rounded to four decimals (tolerance ±`0.005`); the proportions and direction are the binding contract. Per spec Contract C5, this PBI is **explicitly authorized** to replace the cross-state ring-invariance test currently at `PomodoroCard.test.tsx:167-190` with per-state ring assertions; that replacement is not a regression. Scope is strictly `PomodoroCard.tsx` and its test file; no new files, no shared tokens, no upward imports, no polish utilities (those land in PBI 07).

## Spec pointer

- .specs/pomodoro/spec.md#blueprint — Decisions 4 and 7, "Circular ring container" paragraph (the binding `pathLength=1` block; the deprecated explicit-circumference block is preserved for audit only)
- .specs/pomodoro/spec.md#contract — "Ring contract (Decisions 4 + 7)" and "Test rewrite authorization (C5)" — first bullet

## Files in scope

- `src/app/widgets/pomodoro/PomodoroCard.tsx`
- `src/app/widgets/pomodoro/PomodoroCard.test.tsx`

## Acceptance (from spec Contract)

- [ ] In `idle`, the foreground `<circle>` does **not** carry a `pathLength` attribute and its `stroke-dasharray` is the two-value 2:1 form (`≈ 120.637` and `≈ 60.319`, two-decimal tolerance) — unchanged from PBI 03.
- [ ] In `running` and `paused`, the foreground `<circle>` carries `pathLength="1"` and `stroke-dasharray="1 1"`, and `stroke-dashoffset = elapsed / (workMinutes * 60)` where `elapsed = workMinutes * 60 − secondsRemaining` (tolerance ±`0.005`). At `idle → running` the offset is `0`; at `secondsRemaining = 0` the offset is `1`; at `secondsRemaining = (workMinutes * 60) / 2` the offset is `0.5`.
- [ ] In `resting`, the foreground `<circle>` carries `pathLength="1"` and `stroke-dasharray="1 1"`, and `stroke-dashoffset = elapsed / (restMinutes * 60)` where `elapsed = restMinutes * 60 − secondsRemaining` (tolerance ±`0.005`).
- [ ] On `running → paused`, the `stroke-dashoffset` does not change while paused (verified by a Vitest scenario that pauses, advances 5000 ms, and asserts the offset attribute is unchanged).
- [ ] On phase advance (`running` work → `resting`, or `resting` → `running` work), the foreground `<circle>`'s `stroke-dashoffset` is approximately `0` (tolerance ±`0.005`) at the moment of transition.
- [ ] The visible arc retracts **clockwise** from the 12 o'clock anchor as time elapses.
- [ ] On reset, the foreground `<circle>` no longer carries a `pathLength` attribute, the `stroke-dasharray` returns to the two-value 2:1 form, and the `stroke-dashoffset` is `0` or absent.
- [ ] The cross-state ring-invariance test at `PomodoroCard.test.tsx:167-190` ("ring pattern is invariant across timer states") is replaced (or removed and superseded) by per-state ring assertions matching the bullets above. This replacement is authorized by spec Contract C5 and is not a regression.
- [ ] No new file is added under `src/lib/` or `src/components/` by this PBI.
- [ ] `git grep -nE "from ['\"]\\.\\./" src/app/widgets/pomodoro` continues to return no matches.
- [ ] The existing `src/smoke.test.tsx` continues to pass unchanged.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
- Scenarios:
  - "Ring at idle renders the four-segment dashed pattern (Figma node 1:11)" — regression for the idle form PBI 03 already ships.
  - "Ring switches to single-arc dasharray on start (Option A, pathLength=1)"
  - "Ring drains clockwise as time elapses (Option A, pathLength=1)"
  - "Ring freezes its progress when paused (Option A, pathLength=1)"
  - "Ring during resting uses restMinutes as denominator"
  - "Ring returns to four-segment idle pattern on reset"
  - "Pause freezes the displayed time and the ring offset" — completes the offset-frozen half deferred from PBI 04. Concretely: replace the `it.todo("pause freezes the ring offset")` placeholder PBI 04 left in `PomodoroCard.test.tsx` with a real `it(...)` block that asserts the foreground `<circle>`'s `stroke-dashoffset` is unchanged after a 5000 ms timer advance while paused. PBI 04's sibling `it("pause freezes the displayed time", ...)` block continues to pass unchanged.
  - "Work interval reaching zero advances to resting (strict alternation)" — regression; asserts `stroke-dashoffset ≈ 0` at the transition.
  - "Rest interval reaching zero advances to a fresh work interval" — regression; same.

## Dependencies

- Requires: `04-resting-state-alternation` (the `resting` state and `workMinutes`/`restMinutes` values must exist before the ring math can read them as denominator inputs).

## Refinement rule

If reality diverges from the spec while implementing, stop and request a `/spec update pomodoro` rather than improvising. In particular: if a clockwise drain cannot be produced cleanly with the existing `−90°` rotation plus a positive `stroke-dashoffset`, do not invent an alternate denominator, do not switch back to the deprecated explicit-circumference form, and do not introduce a separate animated `<circle>`. Escalate so the spec can be re-verified against Figma.
