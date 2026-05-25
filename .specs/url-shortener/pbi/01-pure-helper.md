# PBI 01: Pure code-generation helper

## Directive

Create the pure TypeScript helper `shorten.ts` that exports `generateCode(): string`, and its co-located unit test `shorten.test.ts`. These two files have no React or browser dependencies; the test suite can be run in isolation. Nothing outside `src/app/widgets/url-shortener/` is created or modified. `lucide-react` is NOT required for this PBI.

## Spec pointer

- .specs/url-shortener/spec.md#architecture
- .specs/url-shortener/spec.md#definition-of-done (item 3)

## Files in scope

- `src/app/widgets/url-shortener/shorten.ts`
- `src/app/widgets/url-shortener/shorten.test.ts`

## Acceptance (from spec Contract)

- [ ] `shorten.ts` exports `generateCode(): string`.
- [ ] `generateCode()` returns a string of exactly 6 characters.
- [ ] Every character in the returned string matches `[A-Za-z0-9]` (base62 alphabet).
- [ ] `generateCode()` uses only `Math.random()`; no `crypto.getRandomValues` call appears in `shorten.ts`.
- [ ] Successive calls to `generateCode()` produce differing values with high probability (test must assert this over ≥ 10 calls).
- [ ] `npm run test:run` passes with no skipped tests after adding these two files.
- [ ] `npm run lint` passes with no errors after adding these two files.
- [ ] No file outside `src/app/widgets/url-shortener/` is created or modified.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
- Scenario(s): .specs/url-shortener/spec.md — no Gherkin scenario directly covers `generateCode` in isolation; the unit test encodes the contract (length = 6, charset = `[A-Za-z0-9]`, output varies).

## Dependencies

- Requires: none

## Refinement rule

If reality diverges from the spec while implementing, stop and request a `/spec update url-shortener` rather than improvising.
