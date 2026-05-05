<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Stack

- **Next.js 16.2.4** — App Router only (`src/app/`). React Compiler is **enabled** (`next.config.ts` → `reactCompiler: true`); do not hand-write `useMemo`/`useCallback` for memoization the compiler already handles.
- **React 19.2.4** + **react-dom 19.2.4**.
- **TypeScript 5**, `strict: true`, `moduleResolution: "bundler"`, path alias `@/*` → `./src/*`. No `.js` build output (`noEmit`).
- **Tailwind CSS v4** via `@tailwindcss/postcss` (PostCSS pipeline, not the v3 config file). Class ordering is enforced by `prettier-plugin-tailwindcss`; `cn`/`clsx`/`cva`/`tv` are recognized as Tailwind functions.
- **Vitest 3** with `jsdom`, `@vitejs/plugin-react`, and `vite-tsconfig-paths`. Setup in `vitest.setup.ts` registers `@testing-library/jest-dom` and runs `cleanup()` after each test.
- **ESLint 9** flat config extending `eslint-config-next/core-web-vitals` + `/typescript`.
- **Prettier 3** with the Tailwind plugin.
- **Babel React Compiler** plugin (`babel-plugin-react-compiler@1.0.0`).

Local docs (read these before changing framework-touching code):

- `node_modules/next/dist/docs/01-app/` — App Router (the one we use)
- `node_modules/next/dist/docs/02-pages/` — Pages Router (we do **not** use it)
- `node_modules/next/dist/docs/03-architecture/`, `04-community/`, `index.md`

## Repo layout

```
src/
  app/                  # App Router root
    layout.tsx          # Root layout, Geist + Geist Mono via next/font/google
    page.tsx            # Home route
    globals.css         # Tailwind entry / global styles
    page.module.css     # CSS-module example
    favicon.ico
  smoke.test.tsx        # Vitest + Testing Library smoke test (template for new tests)
public/                 # Static assets served at /
.specs/                 # Living specs and PBIs (Spec → Plan → Build pipeline)
.claude/
  commands/             # Slash command definitions
  agents/               # Persona subagents (Analyst, Lead, Dev, Critic) — dispatched via the Agent tool
next.config.ts          # reactCompiler: true
eslint.config.mjs       # Flat config
prettier.config.mjs     # Tailwind plugin + tailwindFunctions
vitest.config.mts       # jsdom + react plugin + tsconfig paths
vitest.setup.ts         # jest-dom matchers + auto cleanup
tsconfig.json           # strict, @/* alias
```

## Architecture

This is a **teaching sandbox** for agentic coding, edited by many developers in parallel. Architecture optimizes for **legibility, isolation, and low merge-conflict surface** — not for production scale or DRY reuse.

- **Demos are self-contained.** Each lesson/exercise lives in its own folder under `src/app/demos/<demo-name>/` with its `page.tsx`, components, and tests colocated. Everything a demo needs sits inside its folder.
- **Duplicate freely; do not DRY across demos.** Shared `lib/`, shared UI primitives, and cross-demo imports become merge-conflict hotspots and let one dev's refactor break everyone else's lesson. If two demos look similar, leave them similar — each demo must remain deletable in one `rm -rf`.
- **No shared mutable state across demos.** No global store, no shared DB schema, no cross-demo imports. A broken demo must not cascade.
- **`lib/` stays tiny and stable.** Only truly universal utilities (e.g. `cn()`, env access). Treat additions to `lib/` as a load-bearing decision, not a convenience.
- **Flat beats clever.** A new dev or agent should answer "where does this go?" in <30 seconds from `AGENTS.md` + `ls src/app/`. Do not introduce `features/`, `server/`, or layered directories until there is concrete demand.
- **Architecture is pedagogy.** The shape devs see here is the shape they will learn to build. Model agent-friendly patterns: explicit conventions, predictable file locations, `AGENTS.md` as the contract, specs in `.specs/`.

Target shape:

```
src/
  app/
    page.tsx              # Index / catalog of demos
    demos/<demo>/         # Self-contained: page.tsx + components + tests
  lib/                    # Universal only: cn(), env — kept tiny
```

## Scripts

- `npm run dev` — `next dev`
- `npm run build` — `next build`
- `npm run start` — `next start`
- `npm run lint` — `eslint`
- `npm run test` — `vitest` (watch)
- `npm run test:run` — `vitest run` (one-shot; this is the gate `/build` invokes)

Quality gate inside `/build` is: `lint` + `tsc --noEmit` (implicit via Next/TS) + `test:run`.

## Conventions

- **App Router only.** New routes go under `src/app/<segment>/page.tsx`. Do not introduce `pages/`.
- **Server components by default.** Add `"use client"` only when the component needs interactivity, browser APIs, or React state/effects.
- **Imports** use the `@/*` alias instead of long relative paths.
- **Tests** colocated as `*.test.ts(x)` next to the code they exercise (see `src/smoke.test.tsx` for the canonical setup). Use Testing Library queries (`getByRole`, etc.) and `jest-dom` matchers — they are pre-registered.
- **Styling**: Tailwind utility classes are the default; reach for CSS Modules (`*.module.css`) only for genuinely scoped, non-utility cases like the existing `page.module.css`.
- **Fonts** via `next/font/google` (see `layout.tsx`). Do not add `<link rel="stylesheet">` for fonts.
- **No `--no-verify`, no `// @ts-ignore`, no skipped tests** to make a gate pass (factory rule).

## Personas

Subagents in `.claude/agents/`: `analyst`, `lead`, `dev`, `critic` (referenced as `@Analyst`, `@Lead`, `@Dev`, `@Critic`). Slash commands dispatch to them via the Agent tool — each runs in its own context window with a tool allowlist that enforces persona boundaries (e.g. `critic` has no Edit/Write). The main thread orchestrates and relays results; do not preload agent files.

## Slash commands

Factory pipeline (Discover → Define → Spec → Assemble → Run):
`/discover`, `/challenge`, `/spec`, `/plan`, `/build`, `/review`, `/ship`, `/learn`. Reference card: `/cheat-sheet`.
Definitions: `.claude/commands/`. Specs and PBIs live under `.specs/`.
