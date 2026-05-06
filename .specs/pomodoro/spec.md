# Feature: Pomodoro Widget + Widget Showcase Home Route

## Blueprint

### Context

The learner asked to "implement basic app grid and pomodoro timer" with Figma node `1:3` as the visual contract (file `w28z2LVnu8xwN4B51vgORg`, "Untitled", retrieved 2026-05-06 via Figma desktop MCP — no Figma variables defined, all values are literals). The platform is a hacking ground for self-contained widgets (`AGENTS.md` → Architecture); a Pomodoro timer is the first widget and the home route — currently a Next.js starter splash at `src/app/page.tsx` — is restructured into the "Widget Showcase" header + a single card linking to the widget. There is no real "grid" yet because the design only shows one card; the home-route restructure stops at "header + one card" and does not invent a multi-column layout the design does not evidence.

### Decisions

These three decisions are pinned here so they are not reopened during build:

1. **One spec, two PBIs.** The widget and the home-route restructure are bundled in this single spec because the design pairs them on one frame (Figma node `1:3`), the home route has nothing meaningful to display until the widget exists, and at one widget there is no independent "grid" feature to spec. They land as two PBIs: `pbi/01-pomodoro-widget.md` (the widget at `src/app/widgets/pomodoro/`) and `pbi/02-home-showcase.md` (the home-route restructure at `src/app/page.tsx`). PBI 02 depends on PBI 01 only for the link target; the widget route works standalone.
2. **`layout.tsx` owns shared page chrome.** [DEPRECATED 2026-05-06 — superseded by .specs/app-shell/spec.md Decision 1] The original wording said "fonts only" — that has been superseded. As of `.specs/app-shell/spec.md`, `src/app/layout.tsx` owns the shared page chrome: page background (`#030712`), container max-width (`1280px`), horizontal gutters (`58.5px`), top padding (`32px`), and the `next/font/google` variables (Geist, Geist Mono, Space Grotesk, Inter). The pomodoro widget no longer applies its own page-chrome wrapper; `src/app/widgets/pomodoro/page.tsx` simply mounts `<PomodoroCard />` and inherits the shell.
3. **Settings gear: rendered as decorative, no-op.** The Figma shows a settings gear in the top-right of the card but no settings panel frame and no behavior evidence. It is rendered as a non-interactive visual element with `aria-hidden="true"` and no click handler. It is **not** a `<button>`, has no focus ring, and clicking it does nothing observable. This preserves visual fidelity to node `1:3` without inventing unsourced behavior. Re-introducing a real settings panel is a future spec triggered by a follow-up Figma frame.

### Architecture

- **New files (created by this spec):**
  - `src/app/widgets/pomodoro/page.tsx` — server component route for `/widgets/pomodoro`, renders the page chrome and the client-side timer card.
  - `src/app/widgets/pomodoro/PomodoroCard.tsx` — `"use client"` component owning timer state (`idle | running | paused | completed`), `secondsRemaining`, `setInterval` lifecycle, and the visual card.
  - `src/app/widgets/pomodoro/PomodoroCard.test.tsx` — Vitest + Testing Library coverage of timer transitions and a11y queries.
  - `src/app/widgets/pomodoro/format-time.ts` — pure helper `formatMmSs(seconds: number): string` (zero-padded `MM:SS`).
  - `src/app/widgets/pomodoro/format-time.test.ts` — unit coverage of the formatter.
  - `.specs/pomodoro/pbi/01-pomodoro-widget.md`, `.specs/pomodoro/pbi/02-home-showcase.md` — PBI files (authored by `/plan`, not by this spec).
- **Modified files:**
  - `src/app/layout.tsx` — add `Space_Grotesk` (weight `700`) and `Inter` (weight `400`) imports from `next/font/google`, expose them as `--font-space-grotesk` and `--font-inter` CSS variables on the `<html>` element. Keep the existing `Geist` and `Geist_Mono` variables untouched. (Per `.specs/app-shell/spec.md`, `layout.tsx` also owns the shared page chrome — background, max-width, gutters, top padding — and renders the single `<main>` wrapper. `src/app/widgets/pomodoro/page.tsx` no longer carries those chrome utilities.)
  - `src/app/page.tsx` — replaced wholesale (PBI 02) with the "Widget Showcase" header + one card linking to `/widgets/pomodoro`. Stays a server component.
- **Visual contract — Figma node `1:3` (literals from intake P4, no Figma variables):**
  - Page background `#030712`; container max width `1280px`, `32px` top padding, `~58.5px` horizontal padding from the app frame edges. (Owned by `src/app/layout.tsx` per `.specs/app-shell/spec.md` Decision 1; the pomodoro route inherits these.)
  - Header block: gradient text "Widget Showcase" in Space Grotesk Bold `36px / 40px`, gradient `linear-gradient(90deg, #51A2FF 0%, #AD46FF 100%)` clipped to text. Subtitle in Inter Regular `16px / 24px`, color `#99A1AF`, letter-spacing `-0.3125px`. `8px` gap between heading and subtitle.
  - Home-page rhythm: `gap-[48px]` between the "Widget Showcase" header block and the card (Figma node `1:4`).
  - Card: width `~410.66px`, height `~478px`, background `#101828`, `1px` border `#1E2939`, radius `10px`. Card frame uses `p-[33px] pb-[32px]`; inner column uses `gap-[32px]` (see `.specs/app-shell/spec.md` Decision 6).
  - Card title "Work Time": Space Grotesk Bold `24px / 32px`, color `#FFFFFF`.
  - Time display: Space Grotesk Bold `60px / 60px`, color `#FFFFFF`, centered, initial value `25:00` (1500 seconds).
  - Circular progress ring container `~344.66px × 256px`; the ring visualizes elapsed-vs-remaining time of the current session.
  - Button row centered, two `56×56` buttons, `16px` gap; play button background `#155DFC`; reset button background `#1E2939`; both `10px` radius.
  - Settings gear `36×36` in the top-right of the card (decorative, see Decision 3).
- **State machine for the timer card:**
  - States: `idle` (initial; `secondsRemaining = 1500`), `running`, `paused`, `completed`.
  - `idle → running` on play click; `running → paused` on pause click; `paused → running` on play click; `running → completed` when `secondsRemaining` reaches `0`; `* → idle` on reset click.
  - The play button label/icon swap reflects `running` (shows pause icon) vs everything else (shows play icon). Reset is always available.
- **Constraints:**
  - The widget folder `src/app/widgets/pomodoro/` is deletable in a single `rm -rf` and that command leaves the home route renderable (the home page renders a placeholder/empty state when the link target is missing — see Scenario "Widget folder deletion does not break the home route").
  - No new files are added under `src/lib/`, `src/components/`, or any shared directory; everything Pomodoro-specific lives in the widget folder.
  - No imports cross from `src/app/widgets/pomodoro/` into other widget folders, and no other code imports from `src/app/widgets/pomodoro/`.
  - The widget route `/widgets/pomodoro` is reachable directly without depending on the home route.
  - The home route (`src/app/page.tsx`) and the widget route (`src/app/widgets/pomodoro/page.tsx`) are both server components; only `PomodoroCard.tsx` carries `"use client"`.
  - Color, spacing, and typography literals from the Figma contract are inlined as Tailwind utility values (e.g. `bg-[#101828]`, `text-[60px]`) — no new shared theme tokens are introduced.
  - React Compiler is enabled — no hand-written `useMemo`/`useCallback`.
  - Quality gate: `npm run lint`, `npm run test:run`, `npm run build` exit `0` after both PBIs land.

## Contract

### Definition of Done

- [ ] `src/app/widgets/pomodoro/page.tsx` exists and is a server component (no `"use client"` directive on the file).
- [ ] `src/app/widgets/pomodoro/PomodoroCard.tsx` exists and starts with `"use client"`.
- [ ] `src/app/widgets/pomodoro/format-time.ts` exports a pure function `formatMmSs(seconds: number): string` returning a zero-padded `MM:SS` string for non-negative integer inputs.
- [ ] Visiting `/widgets/pomodoro` renders an element with accessible name "Work Time" (queryable via `getByRole("heading", { name: /work time/i })`).
- [ ] Visiting `/widgets/pomodoro` renders an element whose text content is exactly `25:00` on initial mount.
- [ ] Visiting `/widgets/pomodoro` renders a button with accessible name matching `/start|play/i` and a button with accessible name matching `/reset/i`.
- [ ] The settings gear element on the card has `aria-hidden="true"` and is not a `<button>` (verified by `queryByRole("button", { name: /settings/i })` returning `null`).
- [ ] `src/app/layout.tsx` imports `Space_Grotesk` and `Inter` from `next/font/google` and applies their CSS variables (`--font-space-grotesk`, `--font-inter`) on the `<html>` element alongside the existing Geist variables.
- [ ] `src/app/page.tsx` no longer references `/next.svg`, `/vercel.svg`, "Deploy Now", or "Documentation" (verified by `git grep -n "vercel.svg\|next.svg\|Deploy Now\|Documentation" src/app/page.tsx` returning no matches).
- [ ] `src/app/page.tsx` renders a heading with accessible name "Widget Showcase".
- [ ] `src/app/page.tsx` renders a link with `href="/widgets/pomodoro"` whose accessible name contains "Pomodoro" or "Work Time".
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

### Scenarios

```gherkin
Scenario: Idle render of the Pomodoro card
  Given the user navigates to "/widgets/pomodoro"
  When the page mounts
  Then a heading with text "Work Time" is visible
  And a time display with text "25:00" is visible
  And a button with accessible name matching /start|play/i is visible
  And a button with accessible name matching /reset/i is visible
  And the settings gear element on the card has attribute aria-hidden="true"
  And no element with role="button" has accessible name matching /settings/i

Scenario: Start transitions idle to running and decrements once per second
  Given the Pomodoro card is in idle state showing "25:00"
  When the user clicks the start button
  And the test advances timers by 1000 ms
  Then the time display shows "24:59"
  And the start button's accessible name matches /pause/i

Scenario: Pause freezes the displayed time
  Given the timer is running and the time display shows "24:55"
  When the user clicks the pause button
  And the test advances timers by 5000 ms
  Then the time display still shows "24:55"
  And the pause button's accessible name matches /start|play|resume/i

Scenario: Reset returns to the initial work time
  Given the timer is running and the time display shows any value other than "25:00"
  When the user clicks the reset button
  Then the time display shows "25:00"
  And the start button's accessible name matches /start|play/i

Scenario: Reset while paused returns to idle
  Given the timer is paused and the time display shows "20:00"
  When the user clicks the reset button
  Then the time display shows "25:00"
  And no interval continues to fire after the test advances timers by 5000 ms (time stays at "25:00")

Scenario: Timer reaches zero and stops
  Given the timer is running and the time display shows "00:01"
  When the test advances timers by 1000 ms
  Then the time display shows "00:00"
  And no further interval tick changes the displayed value when the test advances timers by another 5000 ms
  And the start button is either disabled or its accessible name matches /start|play/i (not /pause/i)

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

Scenario: Settings gear is decorative
  Given the Pomodoro card is rendered in any state
  When the user clicks the settings gear element
  Then no observable state change occurs (time, button labels, and DOM structure are unchanged)
  And no console error or warning is emitted

Scenario: Widget remains isolated
  Given the repository on this branch with the feature applied
  When a reviewer runs "git grep -n 'widgets/pomodoro' src/app/widgets"
  Then no file outside "src/app/widgets/pomodoro/" matches
  When a reviewer runs "git grep -nE \"from ['\\\"]\\.\\./\" src/app/widgets/pomodoro"
  Then no matches are produced (the widget does not reach upward into app/)

Scenario: Quality gates pass
  Given both PBIs of this spec have landed
  When CI runs "npm run lint" then "npm run test:run" then "npm run build"
  Then all three commands exit with status 0
```
