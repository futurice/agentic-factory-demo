# Platform Constitution

Project-wide architectural values that every widget must respect, regardless of what its own spec says. Specs cover **what a widget does**; the Constitution covers **how all widgets must behave** so they can coexist on this platform.

The Critic validates `/review` against both contracts. A PBI passes only when neither is violated.

## NEVER

- **Cross-widget imports.** Code under `src/app/widgets/<a>/` must not import from `src/app/widgets/<b>/`. Each widget remains deletable in one `rm -rf`.
- **Shared mutable state across widgets.** No global stores, no shared singletons, no shared DB schema, no module-level mutable singletons in `src/lib/`. A broken widget must not cascade.
- **Widget-specific code in `src/lib/`.** Only truly universal utilities go there (`cn()`, env access). Anything that names a widget concept belongs inside that widget's folder.
- **Layered directories at the repo root.** No `features/`, `server/`, `domain/`, `services/`, etc. App Router file-system routing only.
- **A `pages/` directory.** App Router only.
- **Hand-written `useMemo`/`useCallback`** for memoization the React Compiler already handles (it's enabled via `next.config.ts`).
- **`<link rel="stylesheet">` for fonts.** Use `next/font/google`.
- **Bypassing quality gates.** No `--no-verify`, no `// @ts-ignore`, no skipped tests to make a gate pass.
- **DRY across widgets.** Two widgets that look similar stay similar. Shared abstractions are merge-conflict hotspots and let one learner's refactor break another's widget.
- **Hydration-unsafe patterns in client components.** Two specific shapes are forbidden because they ship a class mismatch between server and client renders that `lint` / `tsc` / `test:run` do not catch: (a) assigning a JavaScript `number` (not `string`) to a CSS custom property at the React-style boundary, e.g. `style={{ "--x": 0.5 }}` — coerce with `String(...)` instead; (b) Tailwind v4's `font-[var(--font-…)]` shorthand on a CSS variable — use the unambiguous arbitrary-property form `[font-family:var(--font-…)]`. Codified after pomodoro Amendment 2026-05-08 #6 (`.specs/pomodoro/spec.md`, `.specs/pomodoro/pbi/13-hydration-guardrail.md`).
- **Suppressing hydration warnings to dodge the contract.** `suppressHydrationWarning`, wrapping a component in `<ClientOnly>` / `dynamic(..., { ssr: false })`, or `useEffect`-gated mounts to opt out of SSR are not acceptable fixes for a hydration mismatch. The contract is that the component renders identically on server and client.

## ALWAYS

- **Widget self-containment.** A widget's `page.tsx`, components, tests, and helpers all live under `src/app/widgets/<name>/`. Deleting that folder removes the widget completely.
- **Server components by default.** Add `"use client"` only when the component needs interactivity, browser APIs, or React state/effects.
- **Colocated tests** as `*.test.ts(x)` next to the code under test. Template: `src/smoke.test.tsx`.
- **Tailwind utilities first.** Reach for CSS Modules only for genuinely scoped non-utility cases.
- **`@/*` alias for imports** rather than long relative paths.
- **Read `node_modules/next/dist/docs/01-app/`** before touching framework APIs you're unsure about — Next 16 has breaking changes from training data.
- **Same-commit rule.** When code reveals a spec is wrong, the spec update ships in the same commit as the code change.

## How to update this Constitution

Add or amend rules only when (a) you have observed a recurring violation that the existing rules failed to prevent, or (b) a platform-level architectural decision changed. Each change should reference the incident or decision in the commit message. Do not add rules speculatively.
