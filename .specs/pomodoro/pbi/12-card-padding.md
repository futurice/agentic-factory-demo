# PBI 12: Pomodoro card padding amended to `p-[24px]`

> Build order: lands as the sole PBI of the 2026-05-08 #5 amendment wave, after the entire #1–#4 wave (PBIs 01–11) is shipped on `main`. PBI 12 only touches `PomodoroCard.tsx` and its colocated test file; no merge contention with any in-flight or future PBI.

## Directive

Apply spec Decision 13 (Amendment 2026-05-08 #5) in a single atomic merge: replace the card root's asymmetric `p-[33px] pb-[32px]` padding pair with the symmetric `p-[24px]` utility.

The change is bounded to **one className string** on a single JSX element. In `src/app/widgets/pomodoro/PomodoroCard.tsx`, the card root `<article>` (currently around line 127, identifiable unambiguously by its `aria-label="Pomodoro timer"` attribute on the next line) carries:

```tsx
<article
  className="flex w-[410.66px] flex-col gap-[32px] rounded-[10px] border border-[#1E2939] bg-[#101828] p-[33px] pb-[32px] font-[var(--font-inter)]"
  aria-label="Pomodoro timer"
>
```

The substring `p-[33px] pb-[32px]` is replaced by the single substring `p-[24px]`. The post-change className reads:

```tsx
<article
  className="flex w-[410.66px] flex-col gap-[32px] rounded-[10px] border border-[#1E2939] bg-[#101828] p-[24px] font-[var(--font-inter)]"
  aria-label="Pomodoro timer"
>
```

Every other utility class on the card root is preserved verbatim — `flex`, `w-[410.66px]`, `flex-col`, `gap-[32px]`, `rounded-[10px]`, `border`, `border-[#1E2939]`, `bg-[#101828]`, and `font-[var(--font-inter)]` all stay in place, in the same order, with the `p-[24px]` utility occupying the slot previously held by the `p-[33px] pb-[32px]` pair. The `aria-label="Pomodoro timer"` attribute is unchanged. The card root remains an `<article>`.

The change is purely a visual literal update and does not touch:

- The card's structural composition (header row, ring container, time display, phase label, settings panel, button row, slider DOM).
- The state machine (`idle | running | paused | resting | completed`).
- The `setInterval` lifecycle, the slider `onChange` handlers (Decision 12 / PBI 11 contract preserved), the play/pause/reset buttons.
- The ring CSS encoding (`--progress`, conic-gradient + radial-gradient mask), the ring foreground colors per phase (Decision 10), the ring track color (Decision 8).
- The phase label `<h2>` (Decision 11), the MM:SS display, the `format-time.ts` helper.
- The settings panel placement, padding, gap, slider accent color, label typography.
- The home route at `src/app/page.tsx`.
- The shell at `src/app/layout.tsx` (the `32px` top padding and `~58.5px` horizontal gutters from `.specs/app-shell/spec.md` Decision 1 are owned by the shell, not the card; they are unaffected by this PBI).

Scope is strictly `PomodoroCard.tsx` and its colocated `PomodoroCard.test.tsx`. Do not introduce new files, shared tokens, `src/lib/` or `src/components/` entries, upward (`../`) imports out of the widget folder, or a `*.module.css` file. The palette `{#030712, #0B1220, #101828, #111827, #1E2939, #1F2937, #155DFC, #3B82F6, #51A2FF, #AD46FF, #99A1AF, #F87171, #34D399, #FFFFFF}` is unchanged by this PBI; no color literal moves.

## Spec pointer

- `.specs/pomodoro/spec.md#blueprint` — Amendment 2026-05-08 #5 paragraph (introduces Decision 13).
- `.specs/pomodoro/spec.md#blueprint` — Decision 13 ("Pomodoro card padding amended to `p-[24px]`") — the binding contract for this PBI; pins the className regex contract `/p-\[24px\]/` MUST match and `/p-\[33px\]/` / `/pb-\[32px\]/` MUST NOT match.
- `.specs/pomodoro/spec.md#blueprint` — Visual Contract → Card bullet, amended 2026-05-08 #5 ("Card frame uses `p-[24px]` (24px on all four sides)") — re-states the literal in the architecture's Visual Contract block.
- `.specs/pomodoro/spec.md#contract` — DoD bullet added 2026-05-08 #5 ("The pomodoro card root applies `p-[24px]` (24px on all four sides) and does NOT apply the prior `p-[33px]` or `pb-[32px]` utilities…") — the machine-checkable acceptance criterion.
- `.specs/pomodoro/spec.md#contract` — Regression Guardrail added 2026-05-08 #5 ("Pomodoro card root has `p-[24px]` (Decision 13)…") — pins the post-#5 contract against future drift.

## Files in scope

- `src/app/widgets/pomodoro/PomodoroCard.tsx`
- `src/app/widgets/pomodoro/PomodoroCard.test.tsx`

## Acceptance (from spec Contract)

- [ ] In `src/app/widgets/pomodoro/PomodoroCard.tsx`, the card root `<article aria-label="Pomodoro timer">`'s `className` includes the utility `p-[24px]`. Verified by `className` regex `/p-\[24px\]/` matching.
- [ ] The card root's `className` does NOT include `p-[33px]` or `pb-[32px]`. Verified by `className` regexes `/p-\[33px\]/` and `/pb-\[32px\]/` both failing to match.
- [ ] `git grep -nE "p-\[33px\]|pb-\[32px\]" src/app/widgets/pomodoro/PomodoroCard.tsx` returns no matches (no stray copy of the deprecated literals anywhere else in the file — comments, strings, or JSX).
- [ ] All other utility classes on the card root are preserved verbatim: `flex`, `w-[410.66px]`, `flex-col`, `gap-[32px]`, `rounded-[10px]`, `border`, `border-[#1E2939]`, `bg-[#101828]`, `font-[var(--font-inter)]`. None of these are added, removed, or reordered by this PBI; only the `p-[33px] pb-[32px]` substring is replaced by `p-[24px]`.
- [ ] The card root remains an `<article>` element with `aria-label="Pomodoro timer"`. The element type and aria-label are not changed by this PBI.
- [ ] In `src/app/widgets/pomodoro/PomodoroCard.test.tsx`, a NEW colocated test asserts the post-change className contract against the rendered DOM. The test renders `<PomodoroCard />`, queries the card root (e.g. `screen.getByLabelText("Pomodoro timer")` or `container.querySelector('[aria-label="Pomodoro timer"]')`), reads its `className` attribute, and asserts:
  - the className contains `p-[24px]` (positive match), AND
  - the className does NOT contain `p-[33px]`, AND
  - the className does NOT contain `pb-[32px]`.
    The test renders the card in its default idle state; no user interactions are required (the padding utility is static and state-independent). A title such as `"card root applies symmetric p-[24px] padding (Decision 13)"` is recommended, but the exact title is at `@Dev`'s discretion under the Refinement rule.
- [ ] All previously shipped tests in `PomodoroCard.test.tsx` continue to pass — the idle render assertions, settings panel toggle, slider boundaries, slider-resets-clock (PBI 11), pause-freezes-progress, reset behavior, phase advance work → rest → work, ring contract per state, ring foreground per phase (Decision 10), phase label inside ring container (Decision 11), accessibility queries, and isolation. The card's structural change is bounded to one className substring on the card root; no other test should observe a behavior change.
- [ ] The existing `src/smoke.test.tsx` continues to pass unchanged.
- [ ] No new file is added under `src/lib/` or `src/components/` by this PBI.
- [ ] No `*.module.css` file is added by this PBI (Regression Guardrail).
- [ ] No new color literal outside the existing palette appears in `src/app/widgets/pomodoro/PomodoroCard.tsx`. Verified by `git grep -nE "#[0-9A-Fa-f]{3,8}" src/app/widgets/pomodoro/PomodoroCard.tsx` and reviewing each match against the palette `{#030712, #0B1220, #101828, #111827, #1E2939, #1F2937, #155DFC, #3B82F6, #51A2FF, #AD46FF, #99A1AF, #F87171, #34D399, #FFFFFF}`.
- [ ] No `localStorage`, `sessionStorage`, cookie, or URL persistence is introduced. Verified by `git grep -nE "localStorage|sessionStorage|document\.cookie" src/app/widgets/pomodoro` returning no matches.
- [ ] `git grep -nE "from ['\"]\\.\\./" src/app/widgets/pomodoro` continues to return no matches.
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run test:run` exit `0`.

## Verification

- Quality gates: `npm run lint && npx tsc --noEmit && npm run test:run`
- Scenarios from `.specs/pomodoro/spec.md` whose contracts are pinned by this PBI:
  - All scenarios that render the card and observe its DOM (e.g. "Idle render of the Pomodoro card", "Settings panel toggles open and closed", "Sliders default to 25 and 5 minutes after reload") continue to hold against the new card root className. The padding change is observable on the card root only; no scenario assertion in any prior PBI references `p-[33px]` or `pb-[32px]` directly, so the regression surface is bounded to the new colocated test introduced by this PBI plus the DoD `git grep` check.
  - The DoD bullet at `.specs/pomodoro/spec.md` line 206 (Added 2026-05-08 #5) and the Regression Guardrail at line 239 (Added 2026-05-08 #5) are the binding contracts; the new colocated test in `PomodoroCard.test.tsx` is the machine-checkable enforcement.
- Regression scenarios that must continue to hold unchanged (sampled, non-exhaustive — see prior PBIs for the full list):
  - "Idle render of the Pomodoro card" — regression; the card mounts, the time display reads `25:00`, the start/reset/Settings buttons are reachable, and the phase label reads `/^work$/i`. None of these depend on the card root's padding.
  - "Settings panel toggles open and closed" — regression; the Settings button still toggles the `aria-label="Timer settings"` region. The card root's reduced padding does not change the panel's own padding (`16px`) or the panel's placement inside the card.
  - "Sliding Work length mid-running resets the clock to idle (Decision 12, 2026-05-08 #4)" — regression from PBI 11; slider movement still resets the card.
  - "Reset returns to the initial work time" — regression.
  - "Pause freezes the displayed time and the ring progress" — regression.
  - "Work interval reaching zero advances to resting (strict alternation)" / "Rest interval reaching zero advances to a fresh work interval" — regression.
  - "Ring at idle renders a flat foreground (no segmentation)" / "Ring foreground color matches the active phase (Decision 10)" / "Ring is rendered without SVG (Decision 9)" — regression from PBIs 08/09.
  - "Phase label appears above the time display (Decision 11)" / "Card no longer carries the 'Work Time' or 'Rest Time' top-of-card heading" — regression from PBI 10.
  - "Settings button has visible hover and focus states (polish)" / "Sliders use the existing accent color (polish)" / "Ring transitions smoothly when state changes (polish)" — regression.
  - "Widget remains isolated" / "No persistence is added" — regression.
  - "Quality gates pass" — regression; `npm run lint && npm run test:run && npm run build` all exit `0`.

## Dependencies

- Requires (transitively): PBIs 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11 — all already shipped on `main`. The card root `<article>` element with the deprecated `p-[33px] pb-[32px]` className must already exist for the substitution to be a one-line change. The slider-resets-clock contract (PBI 11) must already be in place so the new test does not collide with the deprecated mid-interval scenario.
- Requires (in-flight): nothing. The 2026-05-08 #1–#4 amendment waves are fully consumed.
- Blocks: nothing. After PBI 12 lands, the 2026-05-08 #5 amendment is fully consumed and the spec / code agree on the symmetric `p-[24px]` card padding.

## Refinement rule

If reality diverges from the spec while implementing, stop and request `/spec update pomodoro` rather than improvising. In particular:

- Do **not** preserve the deprecated `p-[33px]` or `pb-[32px]` utilities in any form — Decision 13 supersedes them wholesale; the new className must not contain either substring.
- Do **not** express the symmetric padding as `px-[24px] py-[24px]` or `pt-[24px] pr-[24px] pb-[24px] pl-[24px]` or any other functionally equivalent multi-utility composition — Decision 13 pins the single `p-[24px]` utility, and the DoD's regex contract `/p-\[24px\]/` is authored against that specific spelling. If a multi-utility composition seems unavoidable, the divergence is itself a spec gap; halt and request `/spec update pomodoro`.
- Do **not** reorder, remove, or add any other utility class on the card root — the only change is the substring substitution `p-[33px] pb-[32px]` → `p-[24px]`. Reordering classes (e.g. moving `p-[24px]` to the front, alphabetizing) is out of scope; minimal-change is preferred.
- Do **not** change the card root's element type (`<article>`), `aria-label` (`"Pomodoro timer"`), or any other attribute — the binding contract is observable from `className` alone.
- Do **not** change the `gap-[32px]` between the card's inner column rows — Decision 13 explicitly preserves the inner gap; only the **root padding** is amended. The gap is owned by `.specs/app-shell/spec.md` Decision 6 and is out of scope here.
- Do **not** change the shell-level top padding (`32px`) or horizontal gutters (`58.5px`) at `src/app/layout.tsx` — those are owned by `.specs/app-shell/spec.md` Decision 1 and are explicitly NOT changed by Decision 13.
- Do **not** change the settings panel's own padding (`16px`), the slider rows' `gap-[12px]`, or any other padding/gap inside the card — only the card root's padding is in scope.
- Do **not** change the card's width (`w-[410.66px]`), background (`bg-[#101828]`), border (`border-[#1E2939]`), border-radius (`rounded-[10px]`), or font binding (`font-[var(--font-inter)]`) — these are explicitly preserved by Decision 13.
- Do **not** introduce a new file under `src/lib/` or `src/components/` (e.g. extracting the card root className into a shared constant) — the className stays inline on the JSX element.
- Do **not** introduce a `*.module.css` file or move the card root padding into a CSS Module — Tailwind utilities are the only acceptable expression of the padding under this spec's Regression Guardrails.
- Do **not** rewrite or remove any pre-existing test in `PomodoroCard.test.tsx` — this PBI **adds** a new colocated test for the padding contract; no test rewrite is authorized under spec C5 for this amendment. The PBI 11 C5 authorization is consumed; PBI 12 authorizes only **additions**.
- Do **not** assert the padding by reading `getComputedStyle` and checking `padding: "24px"` — Tailwind utilities do not necessarily resolve to inline computed style in jsdom under Vitest, and the binding contract is the `className` substring per Decision 13's "observable from the rendered card root's `className`" clause. The new test asserts on `className` directly.
