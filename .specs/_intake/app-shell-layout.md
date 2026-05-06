# Topic: App-shell chrome in `layout.tsx`

## Sources

- **Raw signal (learner intent, quoted):** "Consider the design here: https://www.figma.com/design/w28z2LVnu8xwN4B51vgORg/Untitled?node-id=1-2&m=dev Move the implementation of the basic grid to the top-level layout.tsx. Add missing margins. Fix bugs in pomodoro widget layout"
- **Figma design (retrieved 2026-05-06 via Figma desktop MCP, by the orchestrator/parent thread):** node `1:2` in file `w28z2LVnu8xwN4B51vgORg` ("Untitled"). Node `1:2` is named "Dark Grid Layout Design" (`1397×1043`) and is the **parent frame** of node `1:3` "App". `get_variable_defs` for `1:2` returned `{}` — no Figma variables defined; all values are literals. Inner content of `1:2` is **identical** to node `1:3` already documented in `.specs/_intake/pomodoro-and-app-grid.md` Pattern P4 (same `1280×598` App container at offset `(58.5, 32)`, same Header `1280×72`, same PomodoroTimer card `410.66×478`, same colors, same typography, same icons). Node `1:2` adds only an outer `bg-white` Figma canvas wrapper around the `bg-[#030712]` App frame; that white wrapper is canvas chrome, not a real-world page layer.
- **Repo state — duplicated chrome today:**
  - `/Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/src/app/page.tsx:5-6` — `min-h-screen bg-[#030712]` / `mx-auto w-full max-w-[1280px] px-[58.5px] pt-8`.
  - `/Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/src/app/widgets/pomodoro/page.tsx:5-6` — `min-h-screen bg-[#030712] px-[58.5px] pt-[32px]` / `mx-auto max-w-[1280px]`.
  - `/Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/src/app/layout.tsx:32-44` — currently only mounts fonts on `<html>`; `<body>{children}</body>` carries no chrome.
  - `/Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/src/app/globals.css:25-34` — `body` is `display:flex; flex-direction:column; min-height:100%` with `background: var(--background)` (light/dark token), which is overridden per-route by `bg-[#030712]`.
- **Existing specs:**
  - `/Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/.specs/pomodoro/spec.md` Decision 2 pins `layout.tsx` scope to "fonts only" and explicitly states "This is the only file PBI 01 touches outside `src/app/widgets/pomodoro/`."
  - `/Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/.specs/styling/spec.md` covers Tailwind pipeline + home-route migration; does not address shared chrome.
- **Architecture contract:** `/Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/AGENTS.md` → Architecture: widgets self-contained, deletable in one `rm -rf`, no shared mutable state across widgets, "`lib/` stays tiny and stable," "Flat beats clever." Also: App Router only, server components by default.
- **Git context:** branch `feat/pomodoro` (clean) at `40524f4` "Merge pull request #3 from futurice/feat/orchestration"; pomodoro widget and home showcase already shipped.

## Patterns

### P1 — The page chrome is duplicated across two routes today

- Source: `src/app/page.tsx:5-6` and `src/app/widgets/pomodoro/page.tsx:5-6` (cited above).
- Observation: Both routes set the same dark page background (`#030712`), the same container max-width (`1280px`), the same horizontal padding (`58.5px`), and equivalent top padding (`pt-8` ≈ `pt-[32px]`).
- Observation: `layout.tsx` only carries font CSS variables today; it does not own page-level visual chrome.
- Interpretation `(hypothesis)`: The learner reads this duplication as the "basic grid" — a shell wrapper that sets background, max width, and side gutters around `{children}`. Lifting it into `RootLayout` removes two copies and gives every future widget the same shell for free.

### P2 — There is direct architectural tension with `AGENTS.md`

- Source: `AGENTS.md` → Architecture: "Duplicate freely; do not DRY across widgets… one learner's refactor break someone else's widget" and "A new learner or agent should answer 'where does this go?' in <30 seconds."
- Observation: A `RootLayout` shell that sets background color and container width applies to **every** widget route, including widgets that haven't been written yet. A future widget that wants a different background (white, image, video) would have to override or fight the shell.
- Observation: This is _not_ the same risk class as a shared `lib/util.ts`: `RootLayout` is the App Router's canonical place for page-shell, and Next.js docs (`node_modules/next/dist/docs/01-app/`) show this pattern. Putting fonts and shared CSS variables there is already standard.
- Interpretation `(hypothesis)`: The decision the spec needs to pin is **what** belongs in `layout.tsx` — fonts (already there), background color (proposed), container max-width (proposed), horizontal gutters (proposed) — vs **what** stays per-widget (vertical rhythm, card chrome, widget-specific dark/light deviations). Different choices produce very different blast radii.

### P3 — `globals.css` already sets a competing background

- Source: `src/app/globals.css:25-34` — `body` has `background: var(--background)` driven by light/dark CSS variables.
- Source: both current pages override that with `bg-[#030712]` on a wrapper inside `<body>`.
- Observation: If `layout.tsx` owns the background, `globals.css`'s `body { background: var(--background) }` is redundant or contradictory. Either `globals.css` should drop the `body` background, or the design's `#030712` should become a CSS variable so both files agree.
- Interpretation `(hypothesis)`: A clean lift requires a single source of truth for "page background." The simplest shape: drop the `body` background rule from `globals.css` (or set it to `#030712`) and apply Tailwind utilities on `<body>` in `layout.tsx`.

### P4 — "Basic grid" is overloaded

- Source: `.specs/_intake/pomodoro-and-app-grid.md` → P9: "There is no 'grid' in the current Figma — it's a header + one card."
- Source: this signal again says "basic grid" without further definition.
- Observation: At 1 widget, the only grid-shaped concern that exists is **the page shell** (background + max-width + gutters). There is still no multi-cell grid in evidence.
- Observation: Node `1:2` (parent of `1:3`) is named "Dark Grid Layout Design" but its inner content is literally one header plus one card — there are no grid cells, no columns, no row repeats. The "Grid" in the frame name is **aspirational naming**, not a multi-cell layout.
- Interpretation `(hypothesis)`: The learner is using "grid" to mean "page shell," not "card grid." If a multi-cell card grid is also wanted (rows of widget tiles on the home page), that is a _separate_ concern that depends on a second widget existing and on a Figma frame that actually shows multiple cells.

### P5 — Pomodoro spec Decision 2 is contradicted by this ask

- Source: `.specs/pomodoro/spec.md` line 14 (Decision 2): "`src/app/layout.tsx` … This is the only file PBI 01 touches outside `src/app/widgets/pomodoro/`," and "narrowly" scoped to fonts.
- Observation: Lifting page chrome into `layout.tsx` makes `layout.tsx` an owner of more than fonts.
- Observation: This is _not_ a regression of any prior bug — it is a forward architectural change.
- Interpretation `(hypothesis)`: The pomodoro spec should **not** absorb this. It belongs in a new spec (call it `app-shell` / `layout-chrome`) whose Contract pins what `layout.tsx` is allowed to own across the platform, and whose Definition of Done removes the duplicated chrome from `page.tsx` and `widgets/pomodoro/page.tsx`. The pomodoro spec should later be amended (by `@Lead`) to drop its now-shared chrome, but only after this new spec lands.

### P6 — Settings/typeface variables are already in `<html>`, not `<body>`

- Source: `src/app/layout.tsx:38-44` — font CSS variables live on `<html>`, `<body>` is empty.
- Observation: If new chrome goes on `<body>` (background, flex column from `globals.css`), the existing pattern is internally consistent: `<html>` carries variables, `<body>` carries the visual shell. Putting a `<main>` or `<div>` inside `<body>` for the `max-w-[1280px]` container is also a natural App Router shape (Next.js docs reference this).
- Interpretation `(hypothesis)`: Two viable shapes for `@Lead` to pick between in `/spec`:
  1. Push utilities directly onto `<body>` (background, min-height) and add a `<main>` wrapper for max-width + gutters. Keeps it shallow.
  2. Add an explicit `<AppShell>` server component inside `layout.tsx` for the wrapper. Slightly more ceremony but easier to evolve.

### P7 — Node `1:2` resolves "missing margins" into two specific gap values

- Source: Figma desktop MCP retrieval of node `1:2` by the orchestrator on 2026-05-06 (verbatim observations forwarded into the parent thread).
- Observation — **Header → inner Container gap**: declared as `gap-[48px]` on the Container at Figma node `1:4` (inside `1:2`/`1:3`). Current `src/app/page.tsx:15` uses `mt-8` (= `32px`) between `<header>` and the card div. **8px short of the design.**
- Observation — **PomodoroTimer card internal vertical rhythm**: declared as `gap-[32px]` on the `flex flex-col` PomodoroTimer at Figma node `1:11`, between the title/gear row, the ring container, and the button row. Current `src/app/widgets/pomodoro/PomodoroCard.tsx:85,119` uses `mt-[24px]` between header→ring and ring→buttons. **8px short on each gap.**
- Observation — **Card padding**: design declares `pt-[33px] px-[33px] pb-px` (a `1px` bottom adjustment). Current `PomodoroCard.tsx:57` and `page.tsx:18` use `p-[33px] pb-[32px]` — `pb-[32px]` against design `pb-[1px]`. The arithmetic only closes if the `gap-[32px]` between the last button row and the card bottom is meant to come from `gap` rather than card padding (with `pb-[1px]`, content sits at `33 + 36 + 32 + 256 + 32 + 56 = 445` plus `1px` = `446`, but the card is `478` tall — a `32px` discrepancy).
- Observation — **Button row**: design declares `pl-[108.328px] pr-[108.336px] gap-[16px]` to center two `56×56` buttons inside the `344.66px` container. Current implementation uses `justify-center gap-[16px]` which is functionally equivalent (also centers two equal buttons). **Not a bug.**
- Observation — **Settings gear**: design declares `rounded-[8px] size-[36px]`. Current implementation renders as a `<span>` per `pomodoro/spec.md` Decision 3 (decorative). **Not a bug.**
- Interpretation `(hypothesis)`: Two of these are clearly actionable bugs against the design — the `mt-8` on the home route and the two `mt-[24px]` gaps inside the card are short by `16px` and `8px` respectively. The card-bottom-padding question is an **Open Question for `@Lead`**: either the design's last child has implicit trailing space from a parent flex `gap`, or `pb-[32px]` in the current implementation accidentally compensates correctly and the spec should call this out. This is not a definite bug — `@Lead` decides at `/spec` time.

### P8 — Two of the four sub-asks belong in pomodoro, not app-shell

- Source: parent task description splitting the signal into A1 (pomodoro layout bugs), A2 (move shell to `layout.tsx`), A3 (missing margins), A4 (fix pomodoro layout bugs).
- Observation: A1 + A4 are unambiguously pomodoro-card concerns (the `mt-[24px]` rhythm). A3 ("missing margins") spans both — the header→card gap is on the home page (or, post-lift, on the shell), but the in-card gaps are pomodoro-territory. A2 is the only sub-ask that genuinely creates a new domain.
- Interpretation `(hypothesis)`: Routing is two-way. A2 → this intake, new `app-shell` (or similarly-named) domain. A1 + A3 (header→card portion) + A4 → spec amendment to `.specs/pomodoro/spec.md` because the home route's `mt-8` is currently part of the pomodoro spec's home-showcase deliverable (PBI 02), not part of any independent shell spec yet. Once an `app-shell` spec lands and absorbs the header→card gap, the home page's gap moves with it; for now it lives where the home showcase lives.

## Open Questions

1. ~~**What does node `1:2` actually show?**~~ **RESOLVED (P7).** Node `1:2` is the parent frame "Dark Grid Layout Design" wrapping node `1:3` "App"; inner content matches `pomodoro-and-app-grid.md` P4. Three gap literals were extracted: header→container `gap-[48px]`, in-card vertical rhythm `gap-[32px]`, card bottom-padding `pb-[1px]`. The first two are direct mismatches against the current code; the third is an Open Question for `@Lead` about whether trailing flex-gap counts toward parent height.
2. **Does the page background `#030712` live in `layout.tsx` or in `globals.css` (or both, via a CSS variable)?** P3 has to be resolved before a clean lift.
3. **Is the container max-width (`1280px`) and side padding (`58.5px`) part of the shell, or per-widget?** Lifting both means future widgets that want full-bleed (e.g. a sketchpad, a chess board) have to opt out.
4. **Does the shell include a header slot?** Today `page.tsx` renders the "Widget Showcase" header inline. If the shell owns the header on every page, the pomodoro widget route would gain it for free — which may or may not be desired (pomodoro has its own card header, not a "Widget Showcase" header).
5. **What happens to `globals.css` body styles** (`display:flex; flex-direction:column; min-height:100%`)? Stay, move to `layout.tsx`, or be replaced by Tailwind utilities on `<body>`?
6. **Is there a multi-cell card grid in the new design?** No (P4): node `1:2` has the same one-card content as `1:3`. Until a second widget exists or a new Figma frame shows a real grid, this stays deferred.
7. **Are widgets allowed to opt out of the shell?** If a future widget needs a different background or no max-width, what's the documented escape hatch?
8. **What architectural rule does this set in `AGENTS.md`?** If `layout.tsx` becomes a non-trivial shared owner, `AGENTS.md` → Architecture should be updated to spell out what's allowed there (so future learners and agents don't keep re-relitigating the boundary).

## Candidate Problems

- **C1 — Lift shared page chrome into `RootLayout`.** Move the dark background, container max-width, and horizontal gutters from `src/app/page.tsx` and `src/app/widgets/pomodoro/page.tsx` into `src/app/layout.tsx` (most likely on `<body>` plus a `<main>`/`<div>` wrapper). Reconcile with `src/app/globals.css` so background is single-sourced. Update both consuming routes to drop their copies. Pin in `AGENTS.md` what `layout.tsx` is allowed to own. **This is the primary candidate** and the one most directly tied to the signal's A2.
- **C2 — Update `.specs/pomodoro/spec.md` Decision 2 once C1 lands.** Decision 2 currently says `layout.tsx` is fonts-only; after C1, it must allow the shell. Owned by `@Lead`. Not bundled here because the pomodoro spec should not be edited by the analyst, and because C1 has to land before this amendment is meaningful.
- **C3 — Pomodoro visual-fidelity spec amendment (A1 + A3 + A4 of the original signal).** Drafted as a non-applied diff in the parent thread routing summary — see "Spec amendment to `.specs/pomodoro/spec.md`" below. Two concrete gap mismatches against node `1:2`/`1:3`: `mt-8` on the home page (should be `48px`) and `mt-[24px]` × 2 inside the card (should be `32px`). One Open Question for `@Lead` on card bottom padding (`pb-[32px]` vs design `pb-[1px]`). Owned by `@Lead`; the analyst does not write spec edits.
- **C4 — Multi-cell home-page card grid (deferred).** Node `1:2` does not show a grid (P4). Park until either a second widget exists or the design clearly demands it (mirrors the deferral already on file in `.specs/_intake/pomodoro-and-app-grid.md` C3).
