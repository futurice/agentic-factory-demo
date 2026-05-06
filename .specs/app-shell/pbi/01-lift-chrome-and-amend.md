# PBI 01: Lift page chrome to `layout.tsx`, fix gaps, amend pomodoro spec and AGENTS.md

## Directive

Lift the four duplicated page-chrome literals (background `#030712`, max-width `1280px`, horizontal gutters `58.5px`, top padding `32px`) from the two existing routes into `src/app/layout.tsx`; remove the contradictory `body { background: var(--background) }` rule and the now-unused `--background`/`--foreground` variables from `src/app/globals.css`; fix the home-route header-to-card gap to `48px`; convert the Pomodoro card's child-margin rhythm into a flex-column `gap-[32px]` on the card root and keep the existing `p-[33px] pb-[32px]` per Decision 6; and — in the **same commit** — amend `.specs/pomodoro/spec.md` Decision 2 with the `[DEPRECATED 2026-05-06 — superseded by .specs/app-shell/spec.md Decision 1]` marker plus the new visual-contract bullets, and amend `AGENTS.md` Architecture section with one sentence pinning what `layout.tsx` owns and one sentence documenting the per-widget escape hatch. Scope is bounded to the seven files listed below; introduce no new files (no `<AppShell>` component, no `src/lib/` additions, no new CSS Modules), no `"use client"` directives on the two route files, no toolchain changes, and no edits to the Pomodoro test files or `src/smoke.test.tsx`. The spec deliberately bundles all four concerns plus the two same-commit amendments as one merge unit (see spec Context paragraph 2 and the "Pomodoro spec is amended in the same commit" Gherkin scenario); landing any subset would leave duplicate chrome, a contradicted Decision 2, or undocumented escape-hatch behaviour, all of which fail the spec's DoD.

## Spec pointer

- .specs/app-shell/spec.md#blueprint (Decisions 1–6)
- .specs/app-shell/spec.md#architecture (Modified files list)
- .specs/app-shell/spec.md#contract (Definition of Done, Scenarios)

## Files in scope

- /Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/src/app/layout.tsx
- /Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/src/app/page.tsx
- /Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/src/app/globals.css
- /Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/src/app/widgets/pomodoro/page.tsx
- /Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/src/app/widgets/pomodoro/PomodoroCard.tsx
- /Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/.specs/pomodoro/spec.md
- /Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/AGENTS.md

## Acceptance (from spec Contract)

- [ ] `git grep -nE "bg-\[#030712\]" src/app/page.tsx` returns no matches.
- [ ] `git grep -nE "bg-\[#030712\]" src/app/widgets/pomodoro/page.tsx` returns no matches.
- [ ] `git grep -nE "bg-\[#030712\]" src/app/layout.tsx` returns at least one match.
- [ ] `git grep -nE "max-w-\[1280px\]" src/app/page.tsx` returns no matches.
- [ ] `git grep -nE "max-w-\[1280px\]" src/app/widgets/pomodoro/page.tsx` returns no matches.
- [ ] `git grep -nE "max-w-\[1280px\]" src/app/layout.tsx` returns exactly one match.
- [ ] `git grep -nE "px-\[58\\.5px\]" src/app/page.tsx` returns no matches.
- [ ] `git grep -nE "px-\[58\\.5px\]" src/app/widgets/pomodoro/page.tsx` returns no matches.
- [ ] `git grep -nE "px-\[58\\.5px\]" src/app/layout.tsx` returns exactly one match.
- [ ] `git grep -nE "background:\s*var\(--background\)" src/app/globals.css` returns no matches.
- [ ] `git grep -nE "--background|--foreground" src/app/globals.css` returns no matches.
- [ ] `git grep -nE "--background|--foreground" src` returns no matches.
- [ ] `git grep -nE "font-family:\s*Arial" src/app/globals.css` returns no matches.
- [ ] `git grep -nE "<main\b" src/app/page.tsx` returns no matches.
- [ ] `git grep -nE "<main\b" src/app/widgets/pomodoro/page.tsx` returns no matches.
- [ ] `git grep -nE "<main\b" src/app/layout.tsx` returns exactly one match.
- [ ] `git grep -nE "mt-8\b|mt-\[32px\]" src/app/page.tsx` returns no matches.
- [ ] `git grep -nE "mt-\[48px\]|gap-\[48px\]" src/app/page.tsx` returns at least one match.
- [ ] `git grep -nE "mt-\[24px\]" src/app/widgets/pomodoro/PomodoroCard.tsx` returns no matches.
- [ ] `git grep -nE "gap-\[32px\]" src/app/widgets/pomodoro/PomodoroCard.tsx` returns at least one match.
- [ ] `src/app/widgets/pomodoro/PomodoroCard.tsx` still contains `p-[33px] pb-[32px]` on the card root `<article>`.
- [ ] `src/app/page.tsx` still contains a heading with accessible name "Widget Showcase".
- [ ] `src/app/page.tsx` still contains a link with `href="/widgets/pomodoro"` whose accessible name contains "Pomodoro" or "Work Time".
- [ ] `src/app/widgets/pomodoro/page.tsx` still mounts `<PomodoroCard />` (Testing Library `getByRole("heading", { name: /work time/i })` succeeds against the route's default export).
- [ ] Neither `src/app/page.tsx` nor `src/app/widgets/pomodoro/page.tsx` contains a `"use client"` directive.
- [ ] `.specs/pomodoro/spec.md` Decision 2 carries the `[DEPRECATED 2026-05-06 — superseded by .specs/app-shell/spec.md Decision 1]` marker; its Visual contract bullets reference `gap-[48px]` (header→card) and `gap-[32px]` (in-card) (`git grep -n "DEPRECATED 2026-05-06" .specs/pomodoro/spec.md` returns at least one match; `git grep -nE "gap-\[48px\]|gap-\[32px\]" .specs/pomodoro/spec.md` returns at least two matches).
- [ ] `AGENTS.md` Architecture section contains a sentence pinning what `layout.tsx` owns and a sentence documenting the escape hatch (`git grep -nE "layout\.tsx owns" AGENTS.md` returns at least one match).
- [ ] `npm run lint` exits `0`.
- [ ] `npm run test:run` exits `0`.
- [ ] `npm run build` exits `0`.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run && npm run build`
- Scenarios (all from `.specs/app-shell/spec.md` Contract > Scenarios):
  - "Home route renders inside the lifted shell"
  - "Pomodoro widget route renders inside the lifted shell"
  - "Page background is single-sourced from `<body>`"
  - "Header to card gap matches Figma node 1:4"
  - "Pomodoro card inner vertical rhythm matches Figma node 1:11"
  - "Pomodoro card bottom padding follows Decision 6"
  - "globals.css no longer fights the dark shell"
  - "A widget can opt out of the shell at its own page.tsx"
  - "Pomodoro widget folder deletion does not break the home route"
  - "Pomodoro behaviour is unchanged after the lift"
  - "Settings gear remains decorative after the lift"
  - "layout.tsx owns the chrome, not the route content"
  - "Pomodoro spec is amended in the same commit"
  - "Quality gates pass"

## Dependencies

- Requires: none.

## Refinement rule

If reality diverges from the spec while implementing, stop and request a `/spec update app-shell` rather than improvising.
