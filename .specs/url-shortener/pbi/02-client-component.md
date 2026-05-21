# PBI 02: UrlShortenerCard client component

## Directive

Create the `"use client"` React component `UrlShortenerCard.tsx`. It owns all interactive state (`input`, `result`, `copied`, `copyTimeoutRef`), calls `generateCode()` from `shorten.ts` on each "Shorten" click, parses the hostname via `new URL(input).hostname`, and exposes the Copy affordance. Visual contract (card surface, typography, spacing, color palette, button shape, input field, result row) must be implemented exactly as specified in the Visual Contract section of the spec. React Compiler is active; do not hand-write `useMemo`/`useCallback`. No `lucide-react` import is strictly required — the spec marks iconography as "Optional" — but if used, `lucide-react` must be added to `package.json` as a dependency first (see spec gap note at the bottom of this PBI). No files outside `src/app/widgets/url-shortener/` are created or modified.

## Spec pointer

- .specs/url-shortener/spec.md#visual-contract-proposed--confirm-with-learner
- .specs/url-shortener/spec.md#architecture
- .specs/url-shortener/spec.md#definition-of-done
- .specs/url-shortener/spec.md#regression-guardrails
- .specs/url-shortener/spec.md#scenarios (Shorten a valid URL, Copy the short code, Copy fails when clipboard write is rejected, Shorten a second URL replaces the previous result, Reload resets all state, Focus ring is visible on the Shorten button, No hydration mismatch on mount)

## Files in scope

- `src/app/widgets/url-shortener/UrlShortenerCard.tsx`

## Acceptance (from spec Contract)

- [ ] File is marked `"use client"` at the top.
- [ ] Component renders without errors when mounted with an empty input.
- [ ] Controlled `<input>` has `placeholder="Paste a URL…"` and full-width styling matching the spec (height `40px`, background `#0B1220`, border `1px solid #1E2939`, border radius `8px`, text `#FFFFFF` Inter `14px`).
- [ ] "Shorten" button has `type="button"`, pill shape (border radius `9999px`, height `40px`), background `#155DFC`, text `#FFFFFF`, and `focus-visible:ring-2 focus-visible:ring-[#3B82F6]` className.
- [ ] Clicking "Shorten" with `https://www.example.com/some/very/long/path?q=1` renders a result row containing hostname `www.example.com` and a short code matching `/^\/[A-Za-z0-9]{6}$/`.
- [ ] Clicking "Shorten" a second time with a new URL replaces the previous result row (only one result row is visible at a time).
- [ ] The card root element's `className` matches `/p-\[24px\]/` and `/rounded-\[10px\]/`.
- [ ] Result row is a flex row with `gap-[12px]` and `items-center`, containing hostname (color `#99A1AF`), short code (bold, color `#FFFFFF`), and Copy button.
- [ ] Copy button has `type="button"`, pill shape, background `#1E2939`, text `#FFFFFF`, label "Copy".
- [ ] On `navigator.clipboard.writeText` resolving, Copy button label changes to "Copied!" for 2 000 ms then reverts to "Copy".
- [ ] When `navigator.clipboard.writeText` rejects, Copy button label stays "Copy".
- [ ] No inline `style` prop assigns a JavaScript `number` (not `string`) to a CSS custom property.
- [ ] No `font-[var(--font-…)]` Tailwind shorthand is used; font-family vars use `[font-family:var(--font-…)]` form.
- [ ] `useMemo` and `useCallback` are absent from the file (React Compiler handles memoization).
- [ ] `npm run lint` passes with no errors after adding this file.
- [ ] No file outside `src/app/widgets/url-shortener/` is created or modified.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
- Scenario(s): .specs/url-shortener/spec.md — "Shorten a valid URL", "Copy the short code", "Copy fails when clipboard write is rejected", "Shorten a second URL replaces the previous result", "Reload resets all state", "Focus ring is visible on the Shorten button", "No hydration mismatch on mount"

## Dependencies

- Requires: PBI 01 (shorten.ts must exist to import `generateCode`)

## Spec gap — lucide-react

The spec states lucide-react is "already in the project" but `package.json` does not list it and the pomodoro widget does not import it. If the optional Lucide icons are used, `lucide-react` must be added to `package.json` before the import is written. If icons are skipped, this gap has no impact. Do not invent an alternative icon approach — either add the package or omit icons entirely. If in doubt, request a `/spec update url-shortener` to resolve the iconography requirement.

## Refinement rule

If reality diverges from the spec while implementing, stop and request a `/spec update url-shortener` rather than improvising.
