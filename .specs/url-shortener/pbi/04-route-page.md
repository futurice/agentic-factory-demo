# PBI 04: Server component route page

## Directive

Create `src/app/widgets/url-shortener/page.tsx` as a Next.js server component (no `"use client"` directive). Its sole responsibility is to render `<UrlShortenerCard />` with no additional chrome — no extra wrapper divs, no heading, no layout changes. This file registers the `/widgets/url-shortener` route in the Next.js App Router. No files outside `src/app/widgets/url-shortener/` are created or modified. `src/app/layout.tsx` and `src/app/page.tsx` are left untouched.

## Spec pointer

- .specs/url-shortener/spec.md#architecture
- .specs/url-shortener/spec.md#definition-of-done (items 1, 2, 12)

## Files in scope

- `src/app/widgets/url-shortener/page.tsx`

## Acceptance (from spec Contract)

- [ ] `page.tsx` exists and exports a default function (server component — no `"use client"` at the top of this file).
- [ ] The default export renders `<UrlShortenerCard />` and nothing else.
- [ ] `src/app/layout.tsx` is unmodified.
- [ ] `src/app/page.tsx` is unmodified.
- [ ] `npm run lint` passes with no errors after adding this file.
- [ ] `npx tsc --noEmit` reports no errors after adding this file.
- [ ] No file outside `src/app/widgets/url-shortener/` is created or modified.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
- Scenario(s): No Gherkin scenario in the spec targets the server route directly; DoD items 1 and 2 in the spec Contract are the binding acceptance criteria.

## Dependencies

- Requires: PBI 02 (UrlShortenerCard.tsx must exist to import)

## Refinement rule

If reality diverges from the spec while implementing, stop and request a `/spec update url-shortener` rather than improvising.
