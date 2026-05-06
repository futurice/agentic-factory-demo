# PBI 02: Home route restructured as Widget Showcase

## Directive

Replace `src/app/page.tsx` wholesale with the "Widget Showcase" header + one card linking to `/widgets/pomodoro`, per Figma node `1:3`. The route stays a server component. Strip every reference to the Next.js starter splash (`/next.svg`, `/vercel.svg`, "Deploy Now", "Documentation"). Render exactly one link to the Pomodoro widget — no invented multi-column grid, no placeholder cards for widgets that do not exist. Inline Figma literals (background `#030712`, gradient `linear-gradient(90deg, #51A2FF 0%, #AD46FF 100%)`, Space Grotesk Bold 36/40 heading, Inter Regular 16/24 subtitle `#99A1AF`) as Tailwind utility values; introduce no new files outside `src/app/page.tsx`, no shared theme tokens, no `src/lib/` or `src/components/` additions. The home route must not import from `src/app/widgets/pomodoro/` — the link is a string href only — so that deleting the widget folder leaves the home route renderable (it may degrade to a placeholder/empty card area but must not crash).

## Spec pointer

- .specs/pomodoro/spec.md#blueprint (Decision 1, Architecture, Constraints)
- .specs/pomodoro/spec.md#contract

## Files in scope

- `src/app/page.tsx` (replaced wholesale)

## Acceptance (from spec Contract)

- [ ] `src/app/page.tsx` no longer references `/next.svg`, `/vercel.svg`, "Deploy Now", or "Documentation" (verified by `git grep -n "vercel.svg\|next.svg\|Deploy Now\|Documentation" src/app/page.tsx` returning no matches).
- [ ] `src/app/page.tsx` renders a heading with accessible name "Widget Showcase".
- [ ] `src/app/page.tsx` renders a link with `href="/widgets/pomodoro"` whose accessible name contains "Pomodoro" or "Work Time".
- [ ] The home route remains a server component (no `"use client"` directive on `src/app/page.tsx`).
- [ ] `git grep -n "from \"@/app/widgets/pomodoro" src/app` returns no matches that originate from `src/app/page.tsx` (the home route does not import from the widget folder).
- [ ] Deleting `src/app/widgets/pomodoro/` with one `rm -rf` does not cause `npm run build` to fail (the home route may render a degraded state but must not throw).
- [ ] No new file is added under `src/lib/` or `src/components/` by this PBI.
- [ ] `npm run lint`, `npm run test:run`, and `npm run build` all exit `0` after this PBI lands on top of PBI 01.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
- Scenarios:
  - "Home route shows the Widget Showcase header and one card" (.specs/pomodoro/spec.md, Scenarios block)
  - "Widget folder deletion does not break the home route build"
  - "Widget remains isolated" (the inbound `git grep 'widgets/pomodoro' src/app/widgets` half — confirms no cross-widget imports were introduced)
  - "Quality gates pass"

## Dependencies

- Requires: PBI 01 (only for the link target `/widgets/pomodoro` to resolve at build time and for the end-to-end "Quality gates pass" scenario; PBI 02's own files compile and lint independently because the link is a string href, not an import).

## Refinement rule

If reality diverges from the spec while implementing, stop and request a `/spec update pomodoro` rather than improvising.
