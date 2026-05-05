# Feature: Tailwind-Only Styling (Remove CSS Modules)

## Blueprint

### Context

The project standardised on Tailwind CSS v4 (see `AGENTS.md` → Stack), but the home route still styles itself through a CSS Module (`src/app/page.module.css`) imported by `src/app/page.tsx`. Two-track styling is the current state: Tailwind dependencies are installed (`tailwindcss@^4.2.4`, `@tailwindcss/postcss@^4.2.4`, `prettier-plugin-tailwindcss`, `eslint-plugin-tailwindcss`) yet `src/app/globals.css` has no `@import "tailwindcss"` directive and no `postcss.config.*` exists at the repo root, so Tailwind utilities are not actually being emitted today. Removing CSS Modules requires both deleting the module file and ensuring the Tailwind pipeline is genuinely wired so the migrated markup renders correctly.

### Architecture

- **Files in scope:**
  - `src/app/page.tsx` — replace `styles.*` `className` references with Tailwind utility classes; remove the `import styles from "./page.module.css"` line.
  - `src/app/page.module.css` — deleted.
  - `src/app/globals.css` — add the Tailwind v4 entrypoint (`@import "tailwindcss";`) and migrate the `.page`-scoped CSS custom properties to Tailwind theme tokens (or retain as CSS variables consumed by utility classes via `bg-[var(--…)]` / a `@theme` block) so dark-mode colour tokens still resolve.
  - `postcss.config.mjs` — created at repo root, registering `@tailwindcss/postcss` as a plugin so `next build` / `next dev` pick it up.
- **Visual contract preserved from `page.module.css`:**
  - Layout: column flex, centred, `max-width: 800px` main, `120px 60px` padding (collapsing to `48px 24px` below 600px viewport).
  - Typography: `--font-geist-sans` on the page wrapper; `h1` 40/48 with `-2.4px` tracking, `p` 18/32 — both with `text-wrap: balance`. Below 600px, `h1` becomes 32/40 with `-1.92px` tracking.
  - CTAs: pill buttons (`border-radius: 128px`), 40px tall, primary filled with `--text-primary` on `--background`, secondary outlined with `--button-secondary-border`.
  - Hover (only under `(hover: hover) and (pointer: fine)`): primary → `--button-primary-hover`, secondary → `--button-secondary-hover`.
  - Dark mode (`prefers-color-scheme: dark`): swaps the colour-token set on `.page` and inverts the logo image.
- **Dependencies:**
  - Depends on: `tailwindcss@^4`, `@tailwindcss/postcss@^4`, Next.js 16 App Router PostCSS pipeline.
  - Depended on by: any future component that wants the Tailwind utility surface (currently none beyond the home route).
- **Constraints:**
  - The home route renders identical pixels (within sub-pixel rendering tolerance) before and after migration on both colour schemes and at both responsive breakpoints.
  - `src/app/**/*.module.css` files no longer exist after this change.
  - `src/app/page.tsx` contains zero references to a `styles` identifier from a CSS-module import.
  - Tailwind class ordering is left to `prettier-plugin-tailwindcss` (already configured in `prettier.config.mjs`).
  - Existing scripts (`npm run lint`, `npm run test:run`, `npm run build`) continue to pass without flag changes.
  - React Compiler stays enabled (`next.config.ts`); no `useMemo`/`useCallback` is introduced for class-string composition.

## Contract

### Definition of Done

- [ ] `src/app/page.module.css` is deleted (`test ! -e src/app/page.module.css`).
- [ ] `git grep -n "module.css" src/` returns no matches.
- [ ] `git grep -nE "from ['\"].*\\.module\\.css['\"]" src/` returns no matches.
- [ ] `src/app/globals.css` contains the line `@import "tailwindcss";` (or the equivalent Tailwind v4 entrypoint per `node_modules/tailwindcss/dist/lib.css` documentation).
- [ ] A `postcss.config.mjs` (or `.cjs`/`.ts`) exists at the repo root and registers `@tailwindcss/postcss` as a plugin.
- [ ] `npm run lint` exits 0.
- [ ] `npm run test:run` exits 0.
- [ ] `npm run build` exits 0 and produces a `.next/` build output that includes Tailwind-generated utility CSS (verifiable by grepping the emitted CSS for at least one utility produced by classes used in `page.tsx`, e.g. `flex` or `max-w-`).
- [ ] No new package is added to `package.json` solely to support this migration (the existing Tailwind/PostCSS dependencies are sufficient).

### Regression Guardrails

- Dark mode continues to follow the OS-level `prefers-color-scheme: dark` setting on the home route — no manual toggle is introduced.
- Hover styles on primary/secondary CTAs remain gated to fine-pointer, hover-capable devices (no hover effects on touch devices).
- The home route remains a Server Component (no `"use client"` directive added).
- `next/font/google` Geist + Geist Mono variables (`--font-geist-sans`, `--font-geist-mono`) remain available globally and are still applied to the page wrapper's font stack.
- The smoke test `src/smoke.test.tsx` continues to pass unchanged.

### Scenarios

```gherkin
Scenario: Home route renders without the CSS module
  Given the working tree on main with this PBI applied
  When a developer runs "npm run dev" and visits http://localhost:3000
  Then the page displays the Next.js logo, the "To get started, edit the page.tsx file." heading, the intro copy, and both Deploy Now / Documentation CTAs
  And the rendered DOM contains no class name beginning with the CSS-module hash prefix (e.g. "page_page__")
  And every className on a rendered element is composed of Tailwind utility classes or font-variable identifiers from next/font

Scenario: Build pipeline emits Tailwind utilities
  Given postcss.config.mjs registers "@tailwindcss/postcss"
  And src/app/globals.css imports "tailwindcss"
  When "npm run build" completes successfully
  Then the emitted CSS under .next/ contains at least one Tailwind-generated rule for a utility used in src/app/page.tsx (e.g. ".flex{display:flex}")
  And the build log contains no warning about an unrecognised "@import" or unknown PostCSS plugin

Scenario: Dark mode parity
  Given the operating system is set to "Dark" appearance
  When the home route is rendered
  Then the page background uses the dark token (#000) and the foreground text uses #ededed
  And the Next.js logo image is inverted (visually light on dark)

Scenario: Light mode parity
  Given the operating system is set to "Light" appearance
  When the home route is rendered
  Then the page background uses #fafafa, the inner main panel uses #ffffff
  And primary CTA text is #fafafa on a #000 background; secondary CTA has the #ebebeb border

Scenario: Responsive breakpoint parity
  Given a viewport width of 599px
  When the home route is rendered
  Then the main panel padding is 48px vertical / 24px horizontal
  And the h1 font-size is 32px with line-height 40px and letter-spacing -1.92px

Scenario: Hover gating on touch
  Given a device that reports "(hover: none)" or "(pointer: coarse)"
  When the user taps the primary CTA without releasing
  Then the CTA's background colour does not change to the hover token (#383838 in light, #cccccc in dark)

Scenario: Quality gates pass after migration
  Given the migration has been applied
  When CI runs "npm run lint" then "npm run test:run" then "npm run build"
  Then all three commands exit with status 0
  And no command emits a warning about CSS Modules or unresolved Tailwind classes

Scenario: No stray CSS-module artefacts remain
  Given the migration has been applied
  When a reviewer runs "git grep -n 'module.css' -- src/"
  Then the command produces no output and exits with status 1
```
