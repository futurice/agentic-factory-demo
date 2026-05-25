# Feature: URL Shortener Widget

## Blueprint

### Context

The learner asked to "build a URL shortener widget. The user pastes a long URL, hits a button, and gets a short link back that they can copy. Show the hostname next to the short code so they can see what they shortened. Keep it small — single input, a button, and the result below." The widget is self-contained under `src/app/widgets/url-shortener/`, mounted by a server `page.tsx` and driven by a single client component `UrlShortenerCard.tsx`. It inherits the shared page chrome from `src/app/layout.tsx` (background `#030712`, max-width `1280px`, `48px` padding) and requires no cross-widget imports or shared state.

The intake surfaced two unstated design decisions — persistence model and short-code shape — which this spec resolves to their simplest defaults:

- **Persistence:** session-only via `useState`. Short codes exist only for the lifetime of the browser tab; reloading the page resets the widget to its empty state. No `localStorage`, no server store, no URL params.
- **Short code shape:** 6-character random base62 string (characters `[A-Za-z0-9]`), generated deterministically on each "Shorten" button click. The same long URL may produce different codes on successive clicks; no de-duplication is required.

Because there is no Figma reference, the Visual Contract below is proposed from the design-contract template defaults.

### Visual Contract (proposed — confirm with learner)

All literals are drawn from `.specs/_templates/design-contract.md`. No values outside that template's option sets are introduced here.

**Card surface — Option A (Standard, Pomodoro-aligned)**
- Background: `#101828`
- Border: `1px solid #1E2939`
- Border radius: `10px`
- Padding: `24px` on all four sides (`p-[24px]`)
- Width: intrinsic (no fixed width constraint; the card grows to fill the container up to max-width)

**Typography — Scale 2 (Compact)**
- Card title (if used): Space Grotesk Bold `20px / 24px`
- Body / label text: Inter `14px / 20px`
- Caption / helper text: Inter `12px / 16px`, color `#99A1AF`

**Spacing — Rhythm 1 (8-grid)**
- Gap between card sections: `gap-[32px]`
- Gap between grouped controls (input row): `gap-[16px]`
- Gap between result columns (hostname | code | copy): `gap-[12px]`

**Color palette — Blue (default, Pomodoro-aligned)**
- Primary action button (`Shorten`): background `#155DFC`, text `#FFFFFF`
- Focus rings: `focus-visible:ring-2 focus-visible:ring-[#3B82F6]`
- Disabled / track: `#1F2937`
- Primary text: `#FFFFFF`
- Secondary text / hostname / caption: `#99A1AF`
- Short code: `#FFFFFF` (bold)

**Button shape — Option B (Pill)**
- Height: `40px`, auto width, border radius `9999px`
- Horizontal padding: `12px`
- Label: "Shorten"

**Copy affordance**
- A second pill button, height `40px`, auto width, border radius `9999px`, background `#1E2939`, text `#FFFFFF`, label "Copy"
- On successful `navigator.clipboard.writeText(...)`, the button label changes to "Copied!" for `2 000 ms` then reverts to "Copy"
- The copy target is the full short URL string shown in the result row (see Result row below)

**Input field**
- Full-width within the card, height `40px`, background `#0B1220`, border `1px solid #1E2939`, border radius `8px`, text `#FFFFFF` Inter `14px`, placeholder `"Paste a URL…"` color `#6B7280`
- Focus: `outline-none ring-2 ring-[#3B82F6]`

**Result row (visible only after a successful shorten)**
- Three elements in a single flex row, `gap-[12px]`, `items-center`:
  1. **Hostname** — extracted from the input URL via `new URL(input).hostname`; styled Inter `14px / 20px` color `#99A1AF`
  2. **Short code** — the generated 6-character code displayed as a full short URL string in the format `/<code>` (no real domain, just the path token); styled Inter Bold `14px / 20px` color `#FFFFFF`
  3. **Copy button** — pill button described above; copies the short code string (`/<code>`) to the clipboard

**Iconography**
- Lucide icons via `lucide-react`, size `16px`, stroke width `2`, decorative icons `aria-hidden="true"`
- Optional: a small `Link` icon before the input label or inside the "Shorten" button

### Decisions

**Decision 1 (2026-05-21):** v1 is happy-path-only. Input validation is deferred to v2.

### Architecture

- **New files (created by this spec):**
  - `src/app/widgets/url-shortener/page.tsx` — server component route for `/widgets/url-shortener`; renders `<UrlShortenerCard />` with no additional chrome.
  - `src/app/widgets/url-shortener/UrlShortenerCard.tsx` — `"use client"` component owning: `input` state (controlled), `result` state (`{ hostname: string; code: string } | null`), `copied` state (`boolean`), and `copyTimeoutRef`. Generates a 6-char base62 code on button click. No persistence outside `useState`.
  - `src/app/widgets/url-shortener/shorten.ts` — pure helper `generateCode(): string` returning a 6-character random base62 string.
  - `src/app/widgets/url-shortener/shorten.test.ts` — unit tests for `generateCode` (length, character set, output varies across calls).
  - `src/app/widgets/url-shortener/UrlShortenerCard.test.tsx` — Vitest + Testing Library coverage of the happy path, copy affordance (success and failure), and a11y queries.

- **No files outside `src/app/widgets/url-shortener/` are created or modified by this spec.** `src/app/layout.tsx` and `src/app/page.tsx` are left untouched.

- **Dependencies:**
  - `lucide-react` (already in the project — used by the pomodoro widget; check `package.json` before adding)
  - `navigator.clipboard` (browser API; no polyfill required for the jsdom test environment — mock it in tests)

- **Constraints:**
  - The widget must be fully deletable via `rm -rf src/app/widgets/url-shortener/` with zero impact on any other widget or route.
  - No import from `src/app/widgets/pomodoro/` or any other widget folder.
  - No addition to `src/lib/`.
  - `generateCode()` must use only `Math.random()`; no `crypto.getRandomValues` dependency (avoids a Node/jsdom divergence in tests).
  - The copy-to-clipboard call is `navigator.clipboard.writeText(...)`. It must be mocked in tests (jsdom does not implement `navigator.clipboard`).
  - React Compiler is enabled (`next.config.ts → reactCompiler: true`); do not hand-write `useMemo` / `useCallback` for memoization.
  - v1 calls `new URL(input)` directly without input validation; throwing on malformed input is acceptable v1 behavior (deferred to v2).

## Contract

### Definition of Done

- [ ] `src/app/widgets/url-shortener/page.tsx` exists and exports a default server component that renders `<UrlShortenerCard />`.
- [ ] `src/app/widgets/url-shortener/UrlShortenerCard.tsx` exists, is marked `"use client"`, and renders without errors.
- [ ] `src/app/widgets/url-shortener/shorten.ts` exports `generateCode(): string` returning a 6-character string matching `/^[A-Za-z0-9]{6}$/`.
- [ ] Clicking "Shorten" with a valid URL (e.g. `https://example.com/some/long/path`) renders a result row containing the hostname (`example.com`) and the generated short code.
- [DEPRECATED 2026-05-21 — deferred to v2 per learner clarification] Clicking "Shorten" with an invalid string (non-URL, e.g. `not-a-url`) renders an inline error message and does NOT render a result row.
- [ ] The result row contains a "Copy" button; clicking it writes the short code string to the clipboard and changes the button label to "Copied!" for 2 000 ms.
- [ ] All interactive elements have `type="button"` (or `type="submit"` for form submission if applicable) and a visible `focus-visible:ring-2 focus-visible:ring-[#3B82F6]` focus ring.
- [ ] The card root element's `className` matches `/p-\[24px\]/` and `/rounded-\[10px\]/`.
- [ ] The input element has `placeholder="Paste a URL…"`.
- [ ] `npm run test:run` passes with no skipped tests and no `console.error` calls during the card mount test (a `console.error` spy must be installed in any test that mounts `UrlShortenerCard`).
- [ ] `npm run lint` passes with no errors.
- [ ] No file outside `src/app/widgets/url-shortener/` is created or modified.

### Regression Guardrails

- Deleting `src/app/widgets/url-shortener/` must leave the rest of the repo in a passing `npm run test:run` state.
- `UrlShortenerCard.tsx` must not contain any inline `style` prop that assigns a JavaScript `number` (not `string`) to a CSS custom property (Constitution hydration rule).
- `UrlShortenerCard.tsx` must not use the `font-[var(--font-…)]` Tailwind shorthand; font-family CSS variables must use the `[font-family:var(--font-…)]` arbitrary-property form (Constitution hydration rule).

### Scenarios

```gherkin
Scenario: Shorten a valid URL
  Given the card is rendered with an empty input
  When the user types "https://www.example.com/some/very/long/path?q=1" into the input
  And the user clicks the "Shorten" button
  Then a result row appears below the input
  And the result row contains the hostname "www.example.com"
  And the result row contains a short code matching /^\/[A-Za-z0-9]{6}$/
  And no error message is visible

# [DEPRECATED 2026-05-21 — deferred to v2 per learner clarification]
# Scenario: Shorten an invalid input
#   Given the card is rendered with an empty input
#   When the user types "not-a-url" into the input
#   And the user clicks the "Shorten" button
#   Then an inline error message is visible
#   And no result row is rendered

# [DEPRECATED 2026-05-21 — deferred to v2 per learner clarification]
# Scenario: Shorten an empty input
#   Given the card is rendered with an empty input
#   When the user clicks the "Shorten" button without typing anything
#   Then an inline error message is visible
#   And no result row is rendered

Scenario: Copy the short code
  Given the card has produced a result row for "https://example.com"
  When the user clicks the "Copy" button
  Then navigator.clipboard.writeText is called with the displayed short code string
  And the "Copy" button label changes to "Copied!"
  And after 2000 ms the button label reverts to "Copy"

Scenario: Copy fails when clipboard write is rejected
  Given the card has produced a result row for "https://example.com"
  And navigator.clipboard.writeText is mocked to return a rejected Promise
  When the user clicks the "Copy" button
  Then the "Copy" button label does NOT change to "Copied!"
  And the button label remains "Copy"

Scenario: Shorten a second URL replaces the previous result
  Given the card has produced a result row for "https://first.com"
  When the user clears the input and types "https://second.com"
  And the user clicks the "Shorten" button
  Then the result row shows the hostname "second.com"
  And the previous result for "first.com" is no longer visible

Scenario: Reload resets all state
  Given the card has produced a result row for "https://example.com"
  When the page is reloaded (component is remounted with no external state)
  Then the input is empty
  And no result row is visible
  And no error message is visible

Scenario: Focus ring is visible on the Shorten button
  Given the card is rendered
  When the "Shorten" button receives keyboard focus
  Then the button's className includes "focus-visible:ring-2" and "focus-visible:ring-[#3B82F6]"

Scenario: No hydration mismatch on mount
  Given a console.error spy is installed before mounting UrlShortenerCard
  When the component is mounted
  Then the spy receives zero calls
```
