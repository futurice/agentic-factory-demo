# PBI 07: Polish — hover/focus states, ring transition, slider accent

> Build order: `04 → 05 → 06 → 07`. PBI 07 is the final link in the chain; it depends on both PBI 05 (for the dynamic `stroke-dashoffset` the transition observes) and PBI 06 (for the Settings button and range inputs the hover/focus/accent assertions bind to).

## Directive

Apply the concrete, machine-verifiable polish criteria from spec Decision 5 + Contract section "Polish (Decision 5 + learner polish license, C4)". Specifically: add `hover:` Tailwind utilities that change `background-color` or `opacity` to the play/pause, reset, and Settings buttons; add `focus-visible:` Tailwind utilities (e.g. `focus-visible:ring-2 focus-visible:ring-[#3B82F6]`) to the play/pause and reset buttons; add a CSS transition on `stroke-dashoffset` to the foreground `<circle>` (e.g. `transition-[stroke-dashoffset] duration-300 ease-linear` or an inline `style={{ transition: ... }}` containing `stroke-dashoffset`); ensure each `<input type="range">` carries `accent-[#3B82F6]`; and ensure the settings panel root uses one of `bg-[#101828]` or `bg-[#0B1220]` plus a `border-[#1E2939]` divider/border. Introduce no new color literal outside the existing palette `{#030712, #0B1220, #101828, #1E2939, #1F2937, #155DFC, #3B82F6, #51A2FF, #AD46FF, #99A1AF, #FFFFFF}` in `PomodoroCard.tsx`. Polish must not change behavior: state machine, ring math, slider semantics, and settings-panel toggle remain identical to the form shipped by PBIs 04–06. Scope is strictly `PomodoroCard.tsx` and its colocated test file; no new files, no shared tokens, no upward imports.

## Spec pointer

- .specs/pomodoro/spec.md#blueprint — Decision 5 (Settings button hover/focus, panel transition); "Visual contract" sections for the play/pause + reset buttons and the settings panel
- .specs/pomodoro/spec.md#contract — "Polish (Decision 5 + learner polish license, C4)" — every bullet

## Files in scope

- `src/app/widgets/pomodoro/PomodoroCard.tsx`
- `src/app/widgets/pomodoro/PomodoroCard.test.tsx`

## Acceptance (from spec Contract)

- [ ] The play/pause button's `className` matches `/hover:(bg-|opacity-)/`.
- [ ] The reset button's `className` matches `/hover:(bg-|opacity-)/`.
- [ ] The Settings button's `className` matches `/hover:(bg-|opacity-)/` and `/focus-visible:/`.
- [ ] The play/pause and reset buttons' `className` each match `/focus-visible:/`.
- [ ] The foreground `<circle>` either has a `className` matching `/transition-\[stroke-dashoffset\]/` or a `style` attribute whose serialized value contains the substring `stroke-dashoffset`.
- [ ] Each `<input type="range">`'s `className` contains the substring `accent-[#3B82F6]`.
- [ ] The settings panel root's `className` matches `/bg-\[#(101828|0B1220)\]/` and `/border-\[#1E2939\]/` (border may be on top or bottom).
- [ ] `git grep -nE "#[0-9A-Fa-f]{3,8}" src/app/widgets/pomodoro/PomodoroCard.tsx` returns only matches inside the palette `{#030712, #0B1220, #101828, #1E2939, #1F2937, #155DFC, #3B82F6, #51A2FF, #AD46FF, #99A1AF, #FFFFFF}`.
- [ ] No new file is added under `src/lib/` or `src/components/` by this PBI.
- [ ] `git grep -nE "from ['\"]\\.\\./" src/app/widgets/pomodoro` continues to return no matches.
- [ ] The existing `src/smoke.test.tsx` continues to pass unchanged.
- [ ] All scenarios authored under PBIs 01, 04, 05, and 06 continue to pass — polish is additive, not behavioral.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
- Scenarios:
  - "Settings button has visible hover and focus states (polish)"
  - "Ring transitions smoothly when state changes (polish)"
  - "Sliders use the existing accent color (polish)"
  - "Idle render of the Pomodoro card" — regression
  - "Settings panel toggles open and closed" — regression
  - "Ring switches to single-arc dasharray on start (Option A, pathLength=1)" — regression
  - "Work interval reaching zero advances to resting (strict alternation)" — regression

## Dependencies

- Requires: `05-dynamic-ring-drain` (the foreground `<circle>` must already carry the dynamic `stroke-dashoffset` for the transition to be observable) and `06-settings-panel-sliders` (the Settings button and the two range inputs must already exist for hover/focus/accent assertions to bind).

## Refinement rule

If reality diverges from the spec while implementing, stop and request a `/spec update pomodoro` rather than improvising. In particular, do not introduce a new color literal to satisfy a hover or focus utility — every utility must compose from the existing palette.
