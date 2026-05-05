# PBI 02: Migrate the home route off CSS Modules to Tailwind utilities

## Directive

Replace every `className={styles.*}` reference in `src/app/page.tsx` with Tailwind utility classes that reproduce the visual contract documented in the spec (layout, typography, CTA pills, hover gating, dark-mode token swap, 600px breakpoint). Delete `src/app/page.module.css` and remove its import. Re-encode the colour tokens previously living in `.page` so dark mode continues to swap palettes — either via Tailwind v4 `@theme`/CSS-variable utilities in `src/app/globals.css` or via inline `var(--…)` references on the migrated elements. No new packages, no new components, no `"use client"` directive.

## Spec pointer

- `.specs/styling/spec.md` → Architecture "Visual contract preserved from `page.module.css`" and DoD items 1–3 + scenarios for parity / no-stray-artefacts / quality gates.

## Files in scope

- `src/app/page.tsx`
- `src/app/page.module.css` (deleted)
- `src/app/globals.css` (only if dark-mode tokens or breakpoint helpers are introduced via `@theme`; otherwise leave as PBI 01 left it)

## Acceptance (from spec Contract)

- [ ] `src/app/page.module.css` is deleted (`test ! -e src/app/page.module.css`).
- [ ] `git grep -n "module.css" src/` returns no matches (exit 1).
- [ ] `git grep -nE "from ['\"].*\\.module\\.css['\"]" src/` returns no matches (exit 1).
- [ ] `src/app/page.tsx` contains no `import styles from …` and no `styles.` member access.
- [ ] `src/app/page.tsx` remains a Server Component (no `"use client"` directive).
- [ ] The emitted `.next/` CSS contains at least one Tailwind-generated rule for a utility used in `src/app/page.tsx` (e.g. `.flex{display:flex}` or `max-w-[800px]`).
- [ ] `npm run lint` exits 0.
- [ ] `npm run test:run` exits 0.
- [ ] `npm run build` exits 0.
- [ ] No new package added to `package.json`.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run && npm run build`
- Visual parity (manual or screenshot diff via `npm run dev`):
  - Light mode at viewport ≥ 600px: matches pre-PBI screenshot.
  - Light mode at viewport 599px: `h1` collapses to 32/40/-1.92px, main padding `48px 24px`.
  - Dark mode (`prefers-color-scheme: dark`): page background `#000`, text `#ededed`, logo inverted.
  - Hover on fine-pointer device: primary CTA → `#383838` (light) / `#cccccc` (dark); secondary CTA background → `#f2f2f2` (light) / `#1a1a1a` (dark).
  - Touch device (`(hover: none)` or `(pointer: coarse)`): no hover colour swap on tap-and-hold.
- Scenario(s) in `.specs/styling/spec.md`:
  - `Scenario: Home route renders without the CSS module`
  - `Scenario: Light mode parity`
  - `Scenario: Dark mode parity`
  - `Scenario: Responsive breakpoint parity`
  - `Scenario: Hover gating on touch`
  - `Scenario: Quality gates pass after migration`
  - `Scenario: No stray CSS-module artefacts remain`

## Dependencies

- Requires: PBI 01 (Tailwind utilities must actually be emitted, otherwise the migrated markup renders unstyled).

## Refinement rule

If reality diverges from the spec while implementing — e.g. a Tailwind v4 utility cannot reproduce a specific behaviour (`text-wrap: balance`, hover gating media query, etc.) without an arbitrary value or a small CSS escape hatch in `globals.css` — stop and request a `/spec update styling` rather than improvising.
