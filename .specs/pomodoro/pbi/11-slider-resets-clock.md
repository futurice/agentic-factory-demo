# PBI 11: Slider movement resets the clock to idle

> Build order: lands as the sole PBI of the 2026-05-08 #4 amendment wave, after PBI `10-phase-label.md`. PBI 11 only touches `PomodoroCard.tsx` and its colocated test file; no merge contention with the shipped #3 wave.

## Directive

Apply spec Decision 12 (Amendment 2026-05-08 #4) in a single atomic merge: any change to either the Work-length slider or the Rest-length slider transitions the card to a clean `idle` state — observably equivalent to a click on the Reset button. This **inverts** the prior mid-interval clause of Decision 6 ("slider changes during an active interval do not retroactively rescale `secondsRemaining`; they apply at the next entry to that phase"), which is now superseded.

Concretely, any slider movement (Work or Rest) yields, regardless of prior `state`:

- `state` becomes `idle`.
- `phase` becomes `"work"`.
- `secondsRemaining` is reassigned to `workMinutes * 60` — re-reading the **post-change** `workMinutes` value when the Work slider was the trigger; re-reading the **unchanged** `workMinutes` value when the Rest slider was the trigger.
- The ring foreground color returns to the idle color `#3B82F6` (Decision 10).
- The ring `--progress` returns to `0` (or absent).
- The settings panel itself stays open across this reset (slider movement does not toggle the panel; opening/closing the panel remains inert per Decision 5 — only **moving a slider** triggers the reset).

Implementation hint (the simplest fit; @Dev may pick an equivalent shape under the Refinement rule): factor the existing `handleReset` body into a helper `resetToIdleWithNewMinutes(nextWork: number, nextRest: number)` that does

```
setState("idle");
setPhase("work");
setWorkMinutes(nextWork);
setRestMinutes(nextRest);
setSecondsRemaining(nextWork * 60);
```

Then:

- `handleWorkMinutesChange` parses `next` from the event and calls `resetToIdleWithNewMinutes(next, restMinutes)`.
- `handleRestMinutesChange` parses `next` from the event and calls `resetToIdleWithNewMinutes(workMinutes, next)`.
- `handleReset` MAY be simplified to `resetToIdleWithNewMinutes(workMinutes, restMinutes)`, but that simplification is OPTIONAL — the Refinement rule "minimal change" applies, and leaving `handleReset` as-is is acceptable provided its observable behavior is unchanged.

The state machine union (`idle | running | paused | resting | completed`), the `setInterval` lifecycle, the slider DOM (label text, range bounds, default values, accent color), the settings-panel open/close behavior, the play/pause/reset buttons, the ring CSS encoding, the ring foreground colors, the ring track color, the phase label, and the home route are NOT modified by this PBI. The card's structural change is bounded to the two slider `onChange` handlers.

Scope is strictly `PomodoroCard.tsx` and its colocated `PomodoroCard.test.tsx`. Do not introduce new files, shared tokens, `src/lib/` or `src/components/` entries, upward (`../`) imports out of the widget folder, or a `*.module.css` file. The palette `{#030712, #0B1220, #101828, #111827, #1E2939, #1F2937, #155DFC, #3B82F6, #51A2FF, #AD46FF, #99A1AF, #F87171, #34D399, #FFFFFF}` is unchanged by this PBI.

### C5 test-rewrite authorization (inherited from spec Contract)

Per spec Contract section "Test rewrite authorization (C5)" and the inverted DoD bullet under "Strict-alternation cycle (Decision 6)" (added 2026-05-08 #4), this PBI is **explicitly authorized** to rewrite the existing Vitest test in `src/app/widgets/pomodoro/PomodoroCard.test.tsx` whose title reads "slider changes mid-running do not retroactively rescale the current interval" (currently at lines 136–156 of the test file). That test asserts the **deprecated** behavior — specifically that after sliding Work length to `45` mid-run, the time display still reads `24:50`, and that the new value is only applied on a subsequent Reset click yielding `45:00`.

Decision 12 inverts this contract. The rewritten test must instead assert that immediately after the slider change (no Reset click required), the card has reset to idle: time display reads `45:00`, the start button's accessible name matches `/start|play/i` (NOT `/pause/i`), and the ring element's `--progress` custom property is `0` (or absent). The "after reset, the new workMinutes is applied" follow-up assertion in the deprecated test is collapsed into the same render — slider movement IS the reset.

This rewrite is **not** a regression and `/review` shall not flag it as one.

Additionally, this PBI introduces NEW assertions (not rewrites of existing ones) for the four new Scenarios authored 2026-05-08 #4:

- "Sliding Rest length mid-running resets the clock to idle" — running → idle via the Rest slider; time display becomes `25:00` (workMinutes unchanged), `--progress = 0`, settings panel stays open.
- "Sliding either length while paused resets the clock to idle" — paused → idle via Work slider; paused → idle via Rest slider.
- "Sliding either length while resting resets the clock to idle" — resting → idle via Work slider (the phase label flips back to `/^work$/i`, ring foreground returns to `#3B82F6`); resting → idle via Rest slider.
- The Rest-while-idle scenario ("Changing Rest length while idle does not change the time display") is amended in spec text to note the underlying transition is now idle → idle per Decision 12 — observable display is unchanged. The PBI's task is to ensure existing assertions for that scenario continue to pass after the handler change (idle → idle is a no-op transition for the time display because `secondsRemaining` is reassigned to `workMinutes * 60`, which equals the value already shown).

## Spec pointer

- `.specs/pomodoro/spec.md#blueprint` — Amendment 2026-05-08 #4 paragraph (introduces Decision 12).
- `.specs/pomodoro/spec.md#blueprint` — Decision 12 ("Any slider change resets the clock") — the binding contract for this PBI.
- `.specs/pomodoro/spec.md#blueprint` — Decision 6 (deprecated final sentence superseded by Decision 12) — the inverted contract for audit.
- `.specs/pomodoro/spec.md#blueprint` — Architecture / state machine bullet added 2026-05-08 #4 ("Any change to either slider… transitions `state → idle`…").
- `.specs/pomodoro/spec.md#contract` — DoD section "Strict-alternation cycle (Decision 6)" — the INVERTED bullet (Work slider mid-run → idle, `45:00`, `--progress = 0`) and the ADDED bullet (Rest slider mid-run → idle, `25:00`).
- `.specs/pomodoro/spec.md#contract` — DoD section "Settings button + panel (Decision 5)" — the Rest-while-idle clarification bullet (idle → idle is a no-op for the display under Decision 12).
- `.specs/pomodoro/spec.md#contract` — Regression Guardrail added 2026-05-08 #4 ("Slider movement triggers the same end state as the Reset button…").
- `.specs/pomodoro/spec.md` — Scenarios authored 2026-05-08 #4 covered by this PBI:
  - "Sliding Work length mid-running resets the clock to idle"
  - "Sliding Rest length mid-running resets the clock to idle"
  - "Sliding either length while paused resets the clock to idle"
  - "Sliding either length while resting resets the clock to idle"
  - The amended "Changing Rest length while idle does not change the time display" (clarifies idle → idle is a no-op for the display).

## Files in scope

- `src/app/widgets/pomodoro/PomodoroCard.tsx`
- `src/app/widgets/pomodoro/PomodoroCard.test.tsx`

## Acceptance (from spec Contract)

- [ ] In `src/app/widgets/pomodoro/PomodoroCard.tsx`, `handleWorkMinutesChange` resets the card to a clean idle state on every change event: `state = "idle"`, `phase = "work"`, the new work value is stored, and `secondsRemaining` is reassigned to `(new workMinutes) * 60`. The `state === "idle"` conditional branch in the prior implementation is removed (or subsumed) — the reset path is now unconditional.
- [ ] In `src/app/widgets/pomodoro/PomodoroCard.tsx`, `handleRestMinutesChange` resets the card to a clean idle state on every change event: `state = "idle"`, `phase = "work"`, the new rest value is stored, and `secondsRemaining` is reassigned to `workMinutes * 60` (the unchanged work value). The "Rest length never changes the idle display" comment is updated or removed — the handler now performs an explicit reset, not a silent state mutation.
- [ ] The settings panel's open/closed state is NOT toggled by either slider handler. After a slider change, `settingsOpen` (or its equivalent) stays `true`; the panel remains visible to the user.
- [ ] Slider movement does not affect the play/pause icon, accent colors, focus rings, hover states, panel transitions, or any other DOM contract beyond `state`, `phase`, `workMinutes`, `restMinutes`, `secondsRemaining`, the time display text, the ring `--progress` custom property, and the ring foreground color (the latter two follow from the state/phase change per Decisions 9 + 10).
- [ ] In `src/app/widgets/pomodoro/PomodoroCard.test.tsx`, the existing test titled "slider changes mid-running do not retroactively rescale the current interval" (currently lines 136–156) is **rewritten** under spec C5 authorization. The new test asserts: starts the timer, advances 10 seconds, asserts the display reads `24:50`, opens settings, slides Work length to `45`; immediately after the slider change (no Reset click) the time display reads `45:00`, the start button's accessible name matches `/start|play/i` (NOT `/pause/i`), and the ring element's `--progress` custom property is `0` or absent. The follow-up Reset assertion in the deprecated test is removed — slider movement IS the reset.
- [ ] In `src/app/widgets/pomodoro/PomodoroCard.test.tsx`, a NEW test asserts the inverse case for the Rest slider while running: starts the timer, advances 10 seconds, opens settings, slides Rest length from `5` to `15`; the time display reads `25:00` (workMinutes unchanged), the start button's accessible name matches `/start|play/i`, and the ring `--progress` is `0`. (Per spec DoD Strict-alternation cycle, second new bullet.)
- [ ] In `src/app/widgets/pomodoro/PomodoroCard.test.tsx`, a NEW test asserts the paused case (both sliders): pauses at `20:00`, slides Work length to `30`, asserts time display is `30:00` and state is idle; and pauses at `20:00`, slides Rest length to `12`, asserts time display is `25:00` and state is idle. (Per spec Scenario "Sliding either length while paused resets the clock to idle".)
- [ ] In `src/app/widgets/pomodoro/PomodoroCard.test.tsx`, a NEW test asserts the resting case (both sliders): runs the work interval to zero so the card is in `resting`, then slides Work length to `40`, asserts time display is `40:00`, state is idle, the heading flips back to `/^work$/i`, and the ring foreground color resolves to `#3B82F6`; and resting → idle via the Rest slider with time display `25:00`. (Per spec Scenario "Sliding either length while resting resets the clock to idle".)
- [ ] In `src/app/widgets/pomodoro/PomodoroCard.test.tsx`, a NEW test asserts the settings panel stays open across a slider-triggered reset: opens settings, slides Work length, asserts the region with accessible name "Timer settings" is still in the document. (Per spec Scenarios under Decision 12: "the settings panel remains open".)
- [ ] The existing test "Changing Rest length while idle does not change the time display" continues to pass unchanged. The new handler implementation reassigns `secondsRemaining = workMinutes * 60` which equals the value already shown (idle → idle is a no-op for the display); no test rewrite is required for this case.
- [ ] All other existing tests in `PomodoroCard.test.tsx` continue to pass — pause-freezes-progress, reset, phase advance work → rest → work, slider boundaries, isolation, polish, ring contract, phase label, etc. The card's structural change is bounded to the two slider handlers.
- [ ] No new file is added under `src/lib/` or `src/components/` by this PBI.
- [ ] No `*.module.css` file is added by this PBI (Regression Guardrail).
- [ ] No new color literal outside the existing palette appears in `src/app/widgets/pomodoro/PomodoroCard.tsx`. Verified by `git grep -nE "#[0-9A-Fa-f]{3,8}" src/app/widgets/pomodoro/PomodoroCard.tsx`.
- [ ] No `localStorage`, `sessionStorage`, cookie, or URL persistence is introduced. Verified by `git grep -nE "localStorage|sessionStorage|document\.cookie" src/app/widgets/pomodoro` returning no matches.
- [ ] `git grep -nE "from ['\"]\\.\\./" src/app/widgets/pomodoro` continues to return no matches.
- [ ] The existing `src/smoke.test.tsx` continues to pass unchanged.
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run test:run` exit `0`.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
- Scenarios from `.specs/pomodoro/spec.md`:
  - "Sliding Work length mid-running resets the clock to idle (Decision 12, 2026-05-08 #4)" — primary acceptance scenario; this is the rewrite of the deprecated mid-running scenario.
  - "Sliding Rest length mid-running resets the clock to idle (Decision 12, 2026-05-08 #4)" — primary acceptance scenario; new in this PBI.
  - "Sliding either length while paused resets the clock to idle (Decision 12, 2026-05-08 #4)" — primary acceptance scenario; new in this PBI.
  - "Sliding either length while resting resets the clock to idle (Decision 12, 2026-05-08 #4)" — primary acceptance scenario; new in this PBI; verifies the phase label flip back to `/^work$/i` and the ring foreground returning to `#3B82F6`.
  - "Changing Rest length while idle does not change the time display" — regression; idle → idle is a no-op transition for the display under Decision 12; existing assertions continue to hold without rewrite.
  - "Changing Work length while idle updates the time display" — regression; idle → idle reassigns `secondsRemaining = (new workMinutes) * 60`, so the display tracks the new value. Existing assertion continues to hold without rewrite.
  - "Reset returns to the initial work time" — regression; Reset behavior is unchanged.
  - "Pause freezes the displayed time and the ring progress" — regression; pause behavior is unchanged.
  - "Work interval reaching zero advances to resting (strict alternation)" — regression; phase advance is unchanged when no slider is moved.
  - "Rest interval reaching zero advances to a fresh work interval" — regression; phase advance is unchanged when no slider is moved.
  - "User opens settings panel during resting" — regression; opening the panel is still inert per Decision 5; this PBI does NOT make panel toggle a reset trigger, only slider movement.
  - "Sliders default to 25 and 5 minutes after reload" — regression; no persistence is added by this PBI.
  - "Slider boundaries" — regression; min/max/step on both sliders are unchanged.
  - "Ring at idle renders a flat foreground (no segmentation)" — regression from PBI 09; the post-slider-reset state is idle, and the idle ring contract continues to hold.
  - "Ring foreground color matches the active phase (Decision 10)" — regression from PBI 09; the slider-triggered reset returns the ring foreground to the idle color `#3B82F6`.
  - "Ring is rendered without SVG (Decision 9)" — regression from PBI 09.
  - "Phase label appears above the time display (Decision 11)" — regression from PBI 10; the slider-triggered reset returns the phase label to `/^work$/i` from any prior phase.
  - "Card no longer carries the 'Work Time' or 'Rest Time' top-of-card heading" — regression from PBI 10.
  - "Settings button has visible hover and focus states (polish)" — regression.
  - "Sliders use the existing accent color (polish)" — regression.
  - "Widget remains isolated" (outbound `../` half) — regression.
  - "No persistence is added" — regression.

## Dependencies

- Requires: PBI 10 (`10-phase-label.md`). PBI 11 lands after PBI 10 because (a) several of PBI 11's new tests assert the phase label flips back to `/^work$/i` after a slider-triggered reset from `resting` / `paused-from-rest`, which assumes the in-ring `<h2>` introduced by PBI 10 is in place, and (b) PBI 10's heading-name migration (`/work time/i` → `/^work$/i`) must already have landed so the new tests can author against the post-migration query form.
- Requires (transitively): PBIs 01, 03, 04, 05, 06, 07, 08, 09 — all already shipped on `main`. The state machine, `setInterval` lifecycle, settings panel, sliders, button row, MM:SS display, ring CSS encoding, and phase label must already exist.
- Blocks: nothing in this amendment wave. After PBI 11 lands, the 2026-05-08 #4 amendment is fully consumed.

## Refinement rule

If reality diverges from the spec while implementing, stop and request `/spec update pomodoro` rather than improvising. In particular:

- Do **not** preserve the deprecated mid-interval clause in any form — Decision 12 is the binding contract; there is no "values apply at the next entry to that phase" branch in the new handler bodies.
- Do **not** introduce a confirmation dialog, debounce, or "are you sure?" prompt before resetting — Decision 12 pins slider movement as **immediately** equivalent to a Reset click; the trade-off ("pause → tweak → resume" workflow gone) is accepted by the learner.
- Do **not** toggle the settings panel as a side effect of the slider handlers — Decision 5 still pins panel toggle as inert; only **moving a slider** triggers the reset, and the panel must remain open across that reset (asserted by a new test).
- Do **not** modify the Reset button's behavior — Decision 12 makes slider movement observably equivalent to Reset, but the Reset button itself continues to behave the same way it always did.
- Do **not** introduce a `useEffect` that observes `workMinutes` / `restMinutes` and triggers the reset as a derived effect — the reset must be driven by the `onChange` event handler, not by a state-change subscription, to keep the React render cycle predictable and to avoid re-running the reset on the initial mount when `workMinutes` is set to its default. The state writes in the handler must batch in a single render pass.
- Do **not** introduce a new file under `src/lib/` or `src/components/` (e.g. extracting `resetToIdleWithNewMinutes` into a shared module) — the helper, if introduced, lives as a local function inside `PomodoroCard.tsx`.
- Do **not** simplify `handleReset` to call the new helper if doing so risks regressing any existing test. The simplification is OPTIONAL and minimal-change is preferred; if the simplification is made, all "Reset" scenarios must continue to pass without test rewrites.
- Do **not** keep the deprecated test's title and tweak its assertions — the test title currently reads "slider changes mid-running do not retroactively rescale the current interval", which is the inverse of the new contract. Rename the test (e.g. "slider changes mid-running reset the clock to idle") so the test file reads coherently against Decision 12.
- Do **not** rewrite the ring-contract assertions introduced by PBI 09 or the heading-name assertions introduced by PBI 10 — those are out of scope here and any drift on them is a PBI 09 / PBI 10 regression.
- Do **not** introduce a new color literal — the palette is unchanged by this PBI; the slider-triggered reset returns the ring foreground to the existing idle color `#3B82F6`.
