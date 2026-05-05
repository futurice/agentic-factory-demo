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
`/discover`, `/challenge`, `/spec`, `/plan`, `/challenge-plan`, `/build`, `/review`, `/ship`, `/learn`. End-to-end orchestrator: `/factory`. Reference card: `/cheat-sheet`.

The pipeline is the **agentic double diamond**: Diamond 1 (Problem Space) refines `/discover` → `/challenge` → `/spec`; Diamond 2 (Solution Space) refines `/plan` → `/challenge-plan` → `/build` → `/review`; `/learn` closes the Run-phase loopback. `/factory` walks this end-to-end and pauses only at diamond boundaries — see `/cheat-sheet` for the flow.
Definitions: `.claude/commands/`. Specs and PBIs live under `.specs/`.
