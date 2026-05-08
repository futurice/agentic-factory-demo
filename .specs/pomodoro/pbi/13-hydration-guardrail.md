# PBI 13: Hydration regression guardrail (Amendment 2026-05-08 #6)

> Build order: lands as the sole PBI of the 2026-05-08 #6 amendment wave, after PBIs 01–12 are shipped on `main`. PBI 13 only touches `PomodoroCard.tsx` and its colocated test file; no merge contention with any in-flight or future PBI.

## Directive

Land the hydration regression guardrail per spec Amendment 2026-05-08 #6 in a single atomic merge. The production code changes are **already applied in tree** (uncommitted at the start of this PBI); this PBI commits those code changes together with the three new Vitest scenarios that lock the contract in place. Per the Constitution's same-commit rule, the spec's new content, the production code fixes, and the new tests ship together.

The two production code changes already in tree at `src/app/widgets/pomodoro/PomodoroCard.tsx`:

1. **Defensive `String(progress)` coercion at the React-style boundary.** The ring container's inline style sets `--progress` as a string, e.g. `"--progress": String(progress)` (or any other expression that yields a string). The previous `"--progress": progress` form (where `progress` was a number) is removed. React serializes a numeric custom property to the string form on the client but to a slightly different form on the server in some Node versions, which is the documented hydration mismatch source the guardrail closes.
2. **`font-[var(--font-…)]` → `[font-family:var(--font-…)]` normalization.** Every occurrence of `font-[var(--font-inter)]` and `font-[var(--font-space-grotesk)]` in any element's `className` inside `PomodoroCard.tsx` is replaced by the equivalent arbitrary-property form `[font-family:var(--font-inter)]` or `[font-family:var(--font-space-grotesk)]`. The `font-[var(--font-…)]` form is ambiguous between Tailwind's `font-family` and `font-weight` utility namespaces and produces inconsistent class output across server and client renders under Tailwind v4's PostCSS pipeline; the explicit `[font-family:var(--font-…)]` arbitrary-property form is unambiguous and renders identically on both sides of hydration.

The corresponding test regex in `src/app/widgets/pomodoro/PomodoroCard.test.tsx` is **already updated** to match the new arbitrary-property form (one regex, identified by its prior assertion against `font-[var(--font-`).

This PBI **adds three new Vitest scenarios** to `PomodoroCard.test.tsx` that pin the post-amendment contract:

- A `console.error` spy scenario that asserts no hydration warning fires during the card's mount.
- A scenario that walks the four pomodoro states (idle, running, paused, resting) and asserts `--progress` is a string matching `/^[01](\.\d+)?$/` at the React-style boundary in each state.
- A scenario that walks the card's rendered DOM and asserts every element with a font binding uses the `[font-family:var(--font-…)]` arbitrary-property form, and that no element's `className` contains the substring `font-[var(--font-`.

The change is purely a hydration-safety hardening and does not touch:

- The state machine (`idle | running | paused | resting | completed`).
- The `setInterval` lifecycle, the slider `onChange` handlers (Decision 12 / PBI 11 contract preserved), the play/pause/reset buttons.
- The ring CSS encoding (`--progress`, conic-gradient + radial-gradient mask), the ring foreground colors per phase (Decision 10), the ring track color (Decision 8). The numeric **value** of `--progress` per state is unchanged; only the JavaScript type at the React-style boundary changes from `number` to `string`. CSS `var(--progress)` consumes both forms identically.
- The phase label `<h2>` (Decision 11), the MM:SS display, the `format-time.ts` helper.
- The settings panel placement, padding, gap, slider accent color.
- The card root padding (`p-[24px]`, Decision 13 / PBI 12).
- The home route at `src/app/page.tsx`.
- The shell at `src/app/layout.tsx` and the `next/font/google` variable bindings (`--font-inter`, `--font-space-grotesk`) declared there. The shell's font CSS variable wiring is owned by `.specs/app-shell/spec.md` and is unaffected by this PBI; only the **consumer** form inside `PomodoroCard.tsx` changes.

Scope is strictly `PomodoroCard.tsx` and its colocated `PomodoroCard.test.tsx`. Do not introduce new files, shared tokens, `src/lib/` or `src/components/` entries, upward (`../`) imports out of the widget folder, or a `*.module.css` file. The palette is unchanged by this PBI; no color literal moves.

## Spec pointer

- `.specs/pomodoro/spec.md#blueprint` — Amendment 2026-05-08 #6 (Decision/guardrail covering hydration safety).
- `.specs/pomodoro/spec.md#contract` — Regression Guardrail bullet added 2026-05-08 #6 ("no React hydration warning…") — the binding architectural invariant.
- `.specs/pomodoro/spec.md#contract` — three DoD bullets under Polish added 2026-05-08 #6:
  - no `console.error` call whose first argument matches the hydration-warning regex,
  - `--progress` is a string in `/^[01](\.\d+)?$/` at the React-style boundary,
  - no `font-[var(--font-` substring appears in any card element's `className`.
- `.specs/pomodoro/spec.md#contract` — three new Gherkin scenarios added 2026-05-08 #6:
  - "Pomodoro card mounts without a hydration warning",
  - "Ring `--progress` is serialized as a string at the React-style boundary",
  - "Card font-family classes use the arbitrary-property form".

## Files in scope

- `src/app/widgets/pomodoro/PomodoroCard.tsx`
- `src/app/widgets/pomodoro/PomodoroCard.test.tsx`

## Acceptance (from spec Contract)

- [ ] In `src/app/widgets/pomodoro/PomodoroCard.tsx`, no element's `className` contains the substring `font-[var(--font-`. Verified by `git grep -n "font-\[var(--font-" src/app/widgets/pomodoro/PomodoroCard.tsx` returning zero matches.
- [ ] Every element in `PomodoroCard.tsx` that previously bound a font variable now uses the arbitrary-property form `[font-family:var(--font-inter)]` or `[font-family:var(--font-space-grotesk)]`. Verified by reading the file and confirming the card root, the in-ring `<h2>`, the time display `<span>`, and the settings `<label>`s each carry one of those two utilities.
- [ ] The ring container's inline `style` prop sets `--progress` as a string, e.g. `"--progress": String(progress)` (or any other string-producing expression). Verified by reading `PomodoroCard.tsx` and asserting the JSX prop's value is wrapped in `String(...)` or otherwise produces a `string` rather than a `number`.
- [ ] A NEW Vitest scenario in `PomodoroCard.test.tsx` installs a `console.error` spy (`vi.spyOn(console, "error")`), renders `<PomodoroCard />`, and asserts that no call's first argument matches `/Hydration|did not match|server rendered HTML didn't match/i`. The spy is restored at the end of the test (e.g. via `mockRestore()` or the standard `afterEach` cleanup). A title such as `"card mounts without a hydration warning"` is recommended; exact title at `@Dev`'s discretion.
- [ ] A NEW Vitest scenario in `PomodoroCard.test.tsx` reads `style.getPropertyValue("--progress")` from the ring container in all four observable states (idle, running, paused, resting) and asserts each returned value matches `/^[01](\.\d+)?$/`. State transitions are driven by the same timer-advancement and button-click idioms used by the previously shipped tests (e.g. `vi.useFakeTimers()` + `vi.advanceTimersByTime(...)` + `fireEvent.click(...)` on play/pause). The scenario asserts the value is a non-empty string matching the regex; the contract is that the boundary serialization is a string, not a coerced number. A title such as `"--progress is a string in [0, 1] across all states"` is recommended.
- [ ] A NEW Vitest scenario in `PomodoroCard.test.tsx` walks the card's rendered DOM (card root via `getByLabelText("Pomodoro timer")`, the in-ring `<h2>`, the time display `<span>`, the settings `<label>`s) and asserts each element's `className` either contains `[font-family:var(--font-inter)]` or `[font-family:var(--font-space-grotesk)]`, AND asserts no element's `className` contains the substring `font-[var(--font-`. A title such as `"font-family classes use the arbitrary-property form"` is recommended.
- [ ] The previously-existing test that asserted against `font-[var(--font-` has had **one regex updated** in tree to match the new `[font-family:var(--font-…)]` form. This update is committed as part of this PBI; no other prior test is rewritten.
- [ ] All previously shipped tests in `PomodoroCard.test.tsx` continue to pass — the idle render assertions, settings panel toggle, slider boundaries, slider-resets-clock (PBI 11), pause-freezes-progress, reset behavior, phase advance work → rest → work, ring contract per state, ring foreground per phase (Decision 10), phase label inside ring container (Decision 11), card padding (PBI 12), accessibility queries, and isolation. The hydration hardening is observable from `className` and inline `style` only; no other test should observe a behavior change.
- [ ] The existing `src/smoke.test.tsx` continues to pass unchanged.
- [ ] No new file is added under `src/lib/` or `src/components/` by this PBI.
- [ ] No `*.module.css` file is added by this PBI (Regression Guardrail).
- [ ] No new color literal outside the existing palette appears in `src/app/widgets/pomodoro/PomodoroCard.tsx`.
- [ ] No `localStorage`, `sessionStorage`, cookie, or URL persistence is introduced. Verified by `git grep -nE "localStorage|sessionStorage|document\.cookie" src/app/widgets/pomodoro` returning no matches.
- [ ] `git grep -nE "from ['\"]\\.\\./" src/app/widgets/pomodoro` continues to return no matches.
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run test:run` exit `0`.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
- Scenarios from `.specs/pomodoro/spec.md` whose contracts are pinned by this PBI:
  - "Pomodoro card mounts without a hydration warning" — new (Amendment 2026-05-08 #6).
  - "Ring `--progress` is serialized as a string at the React-style boundary" — new (Amendment 2026-05-08 #6).
  - "Card font-family classes use the arbitrary-property form" — new (Amendment 2026-05-08 #6).
- Regression scenarios that must continue to hold unchanged (sampled, non-exhaustive — see prior PBIs for the full list):
  - "Idle render of the Pomodoro card" — regression; the card mounts with the time display reading `25:00` and the start/reset/Settings buttons reachable.
  - "Settings panel toggles open and closed" — regression.
  - "Sliding Work length mid-running resets the clock to idle (Decision 12, 2026-05-08 #4)" — regression from PBI 11.
  - "Reset returns to the initial work time" — regression.
  - "Pause freezes the displayed time and the ring progress" — regression. The ring progress contract is unchanged; only the JavaScript type at the React-style boundary changes from `number` to `string`.
  - "Work interval reaching zero advances to resting (strict alternation)" / "Rest interval reaching zero advances to a fresh work interval" — regression.
  - "Ring at idle renders a flat foreground (no segmentation)" / "Ring foreground color matches the active phase (Decision 10)" / "Ring is rendered without SVG (Decision 9)" — regression from PBIs 08/09.
  - "Phase label appears above the time display (Decision 11)" — regression from PBI 10.
  - "Card root applies symmetric `p-[24px]` padding (Decision 13)" — regression from PBI 12.
  - "Widget remains isolated" / "No persistence is added" — regression.
  - "Quality gates pass" — regression; `npm run lint && npm run test:run && npm run build` all exit `0`.

## Dependencies

- Requires (transitively): PBIs 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12 — all already shipped on `main`. The card root `<article aria-label="Pomodoro timer">` element, the ring container with its `--progress` custom property, the in-ring `<h2>` phase label, the time display `<span>`, and the settings panel `<label>`s must all already exist for the new scenarios to bind to them.
- Requires (in-flight): nothing. The 2026-05-08 #1–#5 amendment waves are fully consumed.
- Blocks: nothing. After PBI 13 lands, the 2026-05-08 #6 amendment is fully consumed and the spec / code agree on the hydration-safety contract.

## Refinement rule

Standard refinement rule. Note: PBI 13 commits the **already-applied** production code changes (`String(progress)` coercion and `[font-family:var(--font-…)]` normalization) alongside the new tests; **no further code edits should be needed inside this PBI**. The Builder's job is to author the three new Vitest scenarios against the code already in tree, run the quality gates, and commit the lot atomically.

If reality diverges from the spec while implementing, stop and request `/spec update pomodoro` rather than improvising. In particular:

- Do **not** revert the `String(progress)` coercion to the prior numeric form `"--progress": progress` — Amendment 2026-05-08 #6 supersedes it; the boundary serialization must be a string.
- Do **not** reintroduce the `font-[var(--font-…)]` form anywhere in `PomodoroCard.tsx` — every font binding must use the explicit `[font-family:var(--font-…)]` arbitrary-property form.
- Do **not** express the `--progress` string via `progress.toString()`, `` `${progress}` ``, or `String(progress)` interchangeably across renders — pick one expression that is stable across renders and types as `string`. The DoD's contract is observability of a string at the React-style boundary, not a specific spelling; the Critic checks the regex `/^[01](\.\d+)?$/` against `style.getPropertyValue("--progress")`.
- Do **not** suppress the hydration warning via `suppressHydrationWarning` on any element — the guardrail is that **no warning fires**, not that the warning is silenced. The regression guardrail is violated by either condition.
- Do **not** wrap the card in `<ClientOnly>` / `dynamic(..., { ssr: false })` / a `useEffect`-gated mount to dodge the hydration check — the contract is that the card renders identically on server and client. The fix is the boundary-serialization and class-form normalization, not opting out of SSR.
- Do **not** rewrite or remove any pre-existing test in `PomodoroCard.test.tsx` beyond the **one regex** already updated in tree to match the new `[font-family:var(--font-…)]` form. This PBI **adds** three new colocated tests; no further test rewrite is authorized under spec C5 for this amendment.
- Do **not** assert the font-family contract by reading `getComputedStyle` — Tailwind utilities do not necessarily resolve to inline computed style in jsdom under Vitest, and the binding contract is the `className` substring per Amendment 2026-05-08 #6's class-form clause. The new test asserts on `className` directly.
- Do **not** introduce a new file under `src/lib/` or `src/components/` (e.g. a shared `progressToString` helper or a font-class constant) — the coercion is inline and the className stays inline on each JSX element.
- Do **not** introduce a `*.module.css` file or move the font binding into a CSS Module — Tailwind utilities (now in their arbitrary-property form) are the only acceptable expression of the font-family binding under this spec's Regression Guardrails.
- If a new test cannot be expressed without an additional code change beyond the two already-applied edits, halt and request `/spec update pomodoro` — the spec assumes the in-tree code shape is sufficient to express all three new scenarios.
