# PBI 08: Dim ring track color from `#1F2937` to `#111827`

> Build order: standalone follow-up to PBIs 01–07 (all already shipped). No sibling PBI in flight; this lands as a single atomic merge unit.

## Directive

Apply spec Decision 8 (Amendment 2026-05-08 #2): change the ring's static track `<circle>` stroke literal in `src/app/widgets/pomodoro/PomodoroCard.tsx` from `#1F2937` to `#111827`. This is the backdrop circle behind the foreground remaining-time arc; it must read as a significantly dimmer shade against the card background `#101828` while the foreground `<circle>` continues to use `stroke="#3B82F6"` as the dominant remaining-time cue.

Everything else about the ring is untouched: `viewBox="0 0 344.664 256"`, both `<circle>`s at `cx=172.332`, `cy=128`, `r=115.2`, `stroke-width=10.24`, the foreground `stroke-linecap="round"`, the `−90°` anchor rotation, the foreground `pathLength="1"` / `stroke-dasharray="1 1"` / `stroke-dashoffset = elapsed / duration` math (Decisions 4 + 7), the four-segment idle dasharray, and the clockwise drain direction. The state machine, `setInterval` lifecycle, settings panel, sliders, button row, polish utilities, and home route are not modified.

The existing colocated test at `src/app/widgets/pomodoro/PomodoroCard.test.tsx:359` currently asserts `track.getAttribute("stroke")` equals `"#1F2937"`. That assertion is **explicitly authorized to be updated** to `"#111827"` under this PBI — the spec change is the ground truth and `/review` shall not flag the test edit as a regression (per spec Contract section "Test rewrite authorization (C5)" precedent).

Scope is strictly `PomodoroCard.tsx` and its colocated `PomodoroCard.test.tsx`. Do not introduce new files, shared tokens, `src/lib/` or `src/components/` entries, or upward (`../`) imports out of the widget folder. Do not introduce a new color literal outside the existing palette `{#030712, #0B1220, #101828, #111827, #1E2939, #1F2937, #155DFC, #3B82F6, #51A2FF, #AD46FF, #99A1AF, #FFFFFF}` (the palette was extended by exactly one literal — `#111827` — by this Decision; `#1F2937` remains in the palette because other elements may still reference it, only the ring track moves off it).

## Spec pointer

- `.specs/pomodoro/spec.md#blueprint` — Decision 8 ("Ring track color dimmed to `#111827`")
- `.specs/pomodoro/spec.md#blueprint` — Visual contract paragraph for the "Circular ring container" (track bullet now reads `stroke=#111827`)
- `.specs/pomodoro/spec.md#contract` — DoD section "Ring contract (Decisions 4 + 7 + 8)", first checkbox (`… over a #111827 track (Decision 8) …`)
- `.specs/pomodoro/spec.md#contract` — Regression Guardrails bullet beginning "The ring track color is `#111827` (Decision 8); a regression that reverts the track stroke to `#1F2937` inside the ring SVG is flagged."
- `.specs/pomodoro/spec.md` — Scenarios "Ring at idle renders the four-segment dashed pattern (Figma node 1:11)" (track assertion updated to `#111827`) and "Ring track is significantly dimmer than the remaining-time arc (Decision 8)".

## Files in scope

- `src/app/widgets/pomodoro/PomodoroCard.tsx`
- `src/app/widgets/pomodoro/PomodoroCard.test.tsx`

## Acceptance (from spec Contract)

- [ ] In `src/app/widgets/pomodoro/PomodoroCard.tsx`, the track `<circle>` element's `stroke` attribute is the literal string `#111827` (was `#1F2937`). This is the only ring `<circle>` whose stroke literal changes; the foreground `<circle>` retains `stroke="#3B82F6"`.
- [ ] `git grep -n "#1F2937" src/app/widgets/pomodoro/PomodoroCard.tsx` returns no match on a `<circle>` `stroke` attribute inside the ring SVG. (If `#1F2937` survives elsewhere in the file — e.g. button background, panel divider — that is acceptable; only the ring track had to move off it.)
- [ ] In `src/app/widgets/pomodoro/PomodoroCard.test.tsx`, the existing assertion `expect(track.getAttribute("stroke")).toBe("#1F2937")` (currently at line 359) is updated to `expect(track.getAttribute("stroke")).toBe("#111827")`. Per spec C5 precedent, this rewrite is authorized and `/review` shall not flag it.
- [ ] A test (new or extended within `PomodoroCard.test.tsx`) asserts that the foreground `<circle>`'s `stroke` attribute equals `#3B82F6` on initial idle mount — this is the regression guardrail for the foreground remaining-time color and is required because the spec explicitly preserves it as part of Decision 8.
- [ ] A test (new or extended within `PomodoroCard.test.tsx`) asserts that **no** `<circle>` element inside the ring SVG carries `stroke="#1F2937"`. Implementation may iterate the SVG's `<circle>` children and assert each `getAttribute("stroke") !== "#1F2937"`, or query by attribute selector and assert zero matches.
- [ ] No new file is added under `src/lib/` or `src/components/` by this PBI.
- [ ] No new color literal outside the palette `{#030712, #0B1220, #101828, #111827, #1E2939, #1F2937, #155DFC, #3B82F6, #51A2FF, #AD46FF, #99A1AF, #FFFFFF}` appears in `PomodoroCard.tsx`. Verified by `git grep -nE "#[0-9A-Fa-f]{3,8}" src/app/widgets/pomodoro/PomodoroCard.tsx` and reviewing each match against the palette.
- [ ] `git grep -nE "from ['\"]\\.\\./" src/app/widgets/pomodoro` continues to return no matches.
- [ ] The existing `src/smoke.test.tsx` continues to pass unchanged.
- [ ] All scenarios authored under PBIs 01, 03, 04, 05, 06, and 07 continue to pass — this PBI is a single-literal swap plus test updates, not a behavioral change.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
- Scenarios:
  - "Ring track is significantly dimmer than the remaining-time arc (Decision 8)" — primary acceptance scenario for this PBI.
  - "Ring at idle renders the four-segment dashed pattern (Figma node 1:11)" — regression with updated track-color literal.
  - "Ring switches to single-arc dasharray on start (Option A, pathLength=1)" — regression; foreground stroke `#3B82F6` is preserved.
  - "Ring drains clockwise as time elapses (Option A, pathLength=1)" — regression; geometry, dashoffset math, and direction are unchanged.
  - "Ring freezes its progress when paused (Option A, pathLength=1)" — regression.
  - "Ring during resting uses restMinutes as denominator" — regression.
  - "Ring returns to four-segment idle pattern on reset" — regression.
  - "Idle render of the Pomodoro card" — regression.
  - "Settings panel toggles open and closed" — regression.
  - "Work interval reaching zero advances to resting (strict alternation)" — regression.

## Dependencies

- Requires: PBIs 01, 03, 04, 05, 06, 07 (all already shipped on `main`). No in-flight sibling PBI; this PBI lands standalone.

## Refinement rule

If reality diverges from the spec while implementing, stop and request `/spec update pomodoro` rather than improvising. In particular: do **not** invent a third track color, do **not** propagate the `#1F2937` → `#111827` change to other elements outside the ring SVG (the spec explicitly limits the change to the ring track and explicitly retains `#1F2937` in the palette for other elements that may still reference it), and do **not** delete the foreground-stroke `#3B82F6` assertion — it is the regression guardrail Decision 8 hinges on.
