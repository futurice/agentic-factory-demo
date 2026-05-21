# PBI 03: UrlShortenerCard component tests

## Directive

Create `UrlShortenerCard.test.tsx` using Vitest and Testing Library. The test file must cover the complete happy path (shorten a valid URL → result row appears), the copy affordance (success and failure), the a11y queries (roles, labels), and must install a `console.error` spy in any test that mounts `UrlShortenerCard` to detect hydration mismatches. `navigator.clipboard.writeText` must be mocked (jsdom does not implement it). All Gherkin scenarios in the spec that can be tested in jsdom must have a corresponding test case. No files outside `src/app/widgets/url-shortener/` are created or modified.

## Spec pointer

- .specs/url-shortener/spec.md#definition-of-done (items 4, 6, 10)
- .specs/url-shortener/spec.md#scenarios (all non-deprecated scenarios)

## Files in scope

- `src/app/widgets/url-shortener/UrlShortenerCard.test.tsx`

## Acceptance (from spec Contract)

- [ ] A `console.error` spy is installed in every test that mounts `UrlShortenerCard`; the spy must assert zero calls at the end of those tests.
- [ ] Test: typing a valid URL and clicking "Shorten" renders a result row with the correct hostname and a short code matching `/^\/[A-Za-z0-9]{6}$/`.
- [ ] Test: clicking "Copy" calls `navigator.clipboard.writeText` with the displayed short code string, and the button label changes to "Copied!".
- [ ] Test: after 2 000 ms (via `vi.useFakeTimers` / `vi.advanceTimersByTime`), the Copy button label reverts to "Copy".
- [ ] Test: when `navigator.clipboard.writeText` is mocked to reject, the Copy button label does NOT change to "Copied!".
- [ ] Test: shortening a second URL replaces the previous result row (only one result row visible).
- [ ] Test: remounting the component (simulating reload) starts with empty input and no result row.
- [ ] Test: the "Shorten" button's className includes `focus-visible:ring-2` and `focus-visible:ring-[#3B82F6]`.
- [ ] `npm run test:run` passes with no skipped tests after adding this file.
- [ ] `npm run lint` passes with no errors after adding this file.
- [ ] No file outside `src/app/widgets/url-shortener/` is created or modified.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
- Scenario(s): .specs/url-shortener/spec.md — "Shorten a valid URL", "Copy the short code", "Copy fails when clipboard write is rejected", "Shorten a second URL replaces the previous result", "Reload resets all state", "Focus ring is visible on the Shorten button", "No hydration mismatch on mount"

## Dependencies

- Requires: PBI 02 (UrlShortenerCard.tsx must exist to import and mount)

## Refinement rule

If reality diverges from the spec while implementing, stop and request a `/spec update url-shortener` rather than improvising.
