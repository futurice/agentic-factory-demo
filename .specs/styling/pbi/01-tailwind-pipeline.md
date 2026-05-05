# PBI 01: Wire up the Tailwind v4 PostCSS pipeline

## Directive

Activate the already-installed Tailwind v4 dependencies so utility classes are actually emitted by `next build` / `next dev`. Create a root `postcss.config.mjs` registering `@tailwindcss/postcss`, and add the Tailwind v4 entrypoint (`@import "tailwindcss";`) to `src/app/globals.css`. No application markup changes in this PBI — the existing CSS Module continues to style the home route until PBI 02 lands.

## Spec pointer

- `.specs/styling/spec.md` → Architecture (postcss.config.mjs + globals.css bullets) and DoD items for Tailwind wiring.

## Files in scope

- `postcss.config.mjs` (new)
- `src/app/globals.css` (add `@import "tailwindcss";`)

## Acceptance (from spec Contract)

- [ ] `src/app/globals.css` contains the line `@import "tailwindcss";`.
- [ ] A `postcss.config.mjs` (or `.cjs`/`.ts`) exists at the repo root and registers `@tailwindcss/postcss` as a plugin.
- [ ] `npm run build` exits 0 and the emitted CSS under `.next/` contains at least one Tailwind-generated rule (e.g. Preflight `*,::before,::after` reset, since no utilities are in use yet).
- [ ] `npm run lint` exits 0.
- [ ] `npm run test:run` exits 0.
- [ ] No new packages added to `package.json`.
- [ ] The home route still renders identically to the pre-PBI state (CSS Module is untouched and still wins).

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run && npm run build`
- Build artefact check: grep emitted `.next/static/css/*.css` (or equivalent) for a Preflight signature, e.g. `*,::before,::after`.
- Scenario(s): `Scenario: Build pipeline emits Tailwind utilities` in `.specs/styling/spec.md`.

## Dependencies

- Requires: none

## Refinement rule

If reality diverges from the spec while implementing, stop and request a `/spec update styling` rather than improvising.
