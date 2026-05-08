# PBI 02: Switch `<main>` padding to `p-[48px]` (all four sides)

## Directive

Replace the `<main>` element's className in `src/app/layout.tsx` from `mx-auto w-full max-w-[1280px] px-[58.5px] pt-[32px]` to `mx-auto w-full max-w-[1280px] p-[48px]`, and update `AGENTS.md`'s Architecture sentence about `layout.tsx` ownership so it references `<main>` padding `48px` on all four sides (not `58.5px` gutters / `32px` top padding) and so the escape-hatch example reads `-m-[48px]` (not `-mx-[58.5px] -mt-[32px]`). The code edit and the `AGENTS.md` edit ship in the **same commit** per the parent spec's same-commit rule (`.specs/app-shell/spec.md` Architecture > Modified files). This is the entirety of the change introduced by Amendment 2026-05-08: the layout `<main>` now carries `48px` of padding on all four sides (replacing the prior `58.5px` horizontal gutters and `32px` top padding, and pinning the previously-unspecified bottom padding to `48px`). The container max-width (`1280px`), the page background (`#030712` on `<body>`), the single-`<main>` invariant, the `next/font/google` variables, and every other piece of chrome remain untouched. No other files under `src/` change. No tests, no toolchain, no specs other than this PBI's parent spec (already amended) are touched.

## Spec pointer

- /Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/.specs/app-shell/spec.md (Amendment 2026-05-08, paragraph in `### Context`)
- /Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/.specs/app-shell/spec.md `### Decisions` Decision 1 and Decision 4 (the `[DEPRECATED 2026-05-08 ...]` markers and their replacement clauses)
- /Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/.specs/app-shell/spec.md `### Architecture` (`src/app/layout.tsx` bullet, with the `[DEPRECATED 2026-05-08 ...]` marker and the `p-[48px]` replacement)
- /Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/.specs/app-shell/spec.md `### Contract` Definition of Done (the four bullets added 2026-05-08 keyed on `p-[48px]`, `pt-[32px]`, `px-[58.5px]`)
- /Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/.specs/app-shell/spec.md `### Regression Guardrails` (the bullet "Added 2026-05-08")

## Files in scope

- /Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/src/app/layout.tsx
- /Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/AGENTS.md

No test file is colocated for `layout.tsx`, and `src/smoke.test.tsx` is a placeholder that does not render the layout. **Verification approach:** rely on the `git grep` DoD bullets below plus the spec's Regression Guardrail option (a) — a literal-grep check of `src/app/layout.tsx`. Do **not** add a new test file to verify the className; the regression guardrail explicitly accepts the grep check as sufficient. Manual visual inspection (`npm run dev`, view `/` and `/widgets/pomodoro`, confirm `48px` of padding around the content area) complements the grep check but is not a gate.

## Acceptance (from spec Contract, Amendment 2026-05-08 bullets)

- [ ] `git grep -nE "p-\[48px\]" src/app/layout.tsx` returns at least one match (the `<main>` element carries `p-[48px]`).
- [ ] `git grep -nE "px-\[58\\.5px\]" src/app/layout.tsx` returns no matches (the old horizontal-gutter literal is removed).
- [ ] `git grep -nE "pt-\[32px\]" src/app/layout.tsx` returns no matches (the old top-padding literal is removed).
- [ ] `git grep -nE "p-\[48px\]" src/app/page.tsx` returns no matches (chrome stays in the layout, not in routes).
- [ ] `git grep -nE "p-\[48px\]" src/app/widgets/pomodoro/page.tsx` returns no matches (chrome stays in the layout, not in routes).
- [ ] `git grep -nE "max-w-\[1280px\]" src/app/layout.tsx` still returns exactly one match (container max-width is unchanged).
- [ ] `git grep -nE "bg-\[#030712\]" src/app/layout.tsx` still returns at least one match (page background is unchanged).
- [ ] `git grep -nE "<main\b" src/app/layout.tsx` still returns exactly one match (single-`<main>` invariant is preserved).
- [ ] **(Load-bearing assertion.)** The `<main>` element's full className in `src/app/layout.tsx` is exactly `mx-auto w-full max-w-[1280px] p-[48px]` (no leftover `px-[58.5px]`, no leftover `pt-[32px]`, no extra utilities introduced). The grep bullets above are corroborating evidence; this exact-equality check is the one that makes the PBI verifiable.
- [ ] `AGENTS.md`'s Architecture sentence about `layout.tsx` ownership references `<main>` padding `48px` on all four sides (not `58.5px` gutters / top padding), and any escape-hatch example reads `-m-[48px]` (not `-mx-[58.5px] -mt-[32px]`). Verified by `git grep -nE '58\.5px|pt-\[32px\]|mx-\[58\.5px\]|mt-\[32px\]' AGENTS.md` returning no matches.
- [ ] `npm run lint` exits `0`.
- [ ] `npm run test:run` exits `0`.
- [ ] `npm run build` exits `0`.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run && npm run build`
- Scenarios from `.specs/app-shell/spec.md` Contract > Scenarios that this PBI must keep green:
  - "Home route renders inside the lifted shell" — single `<main>`, "Widget Showcase" heading visible, link to `/widgets/pomodoro` visible.
  - "Pomodoro widget route renders inside the lifted shell" — single `<main>`, "Work Time" heading visible, time display "25:00".
  - "Page background is single-sourced from `<body>`" — `<body>` still carries `bg-[#030712]`, no descendant overrides it.
  - "layout.tsx owns the chrome, not the route content" — amended 2026-05-08 to key on `p-[48px]` instead of `px-[58.5px]`; matches for `bg-[#030712] | max-w-[1280px] | p-[48px]` appear only in `src/app/layout.tsx`, and `px-[58.5px] | pt-[32px]` produces no matches anywhere under `src/app`.
  - "A widget can opt out of the shell at its own page.tsx" — amended 2026-05-08; the negative-margin escape hatch is now `-m-[48px]` (uniform), cancelling the layout's `p-[48px]`. This PBI does not introduce such a widget; the scenario holds because the layout's padding is now uniform on all four sides, so a single `-m-[48px]` cancels it.
  - "Quality gates pass" — `npm run lint`, `npm run test:run`, `npm run build` all exit `0`.
- Regression Guardrails kept green:
  - The "Added 2026-05-08" bullet — `<main>` has `48px` of padding on all four sides; verified via the grep on `p-[48px]` in `src/app/layout.tsx` and the absence of `px-[58.5px]` and `pt-[32px]` in the same file.
  - `src/smoke.test.tsx` continues to pass unchanged.
  - Every Scenario in `.specs/pomodoro/spec.md` continues to hold (timer behaviour, accessible names, settings-gear-is-decorative, `formatMmSs` outputs).
  - Tailwind PostCSS pipeline, React Compiler, App Router routing, `next/font/google` variables — all unchanged.

## Dependencies

- Requires: none for execution. PBI 01 (`.specs/app-shell/pbi/01-lift-chrome-and-amend.md`) shipped the original chrome lift in commit `2f8c542` (Merge of `feat/app-shell-layout`); this PBI builds on that landed state but introduces no new dependency on unlanded work.

## Refinement rule

If reality diverges from the spec while implementing (for example, the `<main>` element has been refactored away or an extra utility class has been added that interacts with padding), stop and request a `/spec update app-shell` rather than improvising. Do not change `<body>` styling, `globals.css`, route files, or the Pomodoro card as part of this PBI — those surfaces are out of scope for the 2026-05-08 amendment.
