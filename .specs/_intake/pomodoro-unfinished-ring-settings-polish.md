# Topic: Pomodoro widget — ring not working, no length editing, look-and-feel polish

## Learner Decisions (resolving /challenge objections)

These quoted decisions are the authoritative learner intent and supersede the corresponding earlier Open Questions. Recorded verbatim per `AGENTS.md` → "Requirements in a practice platform".

- **Rest semantics — resolves objection #2 (formerly Open Question 2).**

  > "Rest" means Pomodoro's pause between work intervals — i.e., a real `resting` state. Use **strict alternation** (work → rest → work → rest …) for now; no long-break-every-4.

- **Polish license — resolves objection #3 (formerly Open Question 5).**

  > Learner has explicitly authorized Claude to "act as designer and improve upon the styles already in the codebase for a presentable end product."
  > This converts P5 from unactionable to actionable: the learner's stated intent IS the source of authority for visual choices, anchored to current Figma-pinned literals (`spec.md:30-58`) as the baseline.

- **Persistence — resolves objection #5 (formerly Open Question 4).**

  > Session-only (`useState`). No `localStorage`. Settings reset on reload.

- **Settings UI shape — resolves objection #6 (formerly Open Question 3).**

  > Add a "Settings" button that opens a **collapsible panel** containing **two sliders** controlling period lengths (one for work, one for rest). No Figma frame; learner has accepted a designer-free shape under the polish license.

- **Scope / bundling — resolves objection #1 (formerly Open Question 6).**

  > Bundle all three concerns (ring drain, editable lengths with real rest cycle, polish) into a **single spec for the `pomodoro` domain**. They all live inside `src/app/widgets/pomodoro/` so the `rm -rf` invariant is unaffected. `/plan` will decompose into atomic PBIs.

- **Critic note #4 — C1 + C6 double-count.** Merge C6 into C1 as historical context. One candidate problem for the ring-drain fix, not two.
- **Critic note #7 — C7 speculative.** Drop C7 (`completed`-state UX) — no learner signal.
- **Critic note #8 — test maintenance.** Promote the `PomodoroCard.test.tsx:167-190` cross-state ring-invariance test maintenance from observation (P6) to an explicit candidate-problem bullet so the eventual spec authorizes the test rewrite up front.

## Sources

- **Learner signal (raw, this run, 2026-05-08)** — quoted verbatim:
  > "The pomodoro component is unfinished. The Indicator circle is not working and it lacks support for editing work and rest period lengths. The overall lok and feel needs polishing too."
- `src/app/widgets/pomodoro/PomodoroCard.tsx` — current widget implementation (client component, 167 lines).
- `src/app/widgets/pomodoro/page.tsx` — server route mount (5 lines).
- `src/app/widgets/pomodoro/format-time.ts` — `formatMmSs` helper.
- `src/app/widgets/pomodoro/PomodoroCard.test.tsx` — current test coverage (191 lines).
- `.specs/pomodoro/spec.md` — pinned blueprint, decisions, DoD, scenarios.
- `.specs/pomodoro/pbi/03-dashed-ring.md` — PBI that landed the static four-segment ring.
- `git log --oneline -- src/app/widgets/pomodoro`:
  - `b459920 feat(pomodoro): four-segment dashed ring (PBI 03-dashed-ring)` (most recent code change to the widget)
  - `aca0bf8 feat(app-shell): lift chrome to layout.tsx and amend pomodoro spec`
  - `a256a19 feat(pomodoro): add Pomodoro widget at /widgets/pomodoro`
- `AGENTS.md` → "Requirements in a practice platform" — learner intent is the legitimate source of requirements.

## Patterns

### P1 — "Indicator circle is not working": ring is fully static across all states (observation)

`PomodoroCard.tsx:79-110` renders two `<circle>` elements wrapped in a single SVG. The foreground circle uses a hard-coded `strokeDasharray="120.637 60.319"` and a fixed `transform="rotate(-90 172.332 128)"`. There is no reference to `secondsRemaining`, `state`, `progress`, or any computed `strokeDashoffset` in the SVG block:

```
src/app/widgets/pomodoro/PomodoroCard.tsx:95-105
<circle
  cx="172.332" cy="128" r="115.2"
  stroke="#3B82F6" strokeWidth="10.24" fill="none"
  strokeLinecap="round"
  strokeDasharray="120.637 60.319"
  transform="rotate(-90 172.332 128)"
/>
```

`PomodoroCard.test.tsx:167-190` includes an explicit assertion titled "ring pattern is invariant across timer states" that pins the dasharray/dashoffset/transform to the same values regardless of state. So the static behavior is intentional under PBI 03 (`feat(pomodoro): four-segment dashed ring`, `b459920`).

### P2 — Spec and code disagree on running-state ring behavior (observation, contradiction)

`.specs/pomodoro/spec.md:16` (Decision 4, dated 2026-05-06) explicitly **lifts** the deferral and pins running/paused-state behavior to **Option A — continuous drain**:

> "in `running` and `paused` states the foreground `<circle>` switches to a single-arc dasharray whose visible length encodes `secondsRemaining / 1500`."

`spec.md:42-48` and the DoD bullet at `spec.md:86` then specify `stroke-dasharray="C C"` with `C ≈ 723.823` and `stroke-dashoffset = C · (1 − secondsRemaining / 1500)`, and Gherkin scenarios "Ring switches to single-arc dasharray on start (Option A)", "Ring drains as time elapses (Option A)", "Ring freezes its progress when paused (Option A)", and "Ring returns to four-segment idle pattern on reset" (`spec.md:210-235`) describe the dynamic behavior.

PBI 03 (`pbi/03-dashed-ring.md:13`) on the other hand says:

> "The ring is **static** in every timer state. … Drop the existing `RING_CIRCUMFERENCE`/`dashOffset` machinery"

— and that PBI is the one that actually shipped (`b459920`). The spec's parenthetical at `spec.md:54` flags this:

> "PBI 03's same-day removal of the `RING_CIRCUMFERENCE`/`dashOffset` machinery is partially reverted by the next PBI to follow this amendment."

No follow-up PBI has been authored or shipped. The spec describes a behavior that the code does not exhibit (hypothesis: the learner's "indicator circle is not working" maps to this gap — the ring looks the same whether the timer is running or not).

### P3 — No editing affordance for work or rest period length (observation)

`PomodoroCard.tsx:6` hard-codes `const INITIAL_SECONDS = 1500;` and there is no UI surface, prop, state, or persistence for changing it. There is also no concept of a "rest period" anywhere in the file — the state machine `"idle" | "running" | "paused" | "completed"` (line 8) has no break/rest state; reset always returns to the same `INITIAL_SECONDS` (line 47). The spec confirms this: `spec.md:60` lists only those four states, and the only timing literal mentioned anywhere in the spec is `1500` seconds (work).

The card renders a settings gear icon at `PomodoroCard.tsx:59-76`, but per Decision 3 (`spec.md:15`) it is **deliberately decorative**: `aria-hidden="true"`, no click handler, not a `<button>`. The corresponding test at `PomodoroCard.test.tsx:45-48` enforces the no-op contract. So there is a visual placeholder where settings would live but no behavior behind it.

### P4 — "Rest period" is a brand-new concept relative to the existing spec (observation)

`grep`-equivalent inspection of `spec.md` and the three PBI files surfaces no occurrence of "rest", "break", "short break", "long break", or any second timer length. The Pomodoro Technique canonically alternates work and rest intervals, but this widget as specified is a single-interval work timer. Per the learner decision above, "rest" now means a real `resting` state with strict alternation (work → rest → work → rest …); this implies a richer state machine and likely a cycle-edge transition on `00:00`.

### P5 — "Look and feel needs polishing" — designer license granted (observation + learner authorization)

The signal asserts polish is needed but cited no specific element, screenshot, or Figma node. Current visual contract literals (`spec.md:30-58`) are precise and were re-verified live against Figma node `1:3` / `1:11` / `1:20` on 2026-05-06 (`spec.md:52`). Per the learner decision above, Claude is authorized to "act as designer and improve upon the styles already in the codebase for a presentable end product," anchored to those pinned literals as the baseline. The polish work is now actionable; concrete deltas will be enumerated by `@Lead` at `/spec` rather than blocked at `/challenge`.

### P6 — Test suite already pins the static-ring contract (observation, promoted to candidate problem)

`PomodoroCard.test.tsx:122-190` exercises the four-segment static ring including the cross-state invariance assertion at `:167-190`. Moving to a draining ring **and** introducing a `resting` state will require these tests to be rewritten — the invariance test will fail by design. Promoted to a candidate problem (C5) so the bundled spec authorizes the test rewrite up front rather than treating it as incidental churn.

### P7 — Settings gear UI is no longer the chosen anchor (observation)

The decorative gear at `PomodoroCard.tsx:59-76` exists at the card's top-right. Per the learner's settings-UI decision above, the chosen affordance is a "Settings" button opening a collapsible panel with two sliders (work, rest). Whether that button replaces, repurposes, or sits alongside the gear is a `/spec` decision, not an intake decision.

### P8 — Typo in the signal: "lok and feel" (observation, low-signal)

The learner wrote "lok and feel" (presumably "look and feel"). Recorded for completeness; no semantic content beyond P5.

## Open Questions

1. **Ring behavior — bug, regression, or new direction?** Does the learner mean (a) the spec's already-pinned Option A drain (`spec.md:16`, `spec.md:42-48`) was never implemented and they want it implemented, or (b) they have a different visualization in mind (e.g. segments lighting up sequentially, or the four arcs shrinking individually)? The signal "the indicator circle is not working" is consistent with (a) but does not exclude (b). _(Still open — `@Lead` to confirm at `/spec`.)_

## Candidate Problems

This list is the basis for **one bundled spec** in the `pomodoro` domain. `/plan` will decompose it into atomic PBIs.

- **C1. Ring does not visualize timer progress** — the foreground `<circle>`'s dasharray and transform are constant across `idle | running | paused | completed`, in contradiction with `spec.md` Decision 4 and the Option A scenarios at `spec.md:210-235`. Spec says drain; code says static. Resolves the literal "indicator circle is not working" complaint.
  _Historical context (formerly C6):_ the spec's same-day amendment (Decision 4) was never followed by the implementing PBI it announced (`spec.md:54` parenthetical: "PBI 03's same-day removal of the `RING_CIRCUMFERENCE`/`dashOffset` machinery is partially reverted by the next PBI to follow this amendment"). The bundled spec closes this audit gap by being that follow-up.

- **C2. Editable work + rest lengths driving a real strict-alternation rest cycle** — `PomodoroCard.tsx:6` hard-codes `INITIAL_SECONDS = 1500`; the state machine (`PomodoroCard.tsx:8`) has no `resting` state; the spec contains no "rest" / "break" concept. Per learner decision, introduce (a) editable work and rest period lengths, (b) a real `resting` state, (c) strict alternation work → rest → work → rest … (no long-break-every-4), and (d) session-only persistence via `useState` (no `localStorage`; values reset on reload).

- **C3. Settings affordance — button + collapsible panel + two sliders** — today the gear at `PomodoroCard.tsx:59-76` is `aria-hidden` and decorative (Decision 3, `spec.md:15`). Per learner decision, add a "Settings" button that opens a collapsible panel containing two sliders (one for work length, one for rest length) controlling C2's editable values. No Figma frame; shape accepted under the polish license.

- **C4. Presentable polish under designer license** — per learner decision, Claude is authorized to "act as designer and improve upon the styles already in the codebase for a presentable end product." Baseline is the current Figma-pinned literals at `spec.md:30-58`; specific deltas (typography, spacing, micro-interactions, transitions, ring tween, slider styling, panel chrome) will be enumerated by `@Lead` at `/spec`.

- **C5. Test rewrite authorization for ring + state-machine changes** — `PomodoroCard.test.tsx:122-190` (especially the cross-state ring-invariance assertion at `:167-190`) and the gear no-op assertion at `PomodoroCard.test.tsx:45-48` pin the current static-ring + decorative-gear contracts. Both will fail by design once C1, C2, and C3 land. The bundled spec must explicitly authorize rewriting these tests so the change is not mistaken for a regression at `/review`.
