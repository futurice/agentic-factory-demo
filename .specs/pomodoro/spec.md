# Feature: Pomodoro Widget + Widget Showcase Home Route

## Blueprint

### Context

The learner asked to "implement basic app grid and pomodoro timer" with Figma node `1:3` as the visual contract (file `w28z2LVnu8xwN4B51vgORg`, "Untitled", retrieved 2026-05-06 via Figma desktop MCP — no Figma variables defined, all values are literals). The platform is a hacking ground for self-contained widgets (`AGENTS.md` → Architecture); a Pomodoro timer is the first widget and the home route — currently a Next.js starter splash at `src/app/page.tsx` — is restructured into the "Widget Showcase" header + a single card linking to the widget. There is no real "grid" yet because the design only shows one card; the home-route restructure stops at "header + one card" and does not invent a multi-column layout the design does not evidence.

Amendment 2026-05-08: the learner reported on 2026-05-08 that "the pomodoro component is unfinished. The Indicator circle is not working and it lacks support for editing work and rest period lengths. The overall lok and feel needs polishing too." The intake at `.specs/_intake/pomodoro-unfinished-ring-settings-polish.md` captures verbatim learner decisions resolving the resulting `/challenge` objections: a real `resting` state under strict alternation, editable work + rest lengths via a collapsible settings panel with two sliders, session-only `useState` persistence, and an explicit polish license to "act as designer and improve upon the styles already in the codebase for a presentable end product." This spec is the authoritative follow-up; it re-affirms the Option A ring drain that PBI 03 (`b459920`) regressed against, introduces the `resting` state machine + sliders, and pins concrete polish bullets under the learner's designer license.

Amendment 2026-05-08 #2: the learner asked to "make the ring show remaining time in current period. Keep current color as the color of the diminishing segment, add a significantly dimmer shade for ring background color." Sentence 1 reinforces the already-shipped `dashOffset = elapsed / duration` contract (Decisions 4 + 7, delivered by PBIs 04–07 — commits `9615899`, `850f200`, `daa27ae`, `762cc44`); no math changes. Sentence 2 is the operative ask: dim the ring track from `#1F2937` to `#111827` while preserving the foreground `#3B82F6` remaining-time arc. See Decision 8 below.

Amendment 2026-05-08 #3: the learner asked to "make the ring follow the REMAINING time, when the pomodoro timer is started. Also change visualization implementation from SVG to pure CSS. Make the ring a soft red color when working and green when resting. Show a small label above the timer: 'work' when working, 'rest' when resting." Sentence 1 ("REMAINING time") is reinforcement only — the visible arc length already encodes `secondsRemaining / duration` per Decisions 4 + 7 (delivered by PBIs 04–07 and verified by the `dashOffset = elapsed / duration` math at commit `09c2af4`); no behavioral change is introduced. The operative changes are: (a) the ring rendering converts from SVG (`<svg>` + two `<circle>`s) to pure CSS (a single ring container element driven by a `--progress` CSS custom property) — see Decision 9; (b) the ring foreground color becomes phase-dependent — `#F87171` (Tailwind red-400) in `running` (work) and `paused-from-work`, `#34D399` (Tailwind emerald-400) in `resting` and `paused-from-rest`, `#3B82F6` retained in `idle | completed` — see Decision 10; (c) a small heading label is rendered inside the ring container above the MM:SS display, with text exactly `"work"` (lowercase) in `idle | paused-from-work | running (work) | completed` and `"rest"` (lowercase) in `resting | paused-from-rest`, and the existing top-of-card `<h2>` "Work Time" / "Rest Time" title is REMOVED — the heading semantic moves to the small label inside the ring container — see Decision 11. The play button background (`#155DFC`), slider accent (`#3B82F6`), focus rings (`#3B82F6`), and Settings-button focus (`#3B82F6`) all retain their current color tokens — only the ring foreground changes color per phase. The four-segment idle pattern (Figma node `1:11`) is no longer pinned: idle now renders as a flat ring (no segmentation) with foreground color `#3B82F6`. The SVG-era ring assertions written under PBIs 03/05/08 (`pathLength=1`, `stroke-dasharray="1 1"`, `<circle>` queries, the four-segment dasharray check, the SVG track-stroke check) are explicitly authorized to be replaced wholesale by CSS-era assertions; this rewrite is not a regression. Decisions 9, 10, 11 below pin the new contract.

Amendment 2026-05-08 #4: the learner asked to "make changing the times reset the clock". Any change to either the Work-length slider or the Rest-length slider now transitions the card to a clean `idle` state with `phase = "work"`, `secondsRemaining = workMinutes * 60`, and ring `--progress = 0` — i.e. slider movement is observably equivalent to a click on the Reset button. This **inverts** the prior mid-interval clause of Decision 6 ("Slider changes during an active interval do not retroactively rescale `secondsRemaining`; they apply at the next entry to that phase"), which is now superseded. Opening or closing the settings panel itself remains inert per Decision 5 — only **moving a slider** triggers the reset. The trade-off is explicit: the "pause → tweak → resume" workflow is gone; the learner trades that flexibility for predictability — every settings tweak yields a clean idle. See Decision 12 below.

Amendment 2026-05-08 #5: the learner asked for `24px` padding on the pomodoro card, replacing the previous `p-[33px] pb-[32px]` from the Figma node `1:3` literals. Decision 13 pins the new value: the card root uses `p-[24px]` (24px on all four sides) — symmetric padding instead of the prior asymmetric pairing. No other Visual Contract literals change; the inner column `gap-[32px]`, the card width `~410.66px`, the background `#101828`, the `1px` border `#1E2939`, and the radius `10px` are all unaffected. The shell-level top padding (`32px`) and horizontal gutters (`58.5px`) owned by `src/app/layout.tsx` per `.specs/app-shell/spec.md` Decision 1 are likewise unaffected — Decision 13 amends the card's own padding only.

### Decisions

These decisions are pinned here so they are not reopened during build:

1. **One spec, two PBIs.** [Original 2026-05-06] The widget and the home-route restructure are bundled in this single spec because the design pairs them on one frame (Figma node `1:3`), the home route has nothing meaningful to display until the widget exists, and at one widget there is no independent "grid" feature to spec. They land as two PBIs: `pbi/01-pomodoro-widget.md` (the widget at `src/app/widgets/pomodoro/`) and `pbi/02-home-showcase.md` (the home-route restructure at `src/app/page.tsx`). PBI 02 depends on PBI 01 only for the link target; the widget route works standalone.
2. **`layout.tsx` owns shared page chrome.** [DEPRECATED 2026-05-06 — superseded by .specs/app-shell/spec.md Decision 1] The original wording said "fonts only" — that has been superseded. As of `.specs/app-shell/spec.md`, `src/app/layout.tsx` owns the shared page chrome: page background (`#030712`), container max-width (`1280px`), horizontal gutters (`58.5px`), top padding (`32px`), and the `next/font/google` variables (Geist, Geist Mono, Space Grotesk, Inter). The pomodoro widget no longer applies its own page-chrome wrapper; `src/app/widgets/pomodoro/page.tsx` simply mounts `<PomodoroCard />` and inherits the shell.
3. **Settings gear: rendered as decorative, no-op.** [DEPRECATED 2026-05-08 — superseded by Decision 5 below; learner authorized a real settings panel under the polish license, no Figma frame required] The Figma showed a settings gear in the top-right of the card but no settings panel frame and no behavior evidence, so it was rendered as a non-interactive visual element with `aria-hidden="true"` and no click handler. Re-introducing a real settings panel was originally framed as a future spec triggered by a follow-up Figma frame; the 2026-05-08 amendment lifts that gating in favor of the learner's stated intent (intake → "Settings UI shape" decision).
4. **Ring renders timer progress (lifts deferral).** [AMENDED 2026-05-08 — supersedes the 2026-05-06 counter-clockwise / explicit-circumference formulation] (Note: SVG-specific phrasing in this Decision — "the foreground `<circle>` switches to a single-arc dasharray" — is superseded by Decision 9 from 2026-05-08 #3 onward. The BEHAVIOR survives unchanged — idle is flat-or-distinguishable, the active interval drains over its duration — but the ENCODING moves from an SVG dasharray to a CSS `--progress` custom property. Read this Decision for the behavioral contract; read Decision 9 for the encoding.) The deferral added 2026-05-06 ("any elapsed-vs-remaining visualisation is deferred to a follow-up spec triggered by additional Figma frames") was lifted on 2026-05-06 in response to the learner's stated intent: "update the ring: make it show the progress of the timer." No running-state Figma frame existed; the visual shape (Option A — continuous drain) was chosen by the learner from a set of plausible interpretations enumerated by the Analyst during `/triage`. The four-segment dashed pattern is **preserved for `idle` only**; in `running`, `paused`, `resting`, and `completed` states the foreground `<circle>` switches to a single-arc dasharray whose visible length encodes the **elapsed fraction** of the active interval. The 2026-05-08 amendment simplifies the binding contract from the earlier circumference-based form to a `pathLength=1` form (Decision 6 below) and pins the drain direction as **clockwise** (Open Question #1 from the intake is closed in favor of clockwise drain). This Decision is **re-affirmed and re-introduced** by the 2026-05-08 amendment because PBI 03 (`feat(pomodoro): four-segment dashed ring`, `b459920`) shipped a static ring that contradicts this Decision. The current spec update closes that drift.
5. **Settings panel — Settings button + collapsible region + two sliders.** [Added 2026-05-08, supersedes Decision 3] The card carries a single, real `<button type="button">` with accessible name "Settings" (the existing gear icon is repurposed as that button's child icon, no longer `aria-hidden="true"`). Clicking it toggles a collapsible region rendered inside the card. The region contains exactly two `<input type="range">` sliders: one labeled "Work length" (range `5`–`60` minutes, step `1`, default `25`) and one labeled "Rest length" (range `1`–`30` minutes, step `1`, default `5`). State is session-only via `useState` inside `PomodoroCard.tsx`; the values do **not** read from or write to `localStorage`, cookies, the URL, or any other persistence. Reloading the page resets both sliders to their defaults. The panel is collapsed by default; opening or closing it does not affect the timer state or `secondsRemaining`. The panel is anchored to existing Figma-pinned tokens (`#101828`, `#1E2939`, `#3B82F6`, `#99A1AF`, Inter / Space Grotesk) and introduces no new color tokens.
6. **Strict-alternation work / rest cycle.** [Added 2026-05-08] The state machine adds a `resting` state. Strict alternation: `idle → running(work) → resting → running(work) → resting → …`; there is no long-break-every-4 and no auto-stop after N cycles. When a `running` work interval reaches `00:00`, the card transitions to `resting` and `secondsRemaining` is set to `restMinutes * 60`. When a `resting` interval reaches `00:00`, the card transitions back to `running` (a fresh work interval) and `secondsRemaining` is set to `workMinutes * 60`. `completed` is no longer reachable in normal play (an interval reaching zero advances to the next phase rather than terminating); reset returns to `idle` from any state and re-applies the current `workMinutes` value. The `completed` member of the union may be retained for future use, but no transition in this spec produces it. [DEPRECATED 2026-05-08 #4 — superseded by Decision 12: any slider change now resets the clock to idle] Slider changes during an active interval do not retroactively rescale `secondsRemaining`; they apply at the **next** entry to that phase (see Scenarios).
7. **Ring uses `pathLength=1` for state-independent dashoffset arithmetic.** [DEPRECATED 2026-05-08 #3 — superseded by Decision 9: SVG-specific `pathLength=1` math is replaced by a CSS `--progress` percentage encoding] [Added 2026-05-08, supersedes the 2026-05-06 explicit-`C` form] The foreground `<circle>` in `running`, `paused`, `resting`, and post-completion frozen states sets the SVG attribute `pathLength="1"` and uses `stroke-dasharray="1 1"`. The drain is encoded as `stroke-dashoffset = elapsed / duration` where `elapsed` is the seconds elapsed in the current interval and `duration` is `workMinutes * 60` (in `running`) or `restMinutes * 60` (in `resting`). Drain direction is **clockwise from the 12 o'clock anchor** (the visible arc retracts clockwise as time elapses). Direction is achieved by combining the existing `−90°` rotation about `(172.332, 128)` with a positive `stroke-dashoffset`; implementations that achieve clockwise drain by an alternate but equivalent SVG construction are acceptable as long as the visible arc shrinks clockwise from 12 o'clock. Numeric values may be rounded to four decimals in the rendered DOM (tolerance ±`0.005`).
8. **Ring track color dimmed to `#111827`.** [Added 2026-05-08 #2; AMENDED 2026-05-08 #3 — foreground-color clause superseded by Decision 10; track-color clause survives, rebound from "the track `<circle>`" to "the CSS ring track" so the binding works for both the historical SVG reading and the post-#3 CSS reading of the ring] The CSS ring track (the dimmer backdrop layer behind the foreground remaining-time arc, whether expressed as an SVG `<circle stroke=...>` under the pre-#3 reading or as a `conic-gradient` track stop / mask backdrop under the post-#3 CSS reading) resolves to color `#111827` in all states (`idle`, `running`, `paused`, `resting`, `completed`). The new track shade is significantly dimmer than `#1F2937`, producing a visually quieter backdrop against the card background `#101828` while keeping the foreground arc as the dominant cue. Everything else about the ring's static geometry remains unchanged: container size `~344.66px × 256px`, observable stroke width matching the prior `10.24px` SVG stroke, 12 o'clock anchor for the visible arc start, clockwise drain direction (Decision 9 carries this forward). This Decision extends the polish-DoD palette by exactly one literal (`#111827`); `#1F2937` remains in the palette because other elements may still reference it (the ring track no longer does). The earlier wording of this Decision pinned the foreground stroke to `#3B82F6`; that pin is REMOVED — foreground color is now phase-dependent per Decision 10.
9. **Ring renders in pure CSS, not SVG.** [Added 2026-05-08 #3] The ring is rendered as a single circular element (a `<div>` or equivalent block-level element) styled entirely via CSS. The ring container after this amendment lands contains NO `<svg>` and NO `<circle>` element; the prior SVG-based ring (two concentric `<circle>`s inside an `<svg viewBox="0 0 344.664 256">`) is replaced wholesale. The ring element exposes a CSS custom property `--progress` whose value is in the range `0..1` and equals `elapsed / duration`, where `elapsed` is the seconds elapsed in the current interval and `duration` is `workMinutes * 60` (in `running` and `paused-from-work`) or `restMinutes * 60` (in `resting` and `paused-from-rest`). Numeric `--progress` values may be rounded to four decimals (tolerance ±`0.005`); the prior SVG `stroke-dashoffset` rounding rule carries over verbatim. The visible arc retracts **clockwise from the 12 o'clock anchor** as `--progress` increases from `0` toward `1`; pause-freeze (`--progress` does not change while paused) carries over verbatim from Decision 7. The idle ring is rendered as a **flat ring** (no four-segment 60°/30° pattern; no segmentation) with foreground color `#3B82F6` (Decision 10's idle color) and `--progress = 0` or absent. The CSS technique is left to `@Dev`; recommended fits include a `background: conic-gradient(<foreground> calc(var(--progress) * 360deg), <track> 0)` masked into a ring shape via `mask: radial-gradient(circle, transparent <inner-r>, black <inner-r>)`, OR a double-element technique, OR `border` + clip-path tricks. Tailwind utilities may carry the mask geometry; the `conic-gradient` itself may be expressed in an inline `style` attribute (preferred — it preserves the spec's "no CSS Module" guardrail) or in a colocated CSS Module (NOT preferred; only acceptable if Tailwind utilities cannot express the technique). The implementation technique is NOT pinned in this spec; only the OBSERVABLE contract is pinned: ring container size unchanged (~`344.66px × 256px`), observable stroke width matching the prior `10.24px`, no `<svg>` / `<circle>` descendant, a `--progress` custom property in `0..1`, clockwise drain from 12 o'clock, pause-freeze, flat idle ring.
10. **Phase-dependent ring foreground color.** [Added 2026-05-08 #3] The ring foreground color is phase-dependent: `#F87171` (Tailwind red-400, "soft red") in `running` (work) and `paused-from-work`; `#34D399` (Tailwind emerald-400, "soft green") in `resting` and `paused-from-rest`; `#3B82F6` retained in `idle` and `completed` (idle reads as a "neutral" pre-start state). The track color is `#111827` (Decision 8) in all states. On phase advance (`running → resting` or `resting → running`), the ring foreground color flips within ONE render frame — there is no animated cross-fade between phase colors. ("Within one render frame" is to be read as: a synchronous re-render triggered by the same React state transition that resets `--progress` to `0` when the phase advances; no `setTimeout` or animation timeline interposes between the phase transition and the color flip.) The phase-color scope is intentionally narrow: ONLY the ring foreground changes color per phase. The play button background (`#155DFC`), the reset button background (`#1E2939`), the slider accent (`#3B82F6`), the play/reset focus rings (`#3B82F6`), and the Settings button focus ring (`#3B82F6`) ALL retain their current color tokens. This Decision extends the polish-DoD palette by exactly two literals: `#F87171` and `#34D399`.
11. **Phase label above the time display.** [Added 2026-05-08 #3] An `<h2>` heading element is rendered INSIDE the ring container, positioned above the MM:SS time display, centered. Its text content is exactly `"work"` (lowercase) in states `idle | paused-from-work | running (work) | completed`, and exactly `"rest"` (lowercase) in states `resting | paused-from-rest`. Typography: Inter Regular, font-size `12px`, line-height `16px`, color `#99A1AF`; no letter-spacing override is applied unless the rendered element visually deviates from the design at default Inter spacing. The label is ALWAYS visible — not hidden in idle, not hidden in any state. The previous top-of-card `<h2>` "Work Time" / "Rest Time" title is REMOVED: the card header row keeps the Settings button on the right but no longer carries a left-side title. The heading semantic of the card is preserved by the new small label — it is rendered as the same `<h2>` element type, so existing tests that query the card by `getByRole("heading", ...)` continue to find a heading; only the accessible name changes (from `/work time/i` / `/rest time/i` to `/^work$/i` / `/^rest$/i`). The ring container, which previously carried `aria-hidden="true"` purely for the SVG-decorative reading, MAY be left without `aria-hidden` after this amendment so the heading inside it is reachable by assistive tech; if `aria-hidden` is retained on the ring container, the heading must be hoisted out of the hidden subtree (the binding requirement is that the heading is queryable by `getByRole("heading", { name: /^work$/i })` etc.).
12. **Any slider change resets the clock.** [Added 2026-05-08 #4, supersedes the final sentence of Decision 6] Any change to either of the two `<input type="range">` sliders inside the settings panel — Work length OR Rest length — transitions the card to a clean `idle` state. Concretely: `state` becomes `idle`, `phase` becomes `"work"`, `secondsRemaining` is reassigned to `workMinutes * 60` (re-reading the post-change `workMinutes` value when the Work slider was the trigger; re-reading the unchanged `workMinutes` when the Rest slider was the trigger), the ring foreground color returns to the idle color `#3B82F6` per Decision 10, and the ring's `--progress` returns to `0` (or absent). This applies regardless of the prior state — `running`, `paused`, `resting`, `paused-from-rest`, `idle`, or `completed`. The settings panel itself stays open across the reset (slider movement does not toggle the panel; opening/closing the panel remains inert per Decision 5 — only moving a slider triggers the reset). The Reset button continues to behave the same way it always did; Decision 12 makes slider movement observably equivalent to a Reset click. **Trade-off pinned explicitly:** this kills the "pause → tweak slider → resume from where I was" workflow that the prior Decision-6 mid-interval clause permitted. The learner accepts this trade — every settings tweak yields a clean idle, in exchange for a single, predictable rule with no "values apply at the next entry to that phase" ambiguity.
13. **Pomodoro card padding amended to `p-[24px]`.** [Added 2026-05-08 #5, supersedes the card-padding clause of the Visual Contract Card bullet that originally pinned `p-[33px] pb-[32px]`] The card root applies `24px` of padding on all four sides — expressed in Tailwind as `p-[24px]` (no separate `pb-` override). The previous `p-[33px] pb-[32px]` from Figma node `1:3` is **superseded** wholesale; implementations must replace both utilities with the single `p-[24px]` utility. No other Visual Contract literals change: card width `~410.66px`, background `#101828`, border `1px #1E2939`, radius `10px`, and inner column `gap-[32px]` are all unaffected. The shell-level top padding (`32px`) and horizontal gutters (`58.5px`) owned by `src/app/layout.tsx` per `.specs/app-shell/spec.md` Decision 1 are NOT changed by this Decision — Decision 13 amends the card's own padding only. The binding contract is observable from the rendered card root's `className`: it MUST match `/p-\[24px\]/` and MUST NOT match `/p-\[33px\]/` or `/pb-\[32px\]/`.

### Architecture

- **New files (created by this spec):**
  - `src/app/widgets/pomodoro/page.tsx` — server component route for `/widgets/pomodoro`, renders the page chrome and the client-side timer card.
  - `src/app/widgets/pomodoro/PomodoroCard.tsx` — `"use client"` component owning timer state (`idle | running | paused | resting | completed`), `secondsRemaining`, `workMinutes`, `restMinutes`, `settingsOpen`, the `setInterval` lifecycle, and the visual card.
  - `src/app/widgets/pomodoro/PomodoroCard.test.tsx` — Vitest + Testing Library coverage of timer transitions, settings panel, ring contract per state, and a11y queries.
  - `src/app/widgets/pomodoro/format-time.ts` — pure helper `formatMmSs(seconds: number): string` (zero-padded `MM:SS`).
  - `src/app/widgets/pomodoro/format-time.test.ts` — unit coverage of the formatter.
  - `.specs/pomodoro/pbi/01-pomodoro-widget.md`, `.specs/pomodoro/pbi/02-home-showcase.md`, `.specs/pomodoro/pbi/03-dashed-ring.md` — historical PBI files (already shipped). The 2026-05-08 follow-up PBIs are authored by `/plan`, not by this spec.
- **Modified files:**
  - `src/app/layout.tsx` — add `Space_Grotesk` (weight `700`) and `Inter` (weight `400`) imports from `next/font/google`, expose them as `--font-space-grotesk` and `--font-inter` CSS variables on the `<html>` element. Keep the existing `Geist` and `Geist_Mono` variables untouched. (Per `.specs/app-shell/spec.md`, `layout.tsx` also owns the shared page chrome — background, max-width, gutters, top padding — and renders the single `<main>` wrapper. `src/app/widgets/pomodoro/page.tsx` no longer carries those chrome utilities.)
  - `src/app/page.tsx` — replaced wholesale (PBI 02) with the "Widget Showcase" header + one card linking to `/widgets/pomodoro`. Stays a server component.
- **Visual contract — Figma node `1:3` (literals from intake P4, no Figma variables):**
  - Page background `#030712`; container max width `1280px`, `32px` top padding, `~58.5px` horizontal padding from the app frame edges. (Owned by `src/app/layout.tsx` per `.specs/app-shell/spec.md` Decision 1; the pomodoro route inherits these.)
  - Header block: gradient text "Widget Showcase" in Space Grotesk Bold `36px / 40px`, gradient `linear-gradient(90deg, #51A2FF 0%, #AD46FF 100%)` clipped to text. Subtitle in Inter Regular `16px / 24px`, color `#99A1AF`, letter-spacing `-0.3125px`. `8px` gap between heading and subtitle.
  - Home-page rhythm: `gap-[48px]` between the "Widget Showcase" header block and the card (Figma node `1:4`).
  - Card: width `~410.66px`, background `#101828`, `1px` border `#1E2939`, radius `10px`. Card frame uses `p-[24px]` (24px on all four sides) [Amended 2026-05-08 #5 — supersedes the prior `p-[33px] pb-[32px]` per Decision 13]; inner column uses `gap-[32px]` (see `.specs/app-shell/spec.md` Decision 6). The card's height is allowed to grow when the settings panel is open (intrinsic, not fixed); the original `~478px` figure from the 2026-05-06 spec was an idle-state observation and is no longer a binding constraint. [DEPRECATED 2026-05-08 #5 — superseded by Decision 13] The original wording read: "Card frame uses `p-[33px] pb-[32px]`" — those literals derived from Figma node `1:3` and have been replaced.
  - Card title: [DEPRECATED 2026-05-08 #3 — superseded by Decision 11; the top-of-card `<h2>` "Work Time" / "Rest Time" is REMOVED. The card header row keeps the Settings button on the right and no longer carries a left-side title. The heading semantic moves inside the ring container, above the time display, with new text/typography per the Phase Label entry below.] Original wording: Space Grotesk Bold `24px / 32px`, color `#FFFFFF`. The title text reflected the active phase: `"Work Time"` in `idle`, `running`, `paused`, and `completed`; `"Rest Time"` in `resting`.
  - Phase label (inside ring container, above the time display) [Added 2026-05-08 #3, per Decision 11]: an `<h2>` element with text exactly `"work"` (lowercase) in `idle | paused-from-work | running (work) | completed`, and exactly `"rest"` (lowercase) in `resting | paused-from-rest`. Typography: Inter Regular `12px / 16px`, color `#99A1AF`. Centered above the MM:SS span. Always visible. Implemented in Tailwind as roughly `text-[12px] leading-[16px] font-[var(--font-inter)] text-[#99A1AF] text-center` (exact utility composition is implementation-defined; the binding contract is: the rendered element's `className` includes `text-[12px]` (or numerically equivalent), `text-[#99A1AF]`, and a `font-[var(--font-inter)]` class binding).
  - Time display: Space Grotesk Bold `60px / 60px`, color `#FFFFFF`, centered. Initial value `25:00` (1500 seconds, derived from the default `workMinutes = 25`).
  - Circular ring container `~344.66px × 256px` [REWRITTEN 2026-05-08 #3 — the ring is now rendered in pure CSS per Decision 9; the SVG-specific block immediately below this one is preserved as a deprecated audit record]. The ring is rendered as a single circular element (a `<div>` or equivalent block-level element) styled entirely via CSS — there is NO `<svg>` and NO `<circle>` element inside the ring container. The container has the same outer dimensions as before (`~344.66px × 256px`).

    The ring's static geometry under the CSS reading:
    - **Track:** color `#111827` (Decision 8). Visible across the full circle in all states. The CSS technique that paints the track is implementation-defined (the conic-gradient's "remaining" stop, a base-layer color under the foreground, a double-element approach, etc.) — the binding contract is that the rendered track color resolves to `#111827`.
    - **Foreground:** color is phase-dependent per Decision 10 — `#F87171` in `running` (work) and `paused-from-work`, `#34D399` in `resting` and `paused-from-rest`, `#3B82F6` in `idle` and `completed`. The foreground anchor is the 12 o'clock position; the visible arc starts at 12 o'clock and (when active) retracts clockwise.
    - **Stroke width:** the observable ring thickness matches the prior `10.24px` SVG `stroke-width` value. Implementations may achieve this via `mask: radial-gradient(circle, transparent <inner-r>, black <inner-r + 1px>)`, via a double-element ring with an inner cutout `background-color`, or via `border` + `border-radius` tricks — the technique is not pinned, only the observable thickness is.

    The ring's dynamic behavior under the CSS reading:
    - The ring exposes a CSS custom property `--progress` whose value is in `0..1` and equals `elapsed / duration`, where `duration` is `workMinutes * 60` while the current phase is work (states `running` and `paused-from-work`) or `restMinutes * 60` while the current phase is rest (states `resting` and `paused-from-rest`), and `elapsed = duration − secondsRemaining`.
    - The recommended encoding is a `background: conic-gradient(<foreground> calc(var(--progress) * 360deg), <track> 0)` painted onto a ring shape via `mask`. Equivalent encodings (e.g. `background-image` driven by `var(--progress)`, an animated `clip-path`, two stacked elements where one's `width` or `transform` is driven by `var(--progress)`) are acceptable provided the observable contract holds.
    - At `idle → running` (`secondsRemaining = duration`, `elapsed = 0`), `--progress = 0` — the visible arc covers the full ring.
    - At `secondsRemaining = 0`, `--progress = 1` — the visible arc has zero length.
    - At `secondsRemaining = duration / 2`, `--progress = 0.5`.
    - Drain direction is **clockwise** from the 12 o'clock anchor.
    - On `running → paused`, `--progress` does not change while paused; on `paused → running`, draining resumes from the frozen value.
    - On phase advance (`running` work → `resting`, or `resting` → `running` work), `secondsRemaining` is reassigned to the new phase's duration, `--progress` resets to `0`, and the foreground color flips per Decision 10 within one render frame.
    - On reset (`* → idle`), `--progress` returns to `0` (or is absent) and the foreground color returns to the idle color `#3B82F6`. The flat idle ring is the new idle visual — there is no four-segment 60°/30° pattern.

    Numeric `--progress` values may be rounded to four decimals in the rendered DOM (tolerance ±`0.005`); the proportions and direction are the binding contract. The transition between the idle flat ring and the active drained ring on `idle → running` is **instantaneous** (no tween between the two visual states themselves; the `--progress` value within the active range MAY be tweened per the polish bullet for ring transition).

    Inside the ring container, an `<h2>` heading with text `"work"` or `"rest"` (Decision 11) is rendered above the MM:SS time display.

    [DEPRECATED 2026-05-08 #3 — superseded by the CSS Ring block above. The SVG block below is preserved verbatim as an audit record of the pre-#3 contract.]

    > Circular ring container `~344.66px × 256px`, with the ring SVG using `viewBox="0 0 344.664 256"` and centered at `(172.332, 128)`. The ring is a **dashed circular stroke**, not a continuous progress arc, evidenced by Figma node `1:20` (SVG export retrieved 2026-05-06). Two concentric `<circle>` elements at `cx=172.332`, `cy=128`, `r=115.2`, both with `stroke-width=10.24` and `fill=none`:
    >
    > - **Track:** `stroke=#111827` (amended 2026-05-08 #2 from #1F2937 per Decision 8), no dasharray, no linecap override, no `pathLength`.
    > - **Foreground:** `stroke=#3B82F6`, `stroke-linecap=round`, anchored at 12 o'clock via a `−90°` rotation about `(172.332, 128)` on the foreground `<circle>` or its parent `<g>` (or by an equivalent dashoffset construction).
    >
    > The foreground dashing depends on the timer state:
    >
    > - **`idle`:** `stroke-dasharray="120.637 60.319"` (each dash subtends 60° of arc, each gap subtends 30°, producing **exactly four** equal segments separated by equal gaps around the circle, 90° rotational symmetry). No `pathLength`. The screenshot at idle (`25:00`) shows segments at 12/3/6/9 o'clock.
    > - **`running`, `paused`, `resting`, `completed`:** the foreground sets `pathLength="1"` and uses `stroke-dasharray="1 1"`. The drain is encoded as `stroke-dashoffset = elapsed / duration`, where:
    >   - `duration = workMinutes * 60` while the current phase is work (states `running` from a work interval, and `paused` while paused mid-work), and `restMinutes * 60` while the current phase is rest (`resting`).
    >   - `elapsed = duration − secondsRemaining`.
    >   - At the moment of `idle → running` (`secondsRemaining = duration`), `stroke-dashoffset = 0` — the visible arc covers the full ring.
    >   - At `secondsRemaining = 0`, `stroke-dashoffset = 1` — the visible arc has zero length.
    >   - At `secondsRemaining = duration / 2`, `stroke-dashoffset = 0.5`.
    >   - Drain direction is **clockwise** from the 12 o'clock anchor (the visible arc retracts clockwise as time elapses).
    >   - On `running → paused`, both `stroke-dasharray` and `stroke-dashoffset` freeze at their current values; on `paused → running`, draining resumes from the frozen offset.
    >   - On phase advance (`running` work → `resting`, or `resting` → `running` work), `secondsRemaining` is reassigned to the new phase's duration and `stroke-dashoffset` resets to `0`.
    >   - On reset (`* → idle`), the foreground returns to the four-segment dasharray (no `pathLength` attribute, no `stroke-dashoffset`).
    >
    > The transition between idle's four-segment dasharray and the single-arc dasharray on `idle → running` is **instantaneous** (no tween). Numeric `stroke-dashoffset` values may be rounded to four decimals in the rendered DOM (tolerance ±`0.005`); the proportions and direction are the binding contract.
    >
    > The literals for the static base geometry above this block (`viewBox="0 0 344.664 256"`, two `<circle>`s at `cx=172.332`, `cy=128`, `r=115.2`, `stroke-width=10.24`, track `#111827` (amended 2026-05-08 #2 from `#1F2937` per Decision 8), foreground `#3B82F6` with `stroke-linecap=round`) remain unchanged and apply to all states.

    [DEPRECATED 2026-05-06 amendment block, superseded 2026-05-08] The earlier formulation in this section pinned the running-state drain to an explicit `C = 2π · 115.2 ≈ 723.823` with `stroke-dasharray="C C"` and `stroke-dashoffset = C · (1 − secondsRemaining / 1500)`, draining counter-clockwise from 12 o'clock and assuming a fixed `1500`-second duration. The 2026-05-08 amendment supersedes this with the `pathLength=1`, clockwise, work/rest-aware form above. The historical block is preserved here for audit:

    > Define `C = 2π · 115.2` (the circumference, `≈ 723.823`). In `running` and `paused` states, the foreground `<circle>` uses `stroke-dasharray="C C"` (i.e. both values equal to `C`, not the four-segment `120.637 60.319`) and `stroke-dashoffset = C · (1 − secondsRemaining / 1500)`. At `secondsRemaining = 0`, `stroke-dashoffset = C` — the visible arc has zero length. Direction of drain: counter-clockwise from the 12 o'clock anchor.

    (Amendment 2026-05-06: re-verified live against Figma node `1:11` / `1:20` via figma-desktop MCP. Corrects earlier same-day amendment that used wrong literals — the actual Figma colors are `#3B82F6` foreground / `#1F2937` track, and the stroke width is `10.24px`, not the previously-stated `#155DFC` / `#1E2939` / `12px`. The SVG export's literal `stroke-dasharray="723.82 723.82"` is a Figma export artifact for a dashed pattern that the renderer displays as four 60°/30° segments — the spec pins the four-segment interpretation since it matches the rendered screenshot.)

    (Amendment 2026-05-06 #3: lifted the running-state deferral added earlier today.)

    (Amendment 2026-05-08: PBI 03 (`b459920`) shipped a static ring contradicting Decision 4. This spec update closes that drift and simplifies the dynamic-ring math from explicit-circumference to `pathLength=1`. Drain direction pinned clockwise; resolves intake Open Question #1.)

  - Button row centered, two `56×56` buttons, `16px` gap; play button background `#155DFC`; reset button background `#1E2939`; both `10px` radius.
  - **Settings button:** the `36×36` element in the top-right of the card is now a real `<button type="button" aria-label="Settings">`. Visually it uses the same gear glyph at `20×20` over a transparent or `#1E2939` background; rounded corners `10px`. The button has a visible focus ring (`focus-visible:ring-2 focus-visible:ring-[#3B82F6]` or equivalent Tailwind utility composition) and a visible hover state (`hover:bg-[#1E2939]` when default-transparent, or a one-step-lighter alternative — the binding requirement is that hover changes a computed style that Testing Library can observe via class presence).
  - **Settings panel (open state):** a `<section aria-label="Timer settings">` rendered inside the card directly below the ring container or directly above the button row (implementation may choose; both placements satisfy the contract). Background `#0B1220` or `#101828` with a `1px` `#1E2939` divider above it; padding `16px`; column layout with `gap-[12px]` between the two slider rows. Each slider row contains: a `<label>` (Inter Regular `14px / 20px`, color `#99A1AF`) showing the slider name and current value (e.g. `"Work length — 25 min"`), followed by an `<input type="range">` whose track uses `#1E2939` and whose accent is `#3B82F6` (via Tailwind `accent-[#3B82F6]`). The slider thumb does not require a custom appearance beyond `accent-color`. The panel's open/close transition uses a CSS height or opacity transition of `150–250 ms` (Tailwind `transition-all duration-200` or equivalent); abrupt show/hide without transition is also acceptable provided no console warnings or layout-thrash errors occur.

- **State machine for the timer card:**
  - States: `idle` (initial; `secondsRemaining = workMinutes * 60`), `running`, `paused`, `resting`, `completed`. The `completed` member is retained in the type union but no transition in this spec produces it; reaching `00:00` advances to the next phase per Decision 6.
  - `idle → running` on play click; `running → paused` on pause click; `paused → running` on play click; `running → resting` when `secondsRemaining` reaches `0` while the active phase is work (and `secondsRemaining` is reassigned to `restMinutes * 60`); `resting → running` when `secondsRemaining` reaches `0` while the active phase is rest (and `secondsRemaining` is reassigned to `workMinutes * 60`); `* → idle` on reset click (and `secondsRemaining` is reassigned to `workMinutes * 60`).
  - The play button label/icon swap reflects `running` and `resting` (shows pause icon, accessible name matches `/pause/i`) vs `idle` and `paused` (shows play icon, accessible name matches `/start|play|resume/i`). Reset is always available.
  - [DEPRECATED 2026-05-08 #4 — superseded by Decision 12: any slider change now resets the clock to idle] Slider changes during an active interval do not retroactively rescale `secondsRemaining`. The new value is applied the next time that phase begins (e.g. after the current rest interval ends and a new work interval begins). Reset always re-reads the current `workMinutes` value.
  - [Added 2026-05-08 #4, per Decision 12] Any change to either slider (Work length or Rest length) transitions `state → idle`, `phase → "work"`, `secondsRemaining = workMinutes * 60`, ring `--progress = 0`, ring foreground → `#3B82F6`. Slider movement is observably equivalent to a Reset click. The settings panel stays open across this reset.

- **Constraints:**
  - The widget folder `src/app/widgets/pomodoro/` is deletable in a single `rm -rf` and that command leaves the home route renderable (the home page renders a placeholder/empty state when the link target is missing — see Scenario "Widget folder deletion does not break the home route").
  - No new files are added under `src/lib/`, `src/components/`, or any shared directory; everything Pomodoro-specific lives in the widget folder.
  - No imports cross from `src/app/widgets/pomodoro/` into other widget folders, and no other code imports from `src/app/widgets/pomodoro/`.
  - The widget route `/widgets/pomodoro` is reachable directly without depending on the home route.
  - The home route (`src/app/page.tsx`) and the widget route (`src/app/widgets/pomodoro/page.tsx`) are both server components; only `PomodoroCard.tsx` carries `"use client"`.
  - Color, spacing, and typography literals from the Figma contract are inlined as Tailwind utility values (e.g. `bg-[#101828]`, `text-[60px]`) — no new shared theme tokens are introduced. The settings panel reuses these tokens; no new color tokens are introduced.
  - Slider, settings-panel, and timer state are session-only (`useState`); no `localStorage`, `sessionStorage`, cookies, or URL persistence is introduced. `git grep -n "localStorage\|sessionStorage" src/app/widgets/pomodoro` returns no matches.
  - React Compiler is enabled — no hand-written `useMemo`/`useCallback`.
  - Quality gate: `npm run lint`, `npm run test:run`, `npm run build` exit `0` after both PBIs land.

## Contract

### Definition of Done

#### Files and routing (carryover, still binding)

- [ ] `src/app/widgets/pomodoro/page.tsx` exists and is a server component (no `"use client"` directive on the file).
- [ ] `src/app/widgets/pomodoro/PomodoroCard.tsx` exists and starts with `"use client"`.
- [ ] `src/app/widgets/pomodoro/format-time.ts` exports a pure function `formatMmSs(seconds: number): string` returning a zero-padded `MM:SS` string for non-negative integer inputs.
- [ ] `src/app/layout.tsx` imports `Space_Grotesk` and `Inter` from `next/font/google` and applies their CSS variables (`--font-space-grotesk`, `--font-inter`) on the `<html>` element alongside the existing Geist variables.
- [ ] `src/app/page.tsx` no longer references `/next.svg`, `/vercel.svg`, "Deploy Now", or "Documentation" (verified by `git grep -n "vercel.svg\|next.svg\|Deploy Now\|Documentation" src/app/page.tsx` returning no matches).
- [ ] `src/app/page.tsx` renders a heading with accessible name "Widget Showcase".
- [ ] `src/app/page.tsx` renders a link with `href="/widgets/pomodoro"` whose accessible name contains "Pomodoro" or "Work Time".

#### Idle render and a11y

- [ ] Visiting `/widgets/pomodoro` renders a heading with accessible name matching `/^work$/i` (queryable via `getByRole("heading", { name: /^work$/i })`) on initial mount. (Amended 2026-05-08 #3: per Decision 11 the heading text is now lowercase `"work"` and lives inside the ring container above the time display; the prior top-of-card `<h2>` "Work Time" is removed.)
- [ ] Visiting `/widgets/pomodoro` renders an element whose text content is exactly `25:00` on initial mount (derived from default `workMinutes = 25`).
- [ ] Visiting `/widgets/pomodoro` renders a button with accessible name matching `/start|play/i` and a button with accessible name matching `/reset/i`.
- [ ] Visiting `/widgets/pomodoro` does NOT render any `<h2>` element with text "Work Time" or "Rest Time" anywhere in the card (verified by `queryByRole("heading", { name: /^(work|rest) time$/i })` returning `null`). [Added 2026-05-08 #3, per Decision 11]

#### Settings button + panel (Decision 5)

- [ ] The card renders a `<button type="button">` with accessible name "Settings" (queryable via `getByRole("button", { name: /settings/i })`).
- [ ] On initial mount, no element with accessible name "Timer settings" is in the document (the panel is collapsed by default; `queryByRole("region", { name: /timer settings/i })` returns `null`, or equivalent assertion against `aria-expanded="false"` on the Settings button).
- [ ] Clicking the Settings button toggles the panel: after one click, a region with accessible name "Timer settings" is in the document; after a second click, it is removed (or hidden such that Testing Library's `queryByRole` returns `null`).
- [ ] When open, the panel contains exactly two `<input type="range">` elements: one with accessible name matching `/work length/i` (`min="5"`, `max="60"`, `step="1"`, default `value="25"`) and one with accessible name matching `/rest length/i` (`min="1"`, `max="30"`, `step="1"`, default `value="5"`).
- [ ] When the user changes the Work length slider to `30` while in `idle`, the time display updates to `30:00` within the same render (the displayed time tracks `workMinutes * 60` while `idle`).
- [ ] When the user changes the Rest length slider to `10` while in `idle`, clicks Start, lets the work interval reach `00:00`, the card transitions to `resting` and the time display shows `10:00`. (Added 2026-05-08 #4 clarification: the rest-slider change while idle resets to idle per Decision 12, which is a no-op for the display since idle → idle leaves `secondsRemaining = workMinutes * 60`; the subsequent Start + phase advance reads the new `restMinutes` correctly.)
- [ ] After a hard reload of `/widgets/pomodoro`, both sliders return to their defaults (`25` and `5`). Verified by `git grep -n "localStorage\|sessionStorage" src/app/widgets/pomodoro` returning no matches **and** by a Vitest scenario that re-mounts the component and asserts the default values.

#### Strict-alternation cycle (Decision 6)

- [ ] The `TimerState` union in `PomodoroCard.tsx` includes the literal `"resting"`.
- [ ] When the timer is `running` from a work interval and `secondsRemaining` reaches `0`, the state becomes `resting`, `secondsRemaining` is reassigned to `restMinutes * 60`, and the phase label inside the ring container becomes a heading with accessible name matching `/^rest$/i`. (Amended 2026-05-08 #3: the prior "Rest Time" top-of-card title is replaced by the small lowercase `"rest"` label per Decision 11.)
- [ ] When the timer is in `resting` and `secondsRemaining` reaches `0`, the state becomes `running` (a fresh work interval), `secondsRemaining` is reassigned to `workMinutes * 60`, and the phase label becomes a heading with accessible name matching `/^work$/i`.
- [ ] Reset from any state returns the card to `idle` with `secondsRemaining = workMinutes * 60` and the phase label heading text matching `/^work$/i`.
- [ ] [INVERTED 2026-05-08 #4 — replaces the prior "slider changes mid-interval do not modify the current `secondsRemaining`" bullet, per Decision 12] Slider changes (Work or Rest) at any state reset the card to `idle`, set `phase = "work"`, and assign `secondsRemaining = workMinutes * 60`. Verified by a Vitest scenario that starts the timer, advances 10 seconds, slides Work length to `45`, asserts state is `idle` (the start button's accessible name matches `/start|play/i`, not `/pause/i`), the time display reads `45:00`, and the ring element's `--progress` is `0`.
- [ ] [Added 2026-05-08 #4, per Decision 12] The same reset behavior applies when the user changes the Rest length slider, regardless of current state. Verified by a Vitest scenario that starts the timer, advances 10 seconds, slides Rest length from `5` to `15`, asserts state is `idle`, the time display reads `25:00` (unchanged `workMinutes`), the start button's accessible name matches `/start|play/i`, and the ring `--progress` is `0`.

#### Ring contract (Decisions 9 + 10) [REWRITTEN 2026-05-08 #3 — replaces the prior "Ring contract (Decisions 4 + 7 + 8)" subsection; the previous SVG-keyed bullets are deprecated wholesale per Decision 9 and the test-rewrite authorization (C5)]

- [ ] The ring container does NOT contain any `<svg>` or `<circle>` descendant element after this amendment lands. Verified by `getRingContainer(container).querySelectorAll("svg, circle").length === 0` (or by the equivalent check that `container.querySelector("svg")` inside the ring scope returns `null`).
- [ ] In `idle` state, the ring foreground color resolves to `#3B82F6` (verified by computed style or by a `className` regex matching `/(bg|text|border|from|to|stroke|fill)-\[#3B82F6\]/` or equivalent that proves the color is bound to the foreground), the ring is rendered as a flat foreground (no four-segment 60°/30° pattern, no segmentation), and the `--progress` CSS custom property on the ring element is `0` or absent (verified by reading the inline `style` attribute or the computed style of the ring container).
- [ ] In `running` (work) and `paused-from-work` states, the ring foreground color resolves to `#F87171` (Decision 10) and the ring element exposes `--progress = elapsed / (workMinutes * 60)` where `elapsed = workMinutes * 60 − secondsRemaining`. Tolerance ±`0.005`. At `idle → running` `--progress = 0` (visible arc covers the full ring); at `secondsRemaining = 0` `--progress = 1`; at `secondsRemaining = (workMinutes * 60) / 2` `--progress = 0.5`.
- [ ] In `resting` and `paused-from-rest` states, the ring foreground color resolves to `#34D399` (Decision 10) and the ring element exposes `--progress = elapsed / (restMinutes * 60)` where `elapsed = restMinutes * 60 − secondsRemaining`. Tolerance ±`0.005`.
- [ ] On pause, the `--progress` custom property does not change while paused; verified by a Vitest scenario that pauses, advances `5000 ms`, and asserts `--progress` is unchanged from the value it held immediately before the pause click.
- [ ] On phase advance (`running → resting` or `resting → running`), `--progress` is reset to `0` and the foreground color flips within one render frame (verified by asserting both the new color and `--progress = 0` in the same render after the phase-advance trigger).
- [ ] The visible arc retracts **clockwise** from the 12 o'clock anchor as `--progress` increases from `0` toward `1` (binding contract; the technique by which the implementation achieves clockwise drain is implementation-defined).
- [ ] On reset, `--progress` returns to `0` (or is absent) and the foreground color returns to the idle color `#3B82F6`. Verified by the same checks used for the idle state.

#### Phase label (Decision 11) [Added 2026-05-08 #3]

- [ ] In states `idle`, `paused-from-work`, `running` (work), and `completed`, a heading element with accessible name matching `/^work$/i` is rendered INSIDE the ring container, above the MM:SS time display. Queryable via `getByRole("heading", { name: /^work$/i })`.
- [ ] In states `resting` and `paused-from-rest`, a heading element with accessible name matching `/^rest$/i` is rendered inside the ring container above the MM:SS time display.
- [ ] The phase label heading element's `className` includes `text-[12px]` (or a numerically equivalent Tailwind utility), `text-[#99A1AF]`, and a `font-[var(--font-inter)]` class binding (Decision 11 typography). Verified by reading the rendered `className` and matching against each substring.
- [ ] The card no longer contains an `<h2>` element with text "Work Time" or "Rest Time". Verified by `queryByRole("heading", { name: /^(work|rest) time$/i })` returning `null` in every state.

#### Polish (Decision 5 + learner polish license, C4)

Each bullet below is a concrete, machine-verifiable polish criterion. "Feels polished" is not acceptable.

- [ ] The play/pause button has a visible hover state: its rendered class list includes a `hover:` Tailwind utility that changes `background-color` or `opacity` (e.g. `hover:bg-[#1E4FCC]`, `hover:opacity-90`). Verified by querying the button and asserting its `className` matches `/hover:(bg-|opacity-)/`.
- [ ] The reset button has a visible hover state under the same rule (`className` matches `/hover:(bg-|opacity-)/`).
- [ ] The Settings button has a visible hover state under the same rule.
- [ ] The play/pause and reset buttons have a visible focus-visible ring: their `className` includes a `focus-visible:` Tailwind utility (e.g. `focus-visible:ring-2 focus-visible:ring-[#3B82F6]`). Verified by `className` regex `/focus-visible:/`.
- [ ] The ring element's `--progress` change is animated [Amended 2026-05-08 #3 — the prior `stroke-dashoffset`-keyed bullet is generalized so it works against the new CSS ring]: a CSS `transition` is bound to the property carrying the visible arc change (the `--progress` custom property itself, the `background` / `mask` / `background-image` shorthand, a derived stop-angle, or — under the deprecated SVG reading — `stroke-dashoffset`). Verified by inspecting either the `className` for a `transition-*` utility OR the `style` attribute for a non-empty `transition` value containing one of the substrings `progress`, `background`, `mask`, or `stroke-dashoffset`.
- [ ] Slider thumbs and tracks visually use the existing accent color `#3B82F6`: each `<input type="range">`'s `className` includes `accent-[#3B82F6]`.
- [ ] The settings panel uses one of the existing Figma-pinned background tokens (`#101828` or `#0B1220`) and the `#1E2939` divider/border token. Verified by `className` regex on the panel root: `/bg-\[#(101828|0B1220)\]/` and `/border-\[#1E2939\]/` (border may be on top or bottom).
- [ ] No new color literal outside the existing palette `{#030712, #0B1220, #101828, #111827, #1E2939, #1F2937, #155DFC, #3B82F6, #51A2FF, #AD46FF, #99A1AF, #F87171, #34D399, #FFFFFF}` appears in `src/app/widgets/pomodoro/PomodoroCard.tsx`. Verified by `git grep -nE "#[0-9A-Fa-f]{3,8}" src/app/widgets/pomodoro/PomodoroCard.tsx` and reviewing each match against the palette. (Palette extended 2026-05-08 #2 by `#111827` per Decision 8; extended 2026-05-08 #3 by `#F87171` and `#34D399` per Decision 10. `#1F2937` retained because other elements may still reference it — only the ring track moved off it; `#3B82F6` retained because it is still the idle ring foreground, slider accent, and focus-ring color — only the active-phase ring foreground swapped to red/green.)
- [ ] [Added 2026-05-08 #5, per Decision 13] The pomodoro card root applies `p-[24px]` (24px on all four sides) and does NOT apply the prior `p-[33px]` or `pb-[32px]` utilities. Verified by reading the card root element's `className` and asserting it matches `/p-\[24px\]/` AND does not match `/p-\[33px\]/` or `/pb-\[32px\]/`. Additionally, `git grep -nE "p-\[33px\]|pb-\[32px\]" src/app/widgets/pomodoro/PomodoroCard.tsx` returns no matches.

#### Test rewrite authorization (C5)

- [ ] The cross-state ring-invariance test currently at `src/app/widgets/pomodoro/PomodoroCard.test.tsx:167-190` ("ring pattern is invariant across timer states") is **explicitly authorized to be replaced** by per-state ring assertions matching the new contract: `idle` keeps the four-segment dasharray (no `pathLength`); `running`/`paused`/`resting` carry `pathLength="1"`, `stroke-dasharray="1 1"`, and a numerically correct `stroke-dashoffset`; reset returns to the four-segment idle form. Removing or rewriting that test under this spec is **not** a regression and `/review` shall not flag it as one.
- [ ] The decorative-gear test at `src/app/widgets/pomodoro/PomodoroCard.test.tsx:45-48` ("settings gear is decorative (aria-hidden, not a button)") is **explicitly authorized to be replaced** by an assertion that a real `<button>` with accessible name "Settings" exists. Removing or rewriting that test under this spec is **not** a regression.
- [ ] [Added 2026-05-08 #3] The SVG-era ring tests written under PBIs 03/05/08 — in particular: the ring track stroke assertions (`stroke="#111827"` / `stroke="#1F2937"` checks against `<circle>`), the `pathLength="1"` assertions, the `stroke-dasharray="1 1"` assertions, the four-segment `stroke-dasharray="120.637 60.319"` assertions, the `stroke-dashoffset` numeric assertions, and any `<circle>` element queries — are **explicitly authorized to be replaced wholesale** by CSS-era ring assertions querying the ring container's CSS custom properties (`--progress`), computed style (foreground color, track color), `className` regex (utility presence), or the absence of `<svg>`/`<circle>` descendants. This rewrite is **not** a regression and `/review` shall not flag it as one. Additionally: tests that queried `getByRole("heading", { name: /work time/i })` or `getByRole("heading", { name: /rest time/i })` are authorized to be rewritten to query `getByRole("heading", { name: /^work$/i })` and `getByRole("heading", { name: /^rest$/i })` respectively, per Decision 11.

#### Isolation and quality gates (carryover, still binding)

- [ ] `git grep -n "from \"@/app/widgets/pomodoro" src/app/widgets` returns no matches (no other widget imports from pomodoro).
- [ ] `git grep -nE "from ['\"]\\.\\./" src/app/widgets/pomodoro` returns no matches (the widget folder does not reach upward into `app/`).
- [ ] No new file is added under `src/lib/` or `src/components/` by this feature.
- [ ] `npm run lint` exits `0`.
- [ ] `npm run test:run` exits `0`.
- [ ] `npm run build` exits `0`.

### Regression Guardrails

- The existing `src/smoke.test.tsx` continues to pass unchanged.
- The Tailwind PostCSS pipeline (`postcss.config.mjs`, `@import "tailwindcss"` in `src/app/globals.css`) is not modified.
- React Compiler stays enabled (`next.config.ts` → `reactCompiler: true`).
- No `pages/` directory is introduced; routing remains App Router only.
- No CSS Module (`*.module.css`) is added.
- The `@/*` path alias is used for any cross-`src/` imports (no long relative paths leaving the widget folder).
- Deleting `src/app/widgets/pomodoro/` with one `rm -rf` does not break `npm run build` for any other widget folder; the home route may render a degraded state (no card / placeholder), but it must not crash.
- No `localStorage`, `sessionStorage`, cookie, or URL persistence is added by this spec; reload returns sliders and timer to their defaults.
- [DROPPED 2026-05-08 #3 — Decision 9 replaces the idle dashed pattern with a flat ring; Figma node `1:11` is no longer the binding visual contract for idle. The previous wording read: "The four-segment idle ring contract (Figma node `1:11`) is preserved exactly: idle still shows four 60°/30° segments at 12/3/6/9 o'clock with the same colors and stroke widths; only the running/paused/resting states swap to the single-arc form."]
- The ring track color is `#111827` (Decision 8) [Amended 2026-05-08 #3: rebound from "the track `<circle>`'s `stroke` attribute" to "the rendered ring track color" so the assertion works against either the historical SVG renderer or the post-#3 CSS renderer]; a regression that reverts the track to `#1F2937` (whether via an SVG `<circle stroke="#1F2937">` under the deprecated reading, or via a CSS `conic-gradient` / `background` / `border` color of `#1F2937` under the post-#3 reading) is flagged. Verified by reading the rendered track color from the ring container — for the CSS reading, this is the ring container's computed `background` / `background-image` / equivalent that paints the unfilled portion of the ring; for the deprecated SVG reading, it is the track `<circle>`'s `stroke` attribute.
- [Added 2026-05-08 #3] The ring container contains no `<svg>` or `<circle>` descendant. Verified by `getRingContainer(container).querySelector("svg, circle")` returning `null`. Reverting to an SVG-based ring is a regression unless this guardrail is itself amended in a future dated block.
- [Added 2026-05-08 #3] The ring foreground color matches the active phase per Decision 10: `#F87171` in `running` (work) and `paused-from-work`; `#34D399` in `resting` and `paused-from-rest`; `#3B82F6` in `idle` and `completed`. Verified by computed style on the ring container or by `className` regex against the ring element matching `/(F87171|34D399|3B82F6)/` plus a per-state assertion that the matching token corresponds to the expected phase.
- [Added 2026-05-08 #3] The card no longer contains an `<h2>` element with text "Work Time" or "Rest Time". Verified by `queryByRole("heading", { name: /^(work|rest) time$/i })` returning `null` in every state. Re-introducing a top-of-card "Work Time" / "Rest Time" `<h2>` is a regression unless this guardrail is itself amended in a future dated block.
- [Added 2026-05-08 #4, per Decision 12] Slider movement (Work or Rest) triggers the same end state as the Reset button: `state = idle`, `phase = "work"`, `secondsRemaining = workMinutes * 60`, ring `--progress = 0`, ring foreground = `#3B82F6`. Verified by a Vitest scenario that drives a running timer through a slider change and asserts the post-change state matches the post-Reset state (rendered DOM equivalence on the time display text, the start-button accessible name, the ring `--progress` value, and the ring foreground color). Reverting to a "slider changes apply at the next phase entry" or "slider changes do not modify the current `secondsRemaining`" behavior is a regression unless this guardrail is itself amended in a future dated block.
- [Added 2026-05-08 #5, per Decision 13] Pomodoro card root has `p-[24px]` (Decision 13). Verified by checking the card root's `className` matches `/p-\[24px\]/` AND does not match `/p-\[33px\]/` or `/pb-\[32px\]/`. Reverting the card padding to `p-[33px] pb-[32px]` (or any other padding utility that does not resolve to symmetric `24px` on all four sides) is a regression unless this guardrail is itself amended in a future dated block.

### Scenarios

```gherkin
Scenario: Idle render of the Pomodoro card
  Given the user navigates to "/widgets/pomodoro"
  When the page mounts
  Then a heading with accessible name matching /^work$/i is visible inside the ring container above the time display
  And a time display with text "25:00" is visible
  And a button with accessible name matching /start|play/i is visible
  And a button with accessible name matching /reset/i is visible
  And a button with accessible name "Settings" is visible
  And no region with accessible name "Timer settings" is in the document
  And no heading with accessible name matching /^(work|rest) time$/i is in the document

Scenario: Settings panel toggles open and closed
  Given the Pomodoro card is in idle state
  When the user clicks the button with accessible name "Settings"
  Then a region with accessible name "Timer settings" is in the document
  And the region contains an input of type "range" with accessible name matching /work length/i, min "5", max "60", step "1", value "25"
  And the region contains an input of type "range" with accessible name matching /rest length/i, min "1", max "30", step "1", value "5"
  When the user clicks the Settings button again
  Then no region with accessible name "Timer settings" is in the document

Scenario: Sliders default to 25 and 5 minutes after reload
  Given the user opens the settings panel and changes the Work length slider to 50
  When the user fully unmounts and re-mounts <PomodoroCard />
  And opens the settings panel again
  Then the Work length slider's value is "25"
  And the Rest length slider's value is "5"

Scenario: Changing Work length while idle updates the time display
  Given the Pomodoro card is in idle state showing "25:00"
  When the user opens the settings panel and changes the Work length slider to 30
  Then the time display shows "30:00"
  And a heading with accessible name matching /^work$/i is still visible inside the ring container

Scenario: Changing Rest length while idle does not change the time display (consistent with Decision 12, 2026-05-08 #4 — idle → idle is a no-op transition for the display because secondsRemaining is reassigned to workMinutes * 60, which equals the value already shown)
  Given the Pomodoro card is in idle state showing "25:00"
  When the user opens the settings panel and changes the Rest length slider to 10
  Then the time display still shows "25:00"
  And the card is still in idle state
  And a heading with accessible name matching /^work$/i is still visible inside the ring container

Scenario: Sliding Work length mid-running resets the clock to idle (Decision 12, 2026-05-08 #4 — replaces the prior "do not retroactively rescale" scenario, whose assertions are now inverted)
  Given the timer is running and the time display shows "24:50"
  When the user opens the settings panel and changes the Work length slider to 45
  Then the time display shows "45:00"
  And the card is in idle state (the start button's accessible name matches /start|play/i, not /pause/i)
  And the ring element's --progress custom property is 0 or absent
  And a heading with accessible name matching /^work$/i is visible inside the ring container
  And the settings panel remains open (a region with accessible name "Timer settings" is still in the document)

Scenario: Sliding Rest length mid-running resets the clock to idle (Decision 12, 2026-05-08 #4)
  Given the timer is running and the time display shows "24:50"
  When the user opens the settings panel and changes the Rest length slider to 15
  Then the time display shows "25:00" (workMinutes is unchanged at 25; reset reassigns secondsRemaining = workMinutes * 60)
  And the card is in idle state (the start button's accessible name matches /start|play/i, not /pause/i)
  And the ring element's --progress custom property is 0 or absent
  And a heading with accessible name matching /^work$/i is visible inside the ring container
  And the settings panel remains open

Scenario: Sliding either length while paused resets the clock to idle (Decision 12, 2026-05-08 #4)
  Given the timer is paused and the time display shows "20:00"
  When the user opens the settings panel and changes the Work length slider to 30
  Then the time display shows "30:00"
  And the card is in idle state (the start button's accessible name matches /start|play/i, not /pause/i)
  And the ring element's --progress custom property is 0 or absent
  And a heading with accessible name matching /^work$/i is visible inside the ring container
  Given the timer is paused and the time display shows "20:00"
  When the user opens the settings panel and changes the Rest length slider to 12
  Then the time display shows "25:00" (workMinutes is unchanged)
  And the card is in idle state
  And the ring element's --progress custom property is 0 or absent

Scenario: Sliding either length while resting resets the clock to idle (Decision 12, 2026-05-08 #4)
  Given the card is in resting state with the time display showing "04:30"
  When the user opens the settings panel and changes the Work length slider to 40
  Then the time display shows "40:00"
  And the card is in idle state (the start button's accessible name matches /start|play/i, not /pause/i)
  And the ring element's --progress custom property is 0 or absent
  And a heading with accessible name matching /^work$/i is visible inside the ring container (the phase label flips back to /^work$/i because phase = "work" after the reset)
  And the ring foreground color resolves to "#3B82F6" (idle color per Decision 10)
  Given the card is in resting state with the time display showing "04:30"
  When the user opens the settings panel and changes the Rest length slider to 8
  Then the time display shows "25:00" (workMinutes is unchanged)
  And the card is in idle state
  And a heading with accessible name matching /^work$/i is visible inside the ring container

Scenario: Start transitions idle to running and decrements once per second
  Given the Pomodoro card is in idle state showing "25:00"
  When the user clicks the start button
  And the test advances timers by 1000 ms
  Then the time display shows "24:59"
  And the start button's accessible name matches /pause/i

Scenario: Pause freezes the displayed time and the ring progress
  Given the timer is running and the time display shows "24:55"
  When the user clicks the pause button
  And the test advances timers by 5000 ms
  Then the time display still shows "24:55"
  And the ring element's --progress custom property is unchanged from the value it held when "24:55" was displayed
  And the pause button's accessible name matches /start|play|resume/i

Scenario: Reset returns to the initial work time
  Given the timer is running and the time display shows any value other than "25:00"
  When the user clicks the reset button
  Then the time display shows "25:00"
  And the start button's accessible name matches /start|play/i
  And the ring element's --progress custom property is 0 or absent
  And the ring foreground color resolves to "#3B82F6" (idle color per Decision 10)
  And a heading with accessible name matching /^work$/i is visible inside the ring container

Scenario: Reset while paused returns to idle
  Given the timer is paused and the time display shows "20:00"
  When the user clicks the reset button
  Then the time display shows "25:00"
  And no interval continues to fire after the test advances timers by 5000 ms (time stays at "25:00")

Scenario: Work interval reaching zero advances to resting (strict alternation)
  Given the timer is running with workMinutes = 25 and restMinutes = 5
  When the test advances timers by 1500000 ms (1500 seconds elapsed)
  Then a heading with accessible name matching /^rest$/i is visible inside the ring container
  And the time display shows "05:00"
  And the play/pause button's accessible name matches /pause/i (the rest interval auto-runs)
  And the ring element's --progress custom property is approximately 0 (tolerance ±0.005)
  And the ring foreground color resolves to "#34D399"

Scenario: Rest interval reaching zero advances to a fresh work interval
  Given the card is in resting state with restMinutes = 5 and workMinutes = 25
  When the test advances timers by 300000 ms (300 seconds elapsed)
  Then a heading with accessible name matching /^work$/i is visible inside the ring container
  And the time display shows "25:00"
  And the ring element's --progress custom property is approximately 0 (tolerance ±0.005)
  And the ring foreground color resolves to "#F87171"

Scenario: User opens settings panel during resting
  Given the card is in resting state with the time display showing "04:30"
  When the user clicks the Settings button
  Then a region with accessible name "Timer settings" is in the document
  And the time display still shows "04:30" (or one tick later — opening the panel does not stop the timer)
  And a heading with accessible name matching /^rest$/i is still visible inside the ring container
  And no slider is moved during this scenario; opening the panel itself does not reset the clock (Decision 5 still pins panel toggle as inert; only moving a slider triggers the Decision-12 reset, 2026-05-08 #4)

Scenario: Slider boundaries
  Given the user opens the settings panel
  Then the Work length slider has min "5", max "60", step "1"
  And the Rest length slider has min "1", max "30", step "1"
  When the user attempts to set the Work length slider below 5 or above 60
  Then the rendered value is clamped to the [5, 60] range (the slider does not accept out-of-range values)

Scenario: format-time helper zero-pads minutes and seconds
  Given the helper "formatMmSs" exported from "src/app/widgets/pomodoro/format-time.ts"
  When called with 0
  Then it returns "00:00"
  When called with 9
  Then it returns "00:09"
  When called with 65
  Then it returns "01:05"
  When called with 1500
  Then it returns "25:00"
  When called with 3600
  Then it returns "60:00"

Scenario: Widget route is reachable without the home route
  Given the home route file "src/app/page.tsx" is deleted (hypothetical)
  When the user navigates directly to "/widgets/pomodoro"
  Then the Pomodoro card renders normally with "25:00"

Scenario: Widget folder deletion does not break the home route build
  Given the directory "src/app/widgets/pomodoro/" has been removed by "rm -rf"
  When "npm run build" is run
  Then the build exits with status 0 (the home route may render a placeholder where the card link was, but it does not throw)

Scenario: Home route shows the Widget Showcase header and one card
  Given the user navigates to "/"
  When the page renders
  Then a heading with accessible name "Widget Showcase" is visible
  And a subtitle paragraph is visible beneath it
  And exactly one link with href="/widgets/pomodoro" is rendered, with accessible name containing "Pomodoro" or "Work Time"
  And no element references "/next.svg", "/vercel.svg", "Deploy Now", or "Documentation"

Scenario: Widget remains isolated
  Given the repository on this branch with the feature applied
  When a reviewer runs "git grep -n 'widgets/pomodoro' src/app/widgets"
  Then no file outside "src/app/widgets/pomodoro/" matches
  When a reviewer runs "git grep -nE \"from ['\\\"]\\.\\./\" src/app/widgets/pomodoro"
  Then no matches are produced (the widget does not reach upward into app/)

Scenario: No persistence is added
  Given the repository on this branch with the feature applied
  When a reviewer runs "git grep -nE 'localStorage|sessionStorage|document\\.cookie' src/app/widgets/pomodoro"
  Then no matches are produced

Scenario: Quality gates pass
  Given both PBIs of this spec have landed
  When CI runs "npm run lint" then "npm run test:run" then "npm run build"
  Then all three commands exit with status 0

Scenario: Ring at idle renders a flat foreground (no segmentation)
  Given the user navigates to "/widgets/pomodoro"
  When the page mounts and the timer is in idle state showing "25:00"
  Then the ring container's element does NOT contain any <svg> or <circle> descendant
  And the ring foreground color resolves to "#3B82F6"
  And the ring is rendered as a flat foreground (no four-segment pattern, no segmentation)
  And the ring element's --progress custom property is 0 or absent

Scenario: Ring switches to active drain on start (CSS --progress encoding)
  Given the Pomodoro card is in idle state showing "25:00"
  When the user clicks the start button
  Then the ring element exposes a --progress custom property
  And --progress is approximately 0 (within ±0.005)
  And the ring foreground color resolves to "#F87171"
  And the visible arc covers the full ring

Scenario: Ring drains clockwise as time elapses (CSS --progress encoding)
  Given the timer is running and started from "25:00" (workMinutes = 25)
  When the test advances timers by 750000 ms (750 seconds elapsed; "12:30" displayed)
  Then the ring element's --progress is approximately 0.5 (tolerance ±0.005)
  When the test advances timers until the time display shows "00:00" (the moment immediately before the resting transition)
  Then the ring element's --progress is approximately 1 (tolerance ±0.005) — the visible arc has zero length
  And the visible arc has retracted clockwise from the 12 o'clock anchor

Scenario: Ring freezes its progress when paused (CSS --progress encoding)
  Given the timer is running and the time display shows "20:00" (1200 seconds remaining out of 1500)
  When the user clicks the pause button
  And the test advances timers by 5000 ms
  Then the ring element's --progress is unchanged from the value it held when "20:00" was displayed (it does not advance while paused)
  And the ring container still contains no <svg> or <circle> descendant
  And the ring foreground color resolves to "#F87171" (paused-from-work; Decision 10)

Scenario: Ring during resting uses restMinutes as denominator
  Given the card is in resting state with restMinutes = 5 and the time display shows "02:30"
  Then the ring element's --progress is approximately 0.5 (tolerance ±0.005)
  And the ring foreground color resolves to "#34D399"

Scenario: Ring returns to flat idle ring on reset
  Given the timer is running, paused, or resting with the ring in active-drain mode (--progress > 0)
  When the user clicks the reset button
  Then the ring element's --progress is 0 or absent
  And the ring foreground color resolves to "#3B82F6"
  And the ring is rendered as a flat foreground (no segmentation pattern)
  And the time display shows the value of (workMinutes * 60) formatted as MM:SS (e.g. "25:00" with default settings, "30:00" if Work length was set to 30 before reset)

Scenario: Ring foreground color matches the active phase (Decision 10)
  Given the Pomodoro card is in idle state
  Then the ring foreground color resolves to "#3B82F6"
  When the user clicks start (entering running, work phase)
  Then the ring foreground color resolves to "#F87171"
  When the user clicks pause (entering paused-from-work)
  Then the ring foreground color resolves to "#F87171"
  When the user clicks start, then advances time so the work interval reaches zero (entering resting)
  Then the ring foreground color resolves to "#34D399"
  When the user clicks pause during resting (entering paused-from-rest)
  Then the ring foreground color resolves to "#34D399"

Scenario: Phase label appears above the time display (Decision 11)
  Given the Pomodoro card is in idle state
  Then a heading with accessible name matching /^work$/i is rendered inside the ring container above the MM:SS span
  When the user clicks start (entering running, work phase)
  Then a heading with accessible name matching /^work$/i is still rendered inside the ring container above the MM:SS span
  When the user clicks pause (entering paused-from-work)
  Then the heading still matches /^work$/i
  When the work interval reaches zero (entering resting)
  Then a heading with accessible name matching /^rest$/i is rendered inside the ring container above the MM:SS span
  When the user clicks pause during resting (entering paused-from-rest)
  Then the heading still matches /^rest$/i

Scenario: Card no longer carries the "Work Time" or "Rest Time" top-of-card heading
  Given the Pomodoro card is in any state (idle, running, paused, resting, completed)
  Then queryByRole("heading", { name: /^(work|rest) time$/i }) returns null
  And no <h2> element with text "Work Time" exists in the card
  And no <h2> element with text "Rest Time" exists in the card

Scenario: Ring is rendered without SVG (Decision 9)
  Given the Pomodoro card is in any state (idle, running, paused, resting, completed)
  Then within the ring container, container.querySelectorAll("svg, circle") returns length 0
  And the ring container is a single CSS-styled element (a <div> or equivalent block-level element)

Scenario: Settings button has visible hover and focus states (polish)
  Given the Pomodoro card is rendered in any state
  When a reviewer inspects the rendered className of the Settings button
  Then the className matches /hover:(bg-|opacity-)/
  And the className matches /focus-visible:/

Scenario: Ring transitions smoothly when state changes (polish)
  Given the Pomodoro card is rendered in any state
  When a reviewer inspects the ring container element's className or inline style
  Then the className matches /transition-/ OR the style attribute contains a non-empty "transition" value
  And that transition value contains one of the substrings: "progress", "background", "mask", or "stroke-dashoffset"

Scenario: Sliders use the existing accent color (polish)
  Given the settings panel is open
  When a reviewer inspects the className of each <input type="range">
  Then each className contains the substring "accent-[#3B82F6]"

Scenario: Ring track is significantly dimmer than the remaining-time arc (Decision 8)
  Given the user navigates to "/widgets/pomodoro"
  When the page mounts in any state (idle, running, paused, resting, completed)
  Then the rendered ring track color resolves to "#111827"
  And the rendered ring foreground color resolves to the Decision-10 color for the active phase ("#3B82F6" in idle/completed, "#F87171" in running (work)/paused-from-work, "#34D399" in resting/paused-from-rest)
  And no element inside the ring container references "#1F2937" as a paint color
```
