# PBI 10: In-ring phase label and removal of top-of-card "Work Time" / "Rest Time" heading

> Build order: lands second in the 2026-05-08 #3 amendment wave, after PBI `09-css-ring-rewrite.md`. Both PBIs touch `PomodoroCard.tsx` and `PomodoroCard.test.tsx`; sequencing them avoids merge contention and lets the heading-name test migrations bundled here run against the post-rewrite test file.

## Directive

Apply spec Decision 11 (Amendment 2026-05-08 #3) in a single atomic merge: introduce a small `<h2>` "phase label" inside the ring container above the MM:SS time display, AND remove the existing top-of-card `<h2>` "Work Time" / "Rest Time" heading. The card's heading semantic is preserved by relocating it — the same `<h2>` element type continues to exist; only its position, accessible name, and typography change.

Specifically:

- **Add** an `<h2>` element rendered INSIDE the ring container (the same container PBI 09 rewrites in CSS), positioned above the MM:SS time display and centered. Its text content is exactly:
  - `"work"` (lowercase) in states `idle`, `paused-from-work`, `running` (work), and `completed`.
  - `"rest"` (lowercase) in states `resting` and `paused-from-rest`.
- **Style** the new `<h2>` with Inter Regular `12px / 16px`, color `#99A1AF`, centered. Implemented via Tailwind utilities — the rendered `className` includes `text-[12px]` (or a numerically equivalent utility), `text-[#99A1AF]`, and a `font-[var(--font-inter)]` class binding. Letter-spacing is left at default Inter unless visual deviation forces an override (in which case prefer a Tailwind arbitrary-value utility over a CSS Module).
- **Always render** the phase label (it is NOT hidden in idle, NOT hidden in any state).
- **Remove** the existing top-of-card `<h2>` "Work Time" / "Rest Time" element. The card header row keeps the Settings button on the right but no longer carries a left-side title. After this PBI lands, `queryByRole("heading", { name: /^(work|rest) time$/i })` returns `null` in every state.
- **Keep** the heading queryable: existing tests that ask for "is there a heading with the active phase as its name?" continue to work — they just match `/^work$/i` or `/^rest$/i` instead of `/work time/i` / `/rest time/i`. The number of `<h2>` elements in the card after this PBI is exactly one (the new in-ring label); before this PBI it was one (the top-of-card title).
- **Reachability**: if the ring container previously carried `aria-hidden="true"`, EITHER drop that attribute (preferred — the in-ring heading needs to be reachable by assistive tech) OR hoist the `<h2>` out of the hidden subtree by promoting it above the ring container in the DOM while still rendering it visually centered above the MM:SS span via CSS positioning. The binding requirement is that the heading is queryable via `getByRole("heading", { name: /^work$/i })` etc. — the technique is implementation-defined.

The state machine, `setInterval` lifecycle, settings panel, sliders, button row, MM:SS time display, ring CSS encoding (introduced by PBI 09), ring foreground colors (introduced by PBI 09), ring track color, polish utilities, and home route are NOT modified by this PBI.

Scope is strictly `PomodoroCard.tsx` and its colocated `PomodoroCard.test.tsx`. Do not introduce new files, shared tokens, `src/lib/` or `src/components/` entries, upward (`../`) imports out of the widget folder, or a `*.module.css` file. Do not introduce a new color literal outside the palette `{#030712, #0B1220, #101828, #111827, #1E2939, #1F2937, #155DFC, #3B82F6, #51A2FF, #AD46FF, #99A1AF, #F87171, #34D399, #FFFFFF}` (the palette is unchanged by this PBI; `#99A1AF` is already in it).

### C5 test-rewrite authorization (inherited from spec Contract)

Per spec Contract section "Test rewrite authorization (C5)" third bullet (added 2026-05-08 #3, second sentence), this PBI is **explicitly authorized** to rewrite the following heading-name queries in `src/app/widgets/pomodoro/PomodoroCard.test.tsx`. `/review` shall not flag these rewrites as regressions.

- Every `getByRole("heading", { name: /work time/i })` — currently at lines `38`, `110`, `125`, `339` (and any others surfacing during PBI 09's test rewrite) — becomes `getByRole("heading", { name: /^work$/i })`.
- Every `getByRole("heading", { name: /rest time/i })` — currently at lines `189`, `203`, `214`, `323` — becomes `getByRole("heading", { name: /^rest$/i })`.

Additionally, this PBI introduces NEW assertions (not rewrites of existing ones) for:

- The negative DoD bullet: `queryByRole("heading", { name: /^(work|rest) time$/i })` returns `null` in every state. At minimum, assert this in `idle`, `running`, `paused-from-work`, `resting`, `paused-from-rest`, post-reset.
- The phase-label typography bullet: the rendered `className` of the in-ring `<h2>` matches `/text-\[12px\]/` (or a numerically equivalent utility, e.g. `/text-xs/` if `12px` is the configured Tailwind `xs` size — implementations that use a different name must verify the rendered size; the binding contract is the substring `text-[12px]` per spec Decision 11), `/text-\[#99A1AF\]/`, and `/font-\[var\(--font-inter\)\]/`.
- The phase-label always-visible bullet: in idle, the heading is in the document; after start, after pause, after phase advance, after reset — the heading is in the document.
- The in-ring positioning bullet (looser): the `<h2>` is a descendant of the ring container (or, if the implementation hoists it out of an `aria-hidden` subtree, it is still rendered above the MM:SS time display in document order). Verified by either `getRingContainer(container).contains(heading)` or by asserting the `<h2>` precedes the MM:SS span element in DOM order.

## Spec pointer

- `.specs/pomodoro/spec.md#blueprint` — Amendment 2026-05-08 #3 paragraph (introduces Decision 11).
- `.specs/pomodoro/spec.md#blueprint` — Decision 11 ("Phase label above the time display").
- `.specs/pomodoro/spec.md#blueprint` — Visual contract bullet "Card title" (deprecated 2026-05-08 #3 — the `<h2>` "Work Time" / "Rest Time" is REMOVED).
- `.specs/pomodoro/spec.md#blueprint` — Visual contract bullet "Phase label (inside ring container, above the time display)" (added 2026-05-08 #3 — the `<h2>` `"work"` / `"rest"` is INTRODUCED, with typography binding).
- `.specs/pomodoro/spec.md#contract` — DoD section "Idle render and a11y" — the `/^work$/i` heading bullet and the negative `/^(work|rest) time$/i` bullet.
- `.specs/pomodoro/spec.md#contract` — DoD section "Strict-alternation cycle (Decision 6)" — the `/^rest$/i` and `/^work$/i` heading bullets after phase advance.
- `.specs/pomodoro/spec.md#contract` — DoD section "Phase label (Decision 11)" — every checkbox in this subsection is in scope for this PBI.
- `.specs/pomodoro/spec.md#contract` — Regression Guardrails bullet added 2026-05-08 #3: "The card no longer contains an `<h2>` element with text 'Work Time' or 'Rest Time'".
- `.specs/pomodoro/spec.md#contract` — Test rewrite authorization (C5), third bullet, second sentence (the explicit authorization paragraph for `/work time|rest time/i` heading-name rewrites).
- `.specs/pomodoro/spec.md` — Scenarios authored / amended 2026-05-08 #3 covered by this PBI: "Phase label appears above the time display (Decision 11)", "Card no longer carries the 'Work Time' or 'Rest Time' top-of-card heading", and the heading-name clauses in the rewritten/amended scenarios "Idle render of the Pomodoro card", "Changing Work length while idle updates the time display", "Changing Rest length while idle does not change the time display", "Reset returns to the initial work time", "Work interval reaching zero advances to resting (strict alternation)", "Rest interval reaching zero advances to a fresh work interval", "User opens settings panel during resting".

## Files in scope

- `src/app/widgets/pomodoro/PomodoroCard.tsx`
- `src/app/widgets/pomodoro/PomodoroCard.test.tsx`

## Acceptance (from spec Contract)

- [ ] In `src/app/widgets/pomodoro/PomodoroCard.tsx`, an `<h2>` element is rendered inside the ring container, positioned above the MM:SS time display, centered. Its text content is exactly `"work"` (lowercase) in states `idle`, `paused-from-work`, `running` (work), and `completed`; exactly `"rest"` (lowercase) in states `resting` and `paused-from-rest`. (If the implementation hoists the `<h2>` outside an `aria-hidden` subtree, it must still appear above the MM:SS span in DOM order so the visual contract holds.)
- [ ] In `src/app/widgets/pomodoro/PomodoroCard.tsx`, the previous top-of-card `<h2>` "Work Time" / "Rest Time" element is removed. The card header row keeps the Settings button on the right but no longer carries a left-side title.
- [ ] After this PBI lands, `queryByRole("heading", { name: /^(work|rest) time$/i })` returns `null` in every state. Verified by a Vitest scenario that asserts this in at least `idle`, `running`, `paused-from-work`, `resting`, `paused-from-rest`, and post-reset.
- [ ] The new `<h2>` element's `className` includes `text-[12px]` (or a numerically equivalent Tailwind utility — the binding substring is `text-[12px]` per spec Decision 11), `text-[#99A1AF]`, and `font-[var(--font-inter)]`. Verified by reading the rendered `className` and matching against each substring.
- [ ] The new `<h2>` element is always rendered — not hidden in idle, not hidden in any state. Verified by a Vitest scenario that asserts the heading is in the document in `idle`, `running`, `paused-from-work`, `resting`, `paused-from-rest`, and post-reset.
- [ ] In `src/app/widgets/pomodoro/PomodoroCard.test.tsx`, every existing query `getByRole("heading", { name: /work time/i })` is rewritten to `getByRole("heading", { name: /^work$/i })`. Per spec C5, this rewrite is authorized.
- [ ] In `src/app/widgets/pomodoro/PomodoroCard.test.tsx`, every existing query `getByRole("heading", { name: /rest time/i })` is rewritten to `getByRole("heading", { name: /^rest$/i })`. Per spec C5, this rewrite is authorized.
- [ ] In `src/app/widgets/pomodoro/PomodoroCard.test.tsx`, a new test asserts that the in-ring `<h2>` is a descendant of the ring container (or, under the hoist-out-of-`aria-hidden` variant, that the `<h2>` precedes the MM:SS span in DOM order).
- [ ] If the ring container previously carried `aria-hidden="true"`, this PBI either drops that attribute or hoists the `<h2>` out of the hidden subtree. The binding requirement is that the heading is queryable via `getByRole("heading", { name: /^work$/i })` and `getByRole("heading", { name: /^rest$/i })` — verified by the existing rewritten queries continuing to pass.
- [ ] The number of `<h2>` elements rendered inside the card after this PBI lands is exactly one (the new in-ring label). Verified by `container.querySelectorAll("h2").length === 1` (or by an equivalent assertion that distinguishes the in-ring label from any other `h2` outside the card; the assertion is scoped to the card root, not the document, since the home route also renders headings).
- [ ] No new color literal outside the palette `{#030712, #0B1220, #101828, #111827, #1E2939, #1F2937, #155DFC, #3B82F6, #51A2FF, #AD46FF, #99A1AF, #F87171, #34D399, #FFFFFF}` appears in `src/app/widgets/pomodoro/PomodoroCard.tsx`. The palette is unchanged by this PBI; `#99A1AF` is already in it. Verified by `git grep -nE "#[0-9A-Fa-f]{3,8}" src/app/widgets/pomodoro/PomodoroCard.tsx`.
- [ ] No new file is added under `src/lib/` or `src/components/` by this PBI.
- [ ] No `*.module.css` file is added by this PBI (Regression Guardrail).
- [ ] `git grep -nE "from ['\"]\\.\\./" src/app/widgets/pomodoro` continues to return no matches.
- [ ] The existing `src/smoke.test.tsx` continues to pass unchanged.
- [ ] All ring-contract assertions introduced by PBI 09 continue to pass — this PBI does not modify the ring's CSS encoding, foreground colors, track color, `--progress` math, drain direction, pause-freeze, phase-advance reset, or polish transition. The card's structural change is bounded to the heading.
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run test:run` exit `0`.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
- Scenarios from `.specs/pomodoro/spec.md`:
  - "Phase label appears above the time display (Decision 11)" — primary acceptance scenario for the in-ring `<h2>`.
  - "Card no longer carries the 'Work Time' or 'Rest Time' top-of-card heading" — primary acceptance scenario for the removal.
  - "Idle render of the Pomodoro card" — regression with the `/^work$/i` heading-name migration and the negative `/^(work|rest) time$/i` clause.
  - "Changing Work length while idle updates the time display" — regression with the `/^work$/i` migration.
  - "Changing Rest length while idle does not change the time display" — regression with the `/^work$/i` migration.
  - "Reset returns to the initial work time" — regression with the `/^work$/i` migration; also verifies the heading flips back to `"work"` from any non-idle state.
  - "Work interval reaching zero advances to resting (strict alternation)" — regression with the `/^rest$/i` migration; verifies the heading flips to `"rest"` on the work-to-rest phase advance.
  - "Rest interval reaching zero advances to a fresh work interval" — regression with the `/^work$/i` migration; verifies the heading flips back to `"work"` on the rest-to-work phase advance.
  - "User opens settings panel during resting" — regression with the `/^rest$/i` migration; verifies the heading is still in the document while the panel is open.
  - "Reset while paused returns to idle" — regression; verifies the heading flips to `"work"` on reset from `paused-from-work`. (If the test currently uses the `/work time/i` query, it is migrated here.)
  - "Pause freezes the displayed time and the ring progress" — regression; verifies the heading does not change on pause (`paused-from-work` keeps `"work"`).
  - "Ring at idle renders a flat foreground (no segmentation)" — regression from PBI 09. The heading-name query is unrelated to this scenario but the test file rewriter must not regress the ring assertions.
  - "Ring foreground color matches the active phase (Decision 10)" — regression from PBI 09.
  - "Ring is rendered without SVG (Decision 9)" — regression from PBI 09.
  - "Settings button has visible hover and focus states (polish)" — regression.
  - "Sliders use the existing accent color (polish)" — regression.
  - "Widget remains isolated" (outbound `../` half) — regression.

## Dependencies

- Requires: PBI 09 (`09-css-ring-rewrite.md`). PBI 10 lands second because (a) the in-ring heading is rendered inside the ring container that PBI 09 rewrites, (b) both PBIs touch `PomodoroCard.tsx` and `PomodoroCard.test.tsx` and parallel landing would create merge contention, and (c) the heading-name test migrations read more cleanly against the post-rewrite test file.
- Requires (transitively): PBIs 01, 03, 04, 05, 06, 07, 08 — all already shipped on `main`. The state machine, `setInterval` lifecycle, settings panel, sliders, button row, MM:SS display, and card scaffolding must already exist.
- Blocks: nothing in this amendment wave. After PBI 10 lands, the 2026-05-08 #3 amendment is fully consumed.

## Refinement rule

If reality diverges from the spec while implementing, stop and request `/spec update pomodoro` rather than improvising. In particular: do **not** retain the top-of-card "Work Time" / "Rest Time" `<h2>` (Decision 11 and the negative DoD bullet are binding); do **not** make the in-ring heading conditional or hidden in idle (the spec pins "always visible"); do **not** change the case of the new heading text (Decision 11 pins lowercase `"work"` and `"rest"`, and the queries use `^work$` / `^rest$` anchors that would fail against `"Work"` / `"Rest"`); do **not** introduce a new color literal — `#99A1AF` is already in the palette; do **not** repurpose the new `<h2>` for anything beyond the phase label (e.g. do not append the time, the slider value, or the state name); do **not** hoist the heading out of the ring's visual stacking context in a way that breaks the "above the MM:SS time display" visual contract; do **not** rewrite the ring-contract assertions introduced by PBI 09 — those are out of scope here and any drift on them is a PBI 09 regression. If `aria-hidden="true"` on the ring container cannot be cleanly dropped (because the implementation depends on it for accessibility-tree filtering of decorative DOM that survives PBI 09's CSS rewrite), escalate so the spec can pin one of the two reachability strategies (drop `aria-hidden` vs. hoist the heading) rather than improvising.
