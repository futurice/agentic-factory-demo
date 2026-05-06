# PBI 03: Four-segment dashed ring on the Pomodoro card

## Directive

Replace the continuous, animated progress ring on `PomodoroCard` with the static four-segment dashed pattern evidenced by Figma node `1:11` / `1:20` (re-verified live via figma-desktop MCP on 2026-05-06; the same-day correction supersedes the earlier `#155DFC` / `#1E2939` / `12px` literals). The corrected, spec-authoritative geometry is:

- SVG `viewBox="0 0 344.664 256"`.
- Two concentric `<circle>` elements at `cx=172.332`, `cy=128`, `r=115.2`, both with `stroke-width=10.24` and `fill=none`.
- **Track** `<circle>`: `stroke="#1F2937"`, no `stroke-dasharray`, no `stroke-linecap` override.
- **Foreground** `<circle>`: `stroke="#3B82F6"`, `stroke-linecap="round"`, `stroke-dasharray="120.637 60.319"` (dash subtends 60° of arc, gap subtends 30°, producing **exactly four** equal segments separated by equal gaps around the circle). Two-decimal rounding is tolerated; the binding contract is the 60°/30° proportion, four segments, 90° rotational symmetry.
- The first dash is centered at 12 o'clock — achieve this by rotating the foreground `<circle>` (or its parent `<g>`) by `-90°` about `(172.332, 128)`, **or** by an equivalent `stroke-dashoffset`. Either implementation satisfies the spec.

The ring is **static** in every timer state (`idle`, `running`, `paused`, `completed`). Drop the existing `RING_CIRCUMFERENCE`/`dashOffset` machinery and any `strokeDashoffset` value computed from `progress` / `secondsRemaining`; per the spec, running-state ring behavior is deferred until a follow-up Figma frame evidences it.

Scope is strictly `PomodoroCard.tsx` and its colocated `PomodoroCard.test.tsx`. Do not touch the timer state machine, the `setInterval` lifecycle, the button row, the settings gear, the layout, or the home route. Do not introduce new files, shared tokens, `src/lib/` or `src/components/` entries, or upward (`../`) imports out of the widget folder.

## Spec pointer

- `.specs/pomodoro/spec.md#blueprint` — Visual contract paragraph for the "Circular ring container" (the binding paragraph is the corrected one ending with the parenthetical "Amendment 2026-05-06: re-verified live against Figma node `1:11` / `1:20` …").
- `.specs/pomodoro/spec.md#contract` — Definition of Done line beginning "The ring on the Pomodoro card renders as a dashed circular stroke with **exactly four** visible `#3B82F6` arc segments …" and the final Gherkin scenario "Ring matches Figma node 1:11 (four-segment dashed pattern)".

## Files in scope

- `src/app/widgets/pomodoro/PomodoroCard.tsx`
- `src/app/widgets/pomodoro/PomodoroCard.test.tsx`

## Acceptance (from spec Contract)

- [ ] The ring SVG within the card has `viewBox="0 0 344.664 256"`.
- [ ] The ring contains a track `<circle>` with `cx=172.332`, `cy=128`, `r=115.2`, `stroke="#1F2937"`, `stroke-width=10.24`, no `stroke-dasharray`. (This explicitly updates the radius from the current `RING_RADIUS = 110` to the spec-pinned `115.2`, the stroke from `12` to `10.24`, and the track color from `#1E2939` to `#1F2937` in `PomodoroCard.tsx`.)
- [ ] The ring contains a foreground `<circle>` with `cx=172.332`, `cy=128`, `r=115.2`, `stroke="#3B82F6"`, `stroke-width=10.24`, `stroke-linecap="round"`. (This explicitly updates the foreground color from `#155DFC` to `#3B82F6`, the stroke from `12` to `10.24`, and the radius from `110` to `115.2`.)
- [ ] The foreground `<circle>`'s `stroke-dasharray` has two values whose ratio is `2:1` (numerically `≈ 120.637` and `≈ 60.319`, two-decimal rounding tolerated), producing exactly four equal visible segments 90° apart around the circle.
- [ ] The first dash is centered at the 12 o'clock position, achieved either by a `-90°` rotation about `(172.332, 128)` on the foreground `<circle>` or its parent `<g>`, **or** by an equivalent `stroke-dashoffset`.
- [ ] The four-segment pattern is invariant across all timer states — the foreground `<circle>`'s `stroke-dasharray` and `stroke-dashoffset` (if any) do **not** vary with `secondsRemaining`, `progress`, or the current state (`idle | running | paused | completed`). The `RING_CIRCUMFERENCE` constant and the `dashOffset = RING_CIRCUMFERENCE * (1 - progress)` expression currently in `PomodoroCard.tsx` are removed.
- [ ] No new file is added under `src/lib/` or `src/components/` by this PBI.
- [ ] `git grep -nE "from ['\"]\\.\\./" src/app/widgets/pomodoro` continues to return no matches.
- [ ] The existing `src/smoke.test.tsx` continues to pass unchanged.
- [ ] All scenarios authored under PBI 01 continue to pass — explicitly: "Idle render of the Pomodoro card", "Start transitions idle to running and decrements once per second", "Pause freezes the displayed time", "Reset returns to the initial work time", "Reset while paused returns to idle", "Timer reaches zero and stops", "format-time helper zero-pads minutes and seconds", "Widget route is reachable without the home route", "Settings gear is decorative", and "Widget remains isolated" (outbound isolation half).

### DoD cross-reference

Each Acceptance bullet above traces to the single dashed-ring DoD line in `.specs/pomodoro/spec.md#contract` (the line beginning "The ring on the Pomodoro card renders as a dashed circular stroke with **exactly four** visible `#3B82F6` arc segments …"). That one DoD checkbox flips green only when **every** Acceptance bullet here passes. The ring-specific Gherkin scenario "Ring matches Figma node 1:11 (four-segment dashed pattern)" is the executable counterpart.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
- Scenarios:
  - "Ring matches Figma node 1:11 (four-segment dashed pattern)" — primary acceptance scenario for this PBI.
  - "Idle render of the Pomodoro card" — regression.
  - "Start transitions idle to running and decrements once per second" — regression; confirms removing the `dashOffset` animation did not break the state machine.
  - "Pause freezes the displayed time" — regression; the previously-missing pause coverage.
  - "Reset returns to the initial work time" — regression.
  - "Reset while paused returns to idle" — regression; the previously-missing reset-from-paused coverage.
  - "Timer reaches zero and stops" — regression.
  - "format-time helper zero-pads minutes and seconds" — regression (helper is untouched but lives in the same package).
  - "Widget route is reachable without the home route" — regression.
  - "Settings gear is decorative" — regression.
  - "Widget remains isolated" (outbound `../` half) — regression.

## Dependencies

- Requires: `01-pomodoro-widget` (the file `src/app/widgets/pomodoro/PomodoroCard.tsx` must already exist with the SVG ring scaffolding being modified here).

## Refinement rule

If reality diverges from the spec while implementing, stop and request `/spec update pomodoro` rather than improvising. In particular: if the four equal arcs cannot be produced cleanly with a single `stroke-dasharray` plus a `-90°` rotation (or an equivalent `stroke-dashoffset`) against the spec-pinned `r=115.2`, `stroke-width=10.24`, and `viewBox="0 0 344.664 256"`, do **not** invent a different ring geometry, do **not** silently fall back to the previous `r=110` / `stroke-width=12` literals, and do **not** restore the `progress`-driven offset animation. Escalate so the spec can be re-verified against Figma.
