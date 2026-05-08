# Feature: App-shell chrome in `layout.tsx`

## Blueprint

### Context

Two routes today (`src/app/page.tsx` and `src/app/widgets/pomodoro/page.tsx`) repeat the same dark page chrome: background `#030712`, container max-width `1280px`, horizontal gutters `58.5px`, and `32px` top padding. These are the literals from Figma node `1:2` ("Dark Grid Layout Design", file `w28z2LVnu8xwN4B51vgORg`), captured in `.specs/_intake/pomodoro-and-app-grid.md` Pattern P4 and re-confirmed in `.specs/_intake/app-shell-layout.md`. Meanwhile `src/app/globals.css` sets a competing `body { background: var(--background) }` that today is overridden by the per-route Tailwind utilities. As soon as a second widget exists, every learner pays the cost of remembering to copy that wrapper, and any divergence becomes silent visual drift.

This spec lifts the four duplicated literals into `src/app/layout.tsx` so every route inherits the shell, single-sources the page background by removing the contradictory rule from `src/app/globals.css`, and bundles the two visual-rhythm bugs that node `1:2` exposes inside the home route and the Pomodoro card. Bundling these together (rather than landing the lift first and a pomodoro amendment second) is the user-pinned choice: all four concerns share the same code surface, and splitting them would force two near-adjacent edits to `src/app/widgets/pomodoro/page.tsx` and `src/app/widgets/pomodoro/PomodoroCard.tsx`. The `.specs/pomodoro/spec.md` Decision 2 ("`layout.tsx` is fonts only") is contradicted by this scope and is amended in the same commit per the same-commit rule.

**Amendment 2026-05-08:** the learner asked for `48px` padding on the base layout (replacing the `58.5px` horizontal gutters and `32px` top padding pinned in Decision 1). The new contract is `padding: 48px` on all four sides of the `<main>` element (Tailwind utility `p-[48px]`). The container max-width `1280px`, the page background `#030712`, and the single-`<main>` invariant are unchanged. Bottom padding — previously unspecified and effectively `0` after the `globals.css` `@layer base` fix — is now explicitly `48px`. Every clause below that pins `px-[58.5px]` or `pt-[32px]` on `<main>` is marked `[DEPRECATED 2026-05-08 — superseded by 48px-all-sides per learner request]`; the new contract supersedes them.

### Decisions

These six decisions are pinned here so they are not reopened during build:

1. **What `layout.tsx` owns.** `src/app/layout.tsx` owns four pieces of page chrome: page background (`#030712`), container max-width (`1280px`), ~~horizontal gutters (`58.5px`), and top padding (`32px`)~~ `[DEPRECATED 2026-05-08 — superseded by 48px-all-sides per learner request]` **`<main>` padding `48px` on all four sides (Tailwind utility `p-[48px]`)**, plus the existing `next/font/google` variables. Anything else — route-specific headers (e.g. the "Widget Showcase" gradient header), per-widget vertical rhythm, card chrome, footers, navigation — stays out of `layout.tsx`. The "Widget Showcase" header is route-specific (only `/` shows it) and remains in `src/app/page.tsx`.
2. **Background single-sourcing.** The Tailwind class `bg-[#030712]` is applied on `<body>` in `src/app/layout.tsx`. The `body { background: var(--background) }` rule in `src/app/globals.css` is removed. The `--background` and `--foreground` CSS variables in `globals.css` are also removed because no other code in `src/` consumes them after this change (`grep -rn "var(--background)\|var(--foreground)" src/` returns no matches once the body rule is gone). The `@media (prefers-color-scheme: dark) { html { color-scheme: dark } }` block stays — it is independent of the variables.
3. **Body styles in `globals.css`.** The current `body { display:flex; flex-direction:column; min-height:100% }` rules from `globals.css` are replaced by Tailwind utilities on `<body>` in `src/app/layout.tsx` (`flex min-h-screen flex-col`). The `*` reset, the `a { color: inherit; text-decoration: none }` rule, the `html { height: 100% }` rule, and `html, body { max-width: 100vw; overflow-x: hidden }` stay in `globals.css` — they are not part of the chrome lift. The `body { font-family: Arial, ... }` rule is removed because `next/font/google` already supplies the typefaces and no route relies on the Arial fallback.
4. **Shell shape.** Utilities go directly on `<body>` (`bg-[#030712] flex min-h-screen flex-col`); a single `<main>` wrapper inside `<body>` carries ~~`mx-auto w-full max-w-[1280px] px-[58.5px] pt-[32px]`~~ `[DEPRECATED 2026-05-08 — superseded by 48px-all-sides per learner request]` **`mx-auto w-full max-w-[1280px] p-[48px]`** and renders `{children}`. No `<AppShell>` component is introduced — flat beats clever per `AGENTS.md`. Per-route `<main>` elements are removed (the layout now owns the only `<main>`); per-route content becomes whatever the route renders inside that `<main>`.
5. **Escape hatch for widgets that want different chrome.** A widget that needs full-bleed, non-dark chrome, or a different max-width opts out at its own `page.tsx` by rendering an outer wrapper with explicit overrides (e.g. ~~`bg-white -mx-[58.5px] -mt-[32px] min-h-screen`~~ `[DEPRECATED 2026-05-08 — superseded by 48px-all-sides per learner request]` **`bg-white -m-[48px] min-h-screen`** to cancel the layout's `p-[48px]`). The escape hatch is documented in the `AGENTS.md` Architecture section amendment that ships in the same commit as the code change. No machinery (slot props, layout segments, route groups) is added to `layout.tsx` to support opt-out — the escape hatch is purely "render your own wrapper that overrides what the shell set."
6. **Card bottom-padding (Open Question from intake P7).** The Pomodoro card root flex container uses `gap-[32px]` between (1) title/gear row, (2) ring container, (3) button row, and the existing `pb-[32px]` on the card frame is **kept**. Rationale: the Figma `pb-[1px]` literal would only be correct if the parent flex `gap` contributed trailing space below the last child (the button row), but in CSS flex `gap` only inserts space _between_ siblings, not after the last one. To match the design's `478px` overall height with a `gap-[32px]` rhythm, the card needs `pt-[33px]` and `pb-[32px]` (or `p-[33px] pb-[32px]` as today). `pb-[1px]` is therefore treated as a Figma-side artifact, not a faithful target. This decision pins the card frame at `p-[33px] pb-[32px]` and the inner column at `gap-[32px]`.

### Architecture

- **Modified files (all changes ship in one commit per the same-commit rule):**
  - `src/app/layout.tsx` — apply `bg-[#030712] flex min-h-screen flex-col` Tailwind utilities to `<body>`; insert a ~~`<main className="mx-auto w-full max-w-[1280px] px-[58.5px] pt-[32px]">`~~ `[DEPRECATED 2026-05-08 — superseded by 48px-all-sides per learner request]` **`<main className="mx-auto w-full max-w-[1280px] p-[48px]">`** wrapper that renders `{children}`. Existing `next/font/google` imports and the `<html>` font-variable className stay unchanged.
  - `src/app/page.tsx` — remove the outer `<div className="min-h-screen bg-[#030712]">` and the inner `<main className="mx-auto w-full max-w-[1280px] px-[58.5px] pt-8">`; the file's top-level rendered element becomes a fragment (or the `<header>` directly) plus the card link. Change the gap between header and card from `mt-8` to `mt-[48px]` (or equivalently a parent `flex flex-col gap-[48px]`).
  - `src/app/widgets/pomodoro/page.tsx` — remove the outer `<main className="min-h-screen bg-[#030712] px-[58.5px] pt-[32px]">` and inner `<div className="mx-auto max-w-[1280px]">`; the file becomes essentially `export default function PomodoroWidgetPage() { return <PomodoroCard />; }`.
  - `src/app/widgets/pomodoro/PomodoroCard.tsx` — change the card root `<article>` from a column without explicit gap (currently relying on `mt-[24px]` on children) to `flex flex-col gap-[32px]`; remove the `mt-[24px]` from the ring container `<div>` (line 85) and from the button row `<div>` (line 119). Keep the existing `p-[33px] pb-[32px]` on the card frame per Decision 6.
  - `src/app/globals.css` — remove the `body { display:flex; flex-direction:column; min-height:100%; color: var(--foreground); background: var(--background); font-family: Arial, ... }` block; remove the `:root { --background; --foreground }` block and the `@media (prefers-color-scheme: dark) { :root { ... } }` variable override (Decision 2); keep `@import "tailwindcss"`, `html { height: 100% }`, `html, body { max-width: 100vw; overflow-x: hidden }`, `* { box-sizing: border-box; padding: 0; margin: 0 }`, `a { color: inherit; text-decoration: none }`, and `@media (prefers-color-scheme: dark) { html { color-scheme: dark } }`.
  - `.specs/pomodoro/spec.md` — amend Decision 2: replace its current text with a `[DEPRECATED 2026-05-06 — superseded by .specs/app-shell/spec.md Decision 1]` marker followed by the new statement that `layout.tsx` owns shared page chrome (background, max-width, gutters, top padding, fonts) and the pomodoro widget no longer applies its own page-chrome wrapper. Update the Architecture > Modified files bullet to reflect that `src/app/widgets/pomodoro/page.tsx` no longer carries the chrome utilities. Update the Architecture > Visual contract bullets so the home-page header→card gap is `48px` and the in-card vertical rhythm is `gap-[32px]`. Add a sentence: "Card frame uses `p-[33px] pb-[32px]`; inner column uses `gap-[32px]` (see `.specs/app-shell/spec.md` Decision 6)."
  - `AGENTS.md` — Architecture section: add one sentence under the existing bullets pinning what `layout.tsx` is allowed to own, plus a sentence documenting the escape hatch. ~~Concretely: "**`layout.tsx` owns shared page chrome only** — page background, container max-width (`1280px`), horizontal gutters (`58.5px`), top padding, and `next/font/google` variables. Widgets that need different chrome (full-bleed, non-dark background, different width) opt out at their own `page.tsx` by rendering an outer wrapper that overrides those utilities; this stays simple and only widgets that need to override pay the cost."~~ `[DEPRECATED 2026-05-08 — superseded by 48px-all-sides per learner request]` Concretely: "**`layout.tsx` owns shared page chrome only** — page background, container max-width (`1280px`), `<main>` padding `48px` on all four sides, and `next/font/google` variables. Widgets that need different chrome (full-bleed, non-dark background, different width) opt out at their own `page.tsx` by rendering an outer wrapper that overrides those utilities (e.g. `-m-[48px] bg-white min-h-screen`); this stays simple and only widgets that need to override pay the cost."

- **Files that are _not_ modified by this spec:**
  - `src/app/widgets/pomodoro/PomodoroCard.test.tsx`, `src/app/widgets/pomodoro/format-time.ts`, `src/app/widgets/pomodoro/format-time.test.ts` — timer behaviour is unchanged.
  - `src/smoke.test.tsx` — must continue to pass.
  - `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `prettier.config.mjs`, `vitest.config.mts`, `vitest.setup.ts`, `postcss.config.mjs` — toolchain unchanged.
  - No new files are introduced under `src/lib/` or `src/components/`.

- **Visual literals (from `.specs/_intake/pomodoro-and-app-grid.md` P4 and `.specs/_intake/app-shell-layout.md` P7, with the 2026-05-08 amendment applied):**
  - Page background `#030712`.
  - Container max-width `1280px`.
  - ~~Horizontal gutters `58.5px`.~~ `[DEPRECATED 2026-05-08 — superseded by 48px-all-sides per learner request]`
  - ~~Top padding `32px`.~~ `[DEPRECATED 2026-05-08 — superseded by 48px-all-sides per learner request]`
  - **`<main>` padding `48px` on all four sides** (`p-[48px]`) — added 2026-05-08, supersedes the prior `58.5px` horizontal gutters and `32px` top padding; the previously unspecified bottom padding is now also `48px`.
  - Header → card gap `48px` (Figma node `1:4`).
  - Pomodoro card inner column gap `32px` (Figma node `1:11`).
  - Pomodoro card frame padding `p-[33px] pb-[32px]` (per Decision 6).

- **Constraints:**
  - The widget-deletion guarantee from `.specs/pomodoro/spec.md` is preserved: `rm -rf src/app/widgets/pomodoro/` leaves the home route renderable. Because the home route no longer relies on the pomodoro widget folder for its chrome (the chrome is in `layout.tsx`), this guarantee is strictly easier to maintain after this change.
  - `src/app/page.tsx` and `src/app/widgets/pomodoro/page.tsx` remain server components (no `"use client"` directive on those files).
  - Only `<body>` carries the dark chrome; the only `<main>` element on every route is the one in `layout.tsx` (verified by grep — see DoD).
  - No new imports cross from `src/app/widgets/pomodoro/` into other widget folders, and no other code imports from it.
  - React Compiler stays enabled — no hand-written `useMemo`/`useCallback`.
  - Tailwind utilities only — no new CSS Modules, no `<style>` tags, no inline `style={{ background: ... }}`.
  - Quality gate: `npm run lint`, `npm run test:run`, `npm run build` exit `0` after this lands.

## Contract

### Definition of Done

- [ ] `git grep -nE "bg-\[#030712\]" src/app/page.tsx` returns no matches.
- [ ] `git grep -nE "bg-\[#030712\]" src/app/widgets/pomodoro/page.tsx` returns no matches.
- [ ] `git grep -nE "bg-\[#030712\]" src/app/layout.tsx` returns at least one match (the chrome lives here now).
- [ ] `git grep -nE "max-w-\[1280px\]" src/app/page.tsx` returns no matches.
- [ ] `git grep -nE "max-w-\[1280px\]" src/app/widgets/pomodoro/page.tsx` returns no matches.
- [ ] `git grep -nE "max-w-\[1280px\]" src/app/layout.tsx` returns exactly one match.
- [ ] `git grep -nE "px-\[58\\.5px\]" src/app/page.tsx` returns no matches.
- [ ] `git grep -nE "px-\[58\\.5px\]" src/app/widgets/pomodoro/page.tsx` returns no matches.
- [ ] ~~`git grep -nE "px-\[58\\.5px\]" src/app/layout.tsx` returns exactly one match.~~ `[DEPRECATED 2026-05-08 — superseded by 48px-all-sides per learner request]`
- [ ] `git grep -nE "px-\[58\\.5px\]" src/app/layout.tsx` returns no matches (added 2026-05-08; the old gutter literal is removed).
- [ ] `git grep -nE "p-\[48px\]" src/app/layout.tsx` returns at least one match (added 2026-05-08; `<main>` carries `p-[48px]` for `48px` padding on all four sides).
- [ ] `git grep -nE "pt-\[32px\]" src/app/layout.tsx` returns no matches (added 2026-05-08; the old top-padding literal is removed).
- [ ] `git grep -nE "p-\[48px\]" src/app/page.tsx` returns no matches (added 2026-05-08; chrome stays in the layout).
- [ ] `git grep -nE "p-\[48px\]" src/app/widgets/pomodoro/page.tsx` returns no matches (added 2026-05-08; chrome stays in the layout).
- [ ] `git grep -nE "background:\s*var\(--background\)" src/app/globals.css` returns no matches.
- [ ] `git grep -nE "--background|--foreground" src/app/globals.css` returns no matches (Decision 2).
- [ ] `git grep -nE "--background|--foreground" src` returns no matches (no consumers remain).
- [ ] `git grep -nE "font-family:\s*Arial" src/app/globals.css` returns no matches.
- [ ] `git grep -nE "<main\b" src/app/page.tsx` returns no matches (layout owns the `<main>`).
- [ ] `git grep -nE "<main\b" src/app/widgets/pomodoro/page.tsx` returns no matches.
- [ ] `git grep -nE "<main\b" src/app/layout.tsx` returns exactly one match.
- [ ] `git grep -nE "mt-8\b|mt-\[32px\]" src/app/page.tsx` returns no matches (the home-page header→card gap uses `mt-[48px]` or a parent `gap-[48px]`).
- [ ] `git grep -nE "mt-\[48px\]|gap-\[48px\]" src/app/page.tsx` returns at least one match.
- [ ] `git grep -nE "mt-\[24px\]" src/app/widgets/pomodoro/PomodoroCard.tsx` returns no matches.
- [ ] `git grep -nE "gap-\[32px\]" src/app/widgets/pomodoro/PomodoroCard.tsx` returns at least one match (the card root flex column gap).
- [ ] `src/app/widgets/pomodoro/PomodoroCard.tsx` still contains `p-[33px] pb-[32px]` on the card root `<article>` (Decision 6).
- [ ] `src/app/page.tsx` still contains a heading with accessible name "Widget Showcase" (verified by Testing Library `getByRole("heading", { name: /widget showcase/i })`).
- [ ] `src/app/page.tsx` still contains a link with `href="/widgets/pomodoro"` whose accessible name contains "Pomodoro" or "Work Time".
- [ ] `src/app/widgets/pomodoro/page.tsx` still mounts `<PomodoroCard />` (verified by Testing Library: rendering the route's default export queries `getByRole("heading", { name: /work time/i })` successfully).
- [ ] Neither `src/app/page.tsx` nor `src/app/widgets/pomodoro/page.tsx` contains a `"use client"` directive (`git grep -n '"use client"' src/app/page.tsx src/app/widgets/pomodoro/page.tsx` returns no matches).
- [ ] `.specs/pomodoro/spec.md` Decision 2 carries the `[DEPRECATED 2026-05-06 — superseded by .specs/app-shell/spec.md Decision 1]` marker, and its Visual contract bullets reference `gap-[48px]` (header→card) and `gap-[32px]` (in-card) (`git grep -n "DEPRECATED 2026-05-06" .specs/pomodoro/spec.md` returns at least one match; `git grep -nE "gap-\[48px\]|gap-\[32px\]" .specs/pomodoro/spec.md` returns at least two matches).
- [ ] `AGENTS.md` Architecture section contains a sentence pinning what `layout.tsx` owns and a sentence documenting the escape hatch (`git grep -nE "layout\.tsx owns" AGENTS.md` returns at least one match).
- [ ] `npm run lint` exits `0`.
- [ ] `npm run test:run` exits `0`.
- [ ] `npm run build` exits `0`.

### Regression Guardrails

- The existing `src/smoke.test.tsx` continues to pass unchanged.
- Every Scenario in `.specs/pomodoro/spec.md` continues to hold — timer transitions, accessible names, the settings-gear-is-decorative invariant, and the `formatMmSs` outputs are unchanged. The pomodoro test suite passes without modification (timer behaviour and accessibility queries do not depend on the lifted chrome).
- Deleting `src/app/widgets/pomodoro/` with one `rm -rf` does not break `npm run build` for the home route — the home route may render a degraded state (broken or stale link), but it must not throw.
- The Tailwind PostCSS pipeline (`postcss.config.mjs`, `@import "tailwindcss"` in `src/app/globals.css`) is not modified.
- React Compiler stays enabled (`next.config.ts` → `reactCompiler: true`).
- No `pages/` directory is introduced; routing remains App Router only.
- No CSS Module is added.
- The `@/*` path alias is used for any cross-`src/` imports.
- The `next/font/google` variables on `<html>` (`--font-geist-sans`, `--font-geist-mono`, `--font-space-grotesk`, `--font-inter`) remain available — no consumer that references those CSS variables breaks.
- **(Added 2026-05-08)** The layout `<main>` has `48px` of padding on all four sides — verified by either (a) `git grep -nE "p-\[48px\]" src/app/layout.tsx` returning at least one match, or (b) rendering any route in a Testing Library test and asserting `screen.getByRole("main").className` contains `p-[48px]`. The previous literals `px-[58.5px]` and `pt-[32px]` must not appear in `src/app/layout.tsx`.

### Scenarios

```gherkin
Scenario: Home route renders inside the lifted shell
  Given the user navigates to "/"
  When the page renders
  Then the rendered DOM contains exactly one <main> element on the page
  And that <main> is the one provided by src/app/layout.tsx
  And a heading with accessible name "Widget Showcase" is visible
  And a link with href="/widgets/pomodoro" is visible

Scenario: Pomodoro widget route renders inside the lifted shell
  Given the user navigates to "/widgets/pomodoro"
  When the page renders
  Then the rendered DOM contains exactly one <main> element on the page
  And a heading with accessible name "Work Time" is visible
  And the time display shows "25:00"

Scenario: Page background is single-sourced from <body>
  Given any route under src/app/
  When the page renders
  Then the <body> element has a class list containing "bg-[#030712]"
  And no descendant of <body> sets bg-[#030712] on its own className
  And src/app/globals.css contains no rule of the form "body { background: ... }"

Scenario: Header to card gap matches Figma node 1:4
  Given the user navigates to "/"
  When the page renders
  Then the gap between the "Widget Showcase" header element and the card link element is 48 pixels
  And src/app/page.tsx does NOT contain the class "mt-8" or "mt-[32px]" on that gap

Scenario: Pomodoro card inner vertical rhythm matches Figma node 1:11
  Given the Pomodoro card is rendered in any state
  When the DOM is inspected
  Then the card root <article> has a class list containing "flex", "flex-col", and "gap-[32px]"
  And no child of the card root applies "mt-[24px]" to space itself from a sibling

Scenario: Pomodoro card bottom padding follows Decision 6
  Given the Pomodoro card is rendered in any state
  When the DOM is inspected
  Then the card root <article> has a class list containing "p-[33px]" and "pb-[32px]"

Scenario: globals.css no longer fights the dark shell
  Given a clean checkout on this branch with the spec applied
  When a reviewer runs "git grep -nE 'background:\s*var\(--background\)' src/app/globals.css"
  Then no matches are produced
  And "git grep -nE '--background|--foreground' src/app/globals.css" produces no matches
  And "git grep -nE '--background|--foreground' src" produces no matches

Scenario: A widget can opt out of the shell at its own page.tsx
  Given a hypothetical widget at "src/app/widgets/sketchpad/page.tsx" that wants a white, full-bleed background
  When that widget renders an outer wrapper "<div className=\"-m-[48px] min-h-screen bg-white\">"
  Then the rendered widget shows a white background that extends to the viewport edges
  And src/app/layout.tsx is not modified to support the opt-out
  And no other widget's chrome is affected
  # Amended 2026-05-08: the negative-margin override was previously `-mx-[58.5px] -mt-[32px]`;
  # after the 48px-all-sides amendment it cancels the layout's `p-[48px]` with a uniform `-m-[48px]`.

Scenario: Pomodoro widget folder deletion does not break the home route
  Given the directory "src/app/widgets/pomodoro/" has been removed by "rm -rf"
  When "npm run build" is run
  Then the build exits with status 0
  And the home route may render a degraded state (broken link), but it does not throw

Scenario: Pomodoro behaviour is unchanged after the lift
  Given the user navigates to "/widgets/pomodoro"
  When the user clicks the start button
  And the test advances timers by 1000 ms
  Then the time display shows "24:59"
  And the start button's accessible name matches /pause/i
  And clicking reset returns the time display to "25:00"

Scenario: Settings gear remains decorative after the lift
  Given the Pomodoro card is rendered in any state
  When the user clicks the settings gear element
  Then no observable state change occurs (time, button labels, and DOM structure are unchanged)
  And no element with role="button" has accessible name matching /settings/i

Scenario: layout.tsx owns the chrome, not the route content
  Given a clean checkout on this branch with the spec applied
  When a reviewer runs "git grep -nE 'bg-\[#030712\]|max-w-\[1280px\]|p-\[48px\]' src/app"
  Then matches appear only in src/app/layout.tsx
  And no matches appear in src/app/page.tsx or src/app/widgets/pomodoro/page.tsx
  And "git grep -nE 'px-\[58\.5px\]|pt-\[32px\]' src/app" produces no matches anywhere
  # Amended 2026-05-08: the chrome assertion now keys on `p-[48px]` instead of `px-[58.5px]`;
  # the old gutter and top-padding literals must not appear in any file under src/app.

Scenario: Pomodoro spec is amended in the same commit
  Given the commit that applies this spec
  When a reviewer inspects the commit's file list
  Then it contains both code changes (src/app/layout.tsx, src/app/page.tsx, src/app/widgets/pomodoro/page.tsx, src/app/widgets/pomodoro/PomodoroCard.tsx, src/app/globals.css)
  And it contains the spec amendment (.specs/pomodoro/spec.md with the [DEPRECATED 2026-05-06 ...] marker on Decision 2)
  And it contains the AGENTS.md Architecture-section amendment (the sentence pinning what layout.tsx owns)

Scenario: Quality gates pass
  Given the spec has landed
  When CI runs "npm run lint" then "npm run test:run" then "npm run build"
  Then all three commands exit with status 0
```
