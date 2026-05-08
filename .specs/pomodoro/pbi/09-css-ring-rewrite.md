# PBI 09: Rewrite ring as pure CSS with phase-dependent foreground color

> Build order: lands first in the 2026-05-08 #3 amendment wave. Sibling PBI `10-phase-label.md` depends on this one (both touch `PomodoroCard.tsx` and `PomodoroCard.test.tsx`; the ring rewrite stabilizes the test scaffolding before the heading rewrite layers on top). PBIs 01–08 are already shipped on `main`.

## Directive

Apply spec Decisions 9 and 10 (Amendment 2026-05-08 #3) in a single atomic merge: replace the SVG-based ring rendering inside `src/app/widgets/pomodoro/PomodoroCard.tsx` with a pure-CSS ring, AND make the ring foreground color phase-dependent.

The two changes ship together because they are tightly coupled at the encoding layer: the new CSS construct (recommended `conic-gradient(<foreground> calc(var(--progress) * 360deg), <track> 0)` painted into a ring shape via `mask`) names the foreground color directly inside the same property the rewrite introduces. Splitting them would force an intermediate state where the new CSS ring renders `#3B82F6` in `running`/`resting` — that intermediate state already violates Decision 10 against the just-amended spec, so it is not a coherent landing point.

The behavioral contract is unchanged from PBIs 04–08: the visible arc encodes `secondsRemaining / duration`, drains clockwise from the 12 o'clock anchor, freezes on pause, resets to `0` on phase advance and on reset, and the track color is `#111827`. Only the encoding (SVG → CSS) and the foreground color (single `#3B82F6` → phase-dependent `#F87171` / `#34D399` / `#3B82F6`) change.

Specifically:

- **Remove** the `<svg viewBox="0 0 344.664 256">` wrapper and both concentric `<circle>` elements (track and foreground) currently rendered inside the ring container in `PomodoroCard.tsx`. After this PBI lands, `container.querySelectorAll("svg, circle")` scoped to the ring container returns length `0` (spec Regression Guardrail; spec Decision 9; DoD "Ring contract", first checkbox).
- **Render** the ring as a single block-level element (a `<div>` or equivalent) with the same outer dimensions as the existing ring container (`~344.66px × 256px`) and observable stroke thickness matching the prior `10.24px`. The CSS technique is implementation-defined; the spec recommends `background: conic-gradient(<foreground> calc(var(--progress) * 360deg), <track> 0)` clipped to a ring shape via `mask: radial-gradient(circle, transparent <inner-r>, black <inner-r>)`, with the `conic-gradient` expressed in an inline `style` attribute so the existing "no CSS Module" Regression Guardrail holds. Equivalent encodings (double-element ring, `clip-path`, `border` tricks) are acceptable provided the observable contract is satisfied.
- **Expose** a CSS custom property `--progress` on the ring element whose value is in `0..1` and equals `elapsed / duration`, where `duration = workMinutes * 60` while the current phase is work (states `running` and `paused-from-work`) or `restMinutes * 60` while the current phase is rest (states `resting` and `paused-from-rest`), and `elapsed = duration − secondsRemaining`. Numeric `--progress` values may be rounded to four decimals (tolerance ±`0.005`). In `idle` and `completed`, `--progress = 0` or absent.
- **Bind** the ring foreground color to the active phase per Decision 10: `#F87171` (Tailwind red-400) in `running` (work) and `paused-from-work`; `#34D399` (Tailwind emerald-400) in `resting` and `paused-from-rest`; `#3B82F6` retained in `idle` and `completed`. The foreground color must flip within ONE render frame on phase advance (`running → resting` and `resting → running`) — the same React state transition that resets `--progress` to `0` carries the color flip. No `setTimeout`, `requestAnimationFrame`, or animation timeline interposes.
- **Keep** the ring track color at `#111827` (Decision 8) in all states.
- **Render** the idle ring as a flat ring (no four-segment 60°/30° pattern, no segmentation). The previously-pinned Figma node `1:11` four-segment idle pattern is dropped by Decision 9; idle is a flat foreground at `#3B82F6` with `--progress = 0`.
- **Preserve** the `--progress` polish transition required by spec DoD "Polish" (the ring's visible arc change is animated via a CSS `transition` bound to `--progress`, `background`, `mask`, or a derived stop-angle — verified by `className` regex `/transition-/` OR a non-empty `style` `transition` value containing one of `progress`, `background`, `mask`, `stroke-dashoffset`). Under the new encoding this typically means `transition: background 0.3s` or a `@property --progress` declaration with a `transition: --progress 0.3s` rule; the historical SVG bullet-pointing `stroke-dashoffset` is dropped from the polish substring set. The implementation may pick whichever of the four substrings (`progress`, `background`, `mask`, `stroke-dashoffset`) it satisfies.

The state machine, `setInterval` lifecycle, settings panel, sliders, button row, MM:SS time display, top-of-card `<h2>` "Work Time" / "Rest Time" heading, and home route are NOT modified by this PBI. The phase label inside the ring container and the removal of the top-of-card title are deferred to PBI 10.

Scope is strictly `PomodoroCard.tsx` and its colocated `PomodoroCard.test.tsx`. Do not introduce new files, shared tokens, `src/lib/` or `src/components/` entries, upward (`../`) imports out of the widget folder, or a `*.module.css` file. Do not introduce a new color literal outside the palette `{#030712, #0B1220, #101828, #111827, #1E2939, #1F2937, #155DFC, #3B82F6, #51A2FF, #AD46FF, #99A1AF, #F87171, #34D399, #FFFFFF}` (this PBI extends the palette by exactly two literals — `#F87171` and `#34D399` — per Decision 10).

### C5 test-rewrite authorization (inherited from spec Contract)

Per spec Contract section "Test rewrite authorization (C5)" third bullet (added 2026-05-08 #3), this PBI is **explicitly authorized** to rewrite or remove the following SVG-era assertions in `src/app/widgets/pomodoro/PomodoroCard.test.tsx`. `/review` shall not flag these rewrites as regressions.

- All `<circle>` element queries — every `getRingSvg(container).querySelectorAll("circle")`, every `svg.querySelectorAll("circle")`, and the `getRingSvg` helper itself (lines 5–11). These become CSS-era queries against the ring container by `data-testid` or by a stable `className` substring.
- All `pathLength="1"` assertions (e.g. lines 280, 396, 411, 443, 527; the corresponding `pathLength`-null check after reset at line 533).
- All `stroke-dasharray="1 1"` assertions (e.g. lines 279, 397, 412, 444; the four-segment `"120.637 60.319"` checks if any survive).
- All `stroke-dashoffset` numeric assertions (e.g. lines 273–280, 384, 398, 413, 419–420, 435–445, 539). These become `--progress` numeric assertions (read from the inline `style` attribute as `getPropertyValue("--progress")` or from a `data-progress` attribute if the implementation chooses one).
- The track-stroke assertion currently at `PomodoroCard.test.tsx:359` (`expect(track.getAttribute("stroke")).toBe("#111827")`) and the no-`#1F2937`-on-any-`<circle>` loop at lines 514–517 — these become CSS-era assertions that the ring container's rendered track color resolves to `#111827` (via computed style or by inspecting the inline `style` `conic-gradient` second stop / equivalent base layer).
- The cross-state ring-invariance test at `PomodoroCard.test.tsx:167-190` referenced by the spec's first C5 bullet (already authorized for replacement under the prior amendment; reaffirmed here in case any residue remains).
- The ring track-stroke assertion that was rewritten under PBI 08 (`getAttribute("stroke")` against the track `<circle>`) — under this PBI, that becomes a CSS-era track-color check against the ring container.
- The "ring is significantly dimmer" assertion added under PBI 08 — under this PBI, the same proposition becomes a CSS-era assertion that the ring container's track color resolves to `#111827` and is distinguishable from the foreground color, regardless of which Decision-10 phase color is active.
- The `transition-[stroke-dashoffset]` polish check in the test file (e.g. line 472–475) — rewrite to inspect the polish substring set `{progress, background, mask, stroke-dashoffset}`. The spec polish DoD already permits any one of these four substrings.

Per-state ring assertions (replacing the deprecated SVG ones) for the new contract:

- **`idle`:** the ring container has no `<svg>` / `<circle>` descendant; rendered foreground color resolves to `#3B82F6`; `--progress` is `0` or absent; the ring is flat (no segmentation).
- **`running` (work) and `paused-from-work`:** rendered foreground color resolves to `#F87171`; `--progress = elapsed / (workMinutes * 60)` within ±`0.005`.
- **`resting` and `paused-from-rest`:** rendered foreground color resolves to `#34D399`; `--progress = elapsed / (restMinutes * 60)` within ±`0.005`.
- **`paused-from-work` and `paused-from-rest` ring-freeze:** `--progress` does not change while paused; verified by capturing `--progress` at pause time and re-asserting equality after a 5 s `vi.advanceTimersByTime`.
- **Phase advance (`running → resting`, `resting → running`):** in the same render after the phase trigger, `--progress` is `0` and the foreground color matches the new phase.
- **Reset:** `--progress` is `0` or absent; foreground color resolves to `#3B82F6`; the ring is flat.

Tests that previously queried `getByRole("heading", { name: /work time|rest time/i })` are NOT modified by this PBI — those queries continue to find the existing top-of-card `<h2>` "Work Time" / "Rest Time" heading. PBI 10 rewrites those queries when it removes the top-of-card heading and adds the in-ring `"work"` / `"rest"` label. This PBI's test rewrites stop at the ring contract.

## Spec pointer

- `.specs/pomodoro/spec.md#blueprint` — Amendment 2026-05-08 #3 paragraph (introduces Decisions 9 and 10).
- `.specs/pomodoro/spec.md#blueprint` — Decision 9 ("Ring renders in pure CSS, not SVG").
- `.specs/pomodoro/spec.md#blueprint` — Decision 10 ("Phase-dependent ring foreground color").
- `.specs/pomodoro/spec.md#blueprint` — Decision 8 (track color `#111827` survives, rebound to "the CSS ring track" so the contract works under the post-#3 reading).
- `.specs/pomodoro/spec.md#blueprint` — Decision 4 / Decision 7 historical paragraphs (BEHAVIORAL contract — clockwise drain from 12 o'clock, pause-freeze, reset-to-`0`, phase-advance — survives unchanged; only the encoding flips).
- `.specs/pomodoro/spec.md#blueprint` — "Visual contract" → "Circular ring container" CSS Ring block (the post-#3 binding paragraph; the deprecated SVG block below it is preserved as audit only).
- `.specs/pomodoro/spec.md#contract` — DoD section "Ring contract (Decisions 9 + 10)" — every checkbox in this subsection is in scope for this PBI.
- `.specs/pomodoro/spec.md#contract` — Regression Guardrails bullets added 2026-05-08 #3: "no `<svg>` or `<circle>` descendant" and "ring foreground color matches the active phase per Decision 10".
- `.specs/pomodoro/spec.md#contract` — DoD "Polish" — the `--progress` transition bullet (`/transition-/` className OR style attribute containing one of `progress`, `background`, `mask`, `stroke-dashoffset`).
- `.specs/pomodoro/spec.md#contract` — Test rewrite authorization (C5), third bullet (the explicit authorization paragraph for SVG-era ring tests).
- `.specs/pomodoro/spec.md` — Scenarios authored 2026-05-08 #3 covered by this PBI: "Ring at idle renders a flat foreground (no segmentation)", "Ring switches to active drain on start (CSS --progress encoding)", "Ring drains clockwise as time elapses (CSS --progress encoding)", "Ring freezes its progress when paused (CSS --progress encoding)", "Ring during resting uses restMinutes as denominator", "Ring returns to flat idle ring on reset", "Ring foreground color matches the active phase (Decision 10)", "Ring is rendered without SVG (Decision 9)", "Ring track is significantly dimmer than the remaining-time arc (Decision 8)" (rewritten 2026-05-08 #3 to cover the Decision-10 phase colors), "Ring transitions smoothly when state changes (polish)".

## Files in scope

- `src/app/widgets/pomodoro/PomodoroCard.tsx`
- `src/app/widgets/pomodoro/PomodoroCard.test.tsx`

## Acceptance (from spec Contract)

- [ ] In `src/app/widgets/pomodoro/PomodoroCard.tsx`, the ring container does NOT contain any `<svg>` or `<circle>` descendant element. Verified by a colocated test that scopes a `querySelectorAll("svg, circle")` to the ring container and asserts length `0` in every state (`idle`, `running`, `paused-from-work`, `resting`, `paused-from-rest`, post-reset).
- [ ] In `src/app/widgets/pomodoro/PomodoroCard.tsx`, the ring is rendered as a single block-level element (a `<div>` or equivalent). Its outer container size is `~344.66px × 256px` (matching the prior SVG container) and the observable ring thickness matches the prior `10.24px`. The exact CSS technique is implementation-defined.
- [ ] The ring element exposes a CSS custom property `--progress` whose value is in `0..1`. In `idle` and `completed`, `--progress` is `0` or absent. In `running`/`paused-from-work`, `--progress = (workMinutes * 60 − secondsRemaining) / (workMinutes * 60)`. In `resting`/`paused-from-rest`, `--progress = (restMinutes * 60 − secondsRemaining) / (restMinutes * 60)`. Tolerance ±`0.005`. Numeric values may be rounded to four decimals.
- [ ] In `idle` and `completed`, the rendered ring foreground color resolves to `#3B82F6`.
- [ ] In `running` (work) and `paused-from-work`, the rendered ring foreground color resolves to `#F87171`.
- [ ] In `resting` and `paused-from-rest`, the rendered ring foreground color resolves to `#34D399`.
- [ ] In all states, the rendered ring track color resolves to `#111827`. The track is visible across the full circle (the unfilled portion of the ring under the CSS encoding).
- [ ] The visible arc retracts clockwise from the 12 o'clock anchor as `--progress` increases from `0` toward `1`. (The technique is implementation-defined; the binding contract is the visible direction.)
- [ ] On `running → paused`, `--progress` does not change while paused; on `paused → running`, draining resumes from the frozen value. Verified by a Vitest scenario that captures `--progress` immediately before the pause click, advances `5000 ms`, and asserts `--progress` is unchanged.
- [ ] On phase advance (`running → resting` or `resting → running`), `--progress` resets to `0` and the foreground color flips within one render frame — verified by a Vitest scenario that drives the phase advance via `vi.advanceTimersByTime` and asserts both `--progress = 0` and the new phase's foreground color in the SAME render after the phase trigger.
- [ ] On reset (`* → idle`), `--progress` returns to `0` (or is absent) and the foreground color returns to `#3B82F6`. The ring is rendered as a flat foreground (no segmentation).
- [ ] In `idle`, the ring is rendered as a flat foreground (no four-segment 60°/30° pattern, no segmentation). Verified by either: the absence of any segmentation construct in the rendered DOM, or — under a `conic-gradient` encoding — the gradient stops being a single foreground stop at `0deg` (not a four-segment pattern).
- [ ] The ring's `--progress` change is animated: the rendered ring container's `className` matches `/transition-/` OR its inline `style` attribute contains a non-empty `transition` value containing one of the substrings `progress`, `background`, `mask`, `stroke-dashoffset`. (Polish DoD bullet, generalized for the CSS reading per spec.)
- [ ] No new color literal outside the palette `{#030712, #0B1220, #101828, #111827, #1E2939, #1F2937, #155DFC, #3B82F6, #51A2FF, #AD46FF, #99A1AF, #F87171, #34D399, #FFFFFF}` appears in `src/app/widgets/pomodoro/PomodoroCard.tsx`. Verified by `git grep -nE "#[0-9A-Fa-f]{3,8}" src/app/widgets/pomodoro/PomodoroCard.tsx` and reviewing each match against the palette. (`#F87171` and `#34D399` are added by this PBI; `#1F2937` is retained because other elements may still reference it.)
- [ ] No new file is added under `src/lib/` or `src/components/` by this PBI.
- [ ] No `*.module.css` file is added by this PBI (Regression Guardrail). The CSS technique is expressed via Tailwind utilities and an inline `style` attribute on the ring element.
- [ ] `git grep -nE "from ['\"]\\.\\./" src/app/widgets/pomodoro` continues to return no matches.
- [ ] The existing `src/smoke.test.tsx` continues to pass unchanged.
- [ ] In `src/app/widgets/pomodoro/PomodoroCard.test.tsx`, every test that previously asserted SVG-era ring contract bullets (the `pathLength="1"`, `stroke-dasharray="1 1"`, `stroke-dashoffset` numeric, `circle` queries, four-segment dasharray, track-stroke `getAttribute("stroke")`) is rewritten to assert the equivalent CSS-era contract bullets listed above. Per spec Contract C5 third bullet, this rewrite is authorized and `/review` shall not flag it as a regression.
- [ ] In `src/app/widgets/pomodoro/PomodoroCard.test.tsx`, no test queries `getByRole("heading", { name: /work time|rest time/i })` is modified by this PBI — those queries are migrated by PBI 10. (Stated explicitly so reviewers know this PBI's diff is scoped.)
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run test:run` exit `0`.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
- Scenarios from `.specs/pomodoro/spec.md`:
  - "Ring at idle renders a flat foreground (no segmentation)" — primary acceptance scenario for the encoding swap and the idle visual.
  - "Ring switches to active drain on start (CSS --progress encoding)" — primary acceptance scenario for the running entry.
  - "Ring drains clockwise as time elapses (CSS --progress encoding)" — primary acceptance scenario for the dynamic math.
  - "Ring freezes its progress when paused (CSS --progress encoding)" — primary acceptance scenario for pause-freeze.
  - "Ring during resting uses restMinutes as denominator" — primary acceptance scenario for phase-aware denominator.
  - "Ring returns to flat idle ring on reset" — primary acceptance scenario for reset.
  - "Ring foreground color matches the active phase (Decision 10)" — primary acceptance scenario for the phase-color contract.
  - "Ring is rendered without SVG (Decision 9)" — primary acceptance scenario for the no-`<svg>`/`<circle>` guardrail.
  - "Ring track is significantly dimmer than the remaining-time arc (Decision 8)" — regression with the rewrite to assert track resolves `#111827` and foreground resolves the Decision-10 phase color.
  - "Ring transitions smoothly when state changes (polish)" — regression for the polish transition substring set.
  - "Idle render of the Pomodoro card" — regression. NOTE: the heading-name part of this scenario still expects `/work time/i` until PBI 10 lands; this PBI does not migrate that query.
  - "Start transitions idle to running and decrements once per second" — regression; confirms removing the SVG ring did not break the state machine.
  - "Pause freezes the displayed time and the ring progress" — regression.
  - "Reset returns to the initial work time" — regression.
  - "Reset while paused returns to idle" — regression.
  - "Work interval reaching zero advances to resting (strict alternation)" — regression. NOTE: the heading-name part still expects `/rest time/i` until PBI 10 lands.
  - "Rest interval reaching zero advances to a fresh work interval" — regression. NOTE: the heading-name part still expects `/work time/i` until PBI 10 lands.
  - "Slider changes mid-running do not retroactively rescale the current interval" — regression.
  - "Settings panel toggles open and closed" — regression.
  - "format-time helper zero-pads minutes and seconds" — regression.
  - "Widget remains isolated" (outbound `../` half) — regression.

## Dependencies

- Requires: PBIs 01, 03, 04, 05, 06, 07, 08 (all already shipped on `main`). Concretely, `PomodoroCard.tsx` must already host the SVG ring scaffolding being removed, the `pathLength=1` dynamic-ring math being deleted, the strict-alternation state machine being preserved, and the `#111827` track color being carried forward into the new CSS encoding.
- Blocks: PBI 10 (`10-phase-label.md`). PBI 10 lands second because both PBIs touch `PomodoroCard.tsx` and `PomodoroCard.test.tsx`; sequencing them avoids merge contention. The heading-name test migrations bundled in PBI 10 read more cleanly against the post-rewrite test file.

## Refinement rule

If reality diverges from the spec while implementing, stop and request `/spec update pomodoro` rather than improvising. In particular: do **not** retain any `<svg>` or `<circle>` element inside the ring container as a fallback or transitional render (Decision 9 is binding); do **not** ship a CSS ring whose foreground stays `#3B82F6` in `running`/`resting` (Decision 10 is binding and the no-intermediate-state argument that motivates this PBI's coupling falls apart if you do); do **not** drop the `#111827` track color or the clockwise-from-12 drain direction (Decision 8 and the carried-over Decision 4 / 7 behavioral contract are binding); do **not** add a `*.module.css` file or move the ring CSS into a shared `src/lib/` or `src/components/` location (Regression Guardrails); do **not** add any color literal outside the palette extended by this PBI; do **not** rewrite the heading-name queries (`/work time/i`, `/rest time/i`) — those belong to PBI 10. If the polish-DoD `--progress` transition cannot be expressed in any of the four substrings (`progress`, `background`, `mask`, `stroke-dashoffset`), escalate so the spec can extend the substring set rather than improvising.
