# Retro — `pomodoro` domain (Agent Optimization Loop)

Distilled 2026-05-08 from the trail at `.specs/_intake/pomodoro-unfinished-ring-settings-polish.md`, `.specs/pomodoro/spec.md`, `.specs/pomodoro/pbi/01..13`, and `git log` on branch `feat/pomodoro-padding-hydration` (PR #8). No prior retro existed for this domain.

## Pipeline summary

- **Span.** Two pipeline runs against this domain. Run 1 (2026-05-06): widget bootstrap (PBIs 01–03). Run 2 (2026-05-08): six amendment waves (#1–#6), 10 PBIs (04–13).
- **Intake.** `.specs/_intake/pomodoro-unfinished-ring-settings-polish.md` (129 lines) — single Run-2 intake; 8 patterns (P1–P8), 1 Open Question, 5 Candidate Problems (C1–C5). Resolved 8 `/challenge` objections via 5 quoted learner decisions.
- **Spec.** `.specs/pomodoro/spec.md` grew to **567 lines** with 13 numbered Decisions, 6 dated amendments on a single calendar day (2026-05-08 #1 through #6 — see `spec.md:9-19`), and large preserved-for-audit deprecated blocks (e.g. `spec.md:81-114`, the entire SVG ring construct retained as audit text).
- **PBIs.** 13 total. Build order on 2026-05-08: `04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13`. PBI 02 (app-shell) merged into the same commit as PBI 12 — see Friction #2.
- **`/build` iteration counts.** Every PBI 04–13 landed in **1 iteration** (no Ralph Loop retries — confirmed by the orchestrator's transcript). The 10-iteration cap was never approached on this domain.
- **`/review` verdicts.** Every PBI shipped on first review (no `/build` re-skill events recorded in the transcript).
- **Commits.** 17 commits on this branch touching `.specs/pomodoro/` or `src/app/widgets/pomodoro/`. Two of them are catch-up commits that violate the Constitution's same-commit rule — see Friction #1.

## Kept (what worked, worth preserving)

- **Quoted-decision intake format.** The intake's "Learner Decisions (resolving /challenge objections)" block at `_intake/...md:3-30` quoted the learner verbatim against numbered `/challenge` objections. That format collapsed eight separate objection-and-resolution exchanges into a single artifact and let `/spec` read intent without re-prompting. Worth preserving as the canonical resolution shape — see Amendment 3.
- **Deprecation-marker discipline on amendments.** Every superseded clause carries a `[DEPRECATED YYYY-MM-DD #N — superseded by Decision M]` marker (e.g. `spec.md:26`, `:27`, `:30`, `:31`, `:32`, `:55`, `:56`, `:81-114`, `:124`, `:238`). Audit trail held up across six same-day amendments and three cross-decision supersedes (Decision 4 → 9, Decision 6 final clause → 12, Decision 8 foreground → 10). The Critic's "is this a regression?" check has unambiguous evidence to read against.
- **Atomic PBI sequencing within waves.** Each amendment wave decomposed into PBIs that each touched only `PomodoroCard.tsx` + `PomodoroCard.test.tsx` (`pbi/09:69-70`, `pbi/10:60-61`, `pbi/11:71-72`, `pbi/12:51-52`, `pbi/13:50-51`). No merge contention within a wave; the sequenced ordering (`09 → 10`, `10 → 11`, etc.) avoided contention across waves at the same file pair.
- **Single-iteration `/build` performance.** Ten consecutive PBIs landed first-iteration. The PBI-template Refinement-rule clause ("If reality diverges from the spec while implementing, stop and request `/spec update <domain>` rather than improvising") plus the explicit "Do not …" enumeration in the high-risk PBIs (e.g. `pbi/09:126-128`, `pbi/11:130-141`, `pbi/13:101-112`) appear to be doing real work — the Builder doesn't have to negotiate scope mid-run.
- **C5 test-rewrite authorization pattern.** Repeatedly used to grant the Builder explicit permission to delete or rewrite tests pinning a now-deprecated contract (`spec.md:215-217`, echoed in `pbi/09:27-50`, `pbi/11:38-51`). Without this, the Builder's only options would be to leave both tests in (impossible, they assert opposites) or appear to regress (Critic would flag at `/review`). Worth preserving.
- **PBI 13 retroactively codified the hydration class of bug.** Three new Gherkin scenarios (`spec.md:549-566`) and three Regression Guardrails (`spec.md:245`) lock in the two specific patterns (`--progress` numeric inline-style, `font-[var(--font-…)]` shorthand) at the pomodoro-spec level. Future Builders on this widget cannot regress on the same shape without `/review` flagging it.

## Friction (named patterns with evidence)

### F1. Spec/PBI files chronically uncommitted alongside code (Constitution §27 violation)

The Constitution's Same-commit rule (`.specs/CONSTITUTION.md:27`) reads: _"When code reveals a spec is wrong, the spec update ships in the same commit as the code change."_ This rule was violated in two batches on this branch:

- **Batch 1 — commit `448324a "update pomodoro widget ui"`** (2026-05-08 13:32). Stat: 10 files changed, 1158 insertions, 78 deletions. The single commit landed all of: the intake (129 lines), spec amendments adding Decisions 6–11 (~457 lines net), and PBIs 04, 05, 06, 07, 08, 09, 10, 11. The corresponding code commits `9615899` (PBI 04), `850f200` (PBI 05), `daa27ae` (PBI 06), `762cc44` (PBI 07), `09c2af4` (PBI 08), `b65f93b` (PBI 09), `1d7ac39` (PBI 10), and `fa3475b` (PBI 11) had already shipped — all without their accompanying spec/PBI files. Eight successive PBIs, all violating §27.
- **Batch 2 — commit `6e18f6a "docs(specs): land app-shell + pomodoro padding amendments and PBIs 02/12"`** (2026-05-08, between PBI 12 and PBI 13). Cleanup commit for the app-shell spec, the 2026-05-08 #5 amendment, and PBIs 02 and 12. Title is honest about the catch-up nature; the underlying violation is the same pattern as Batch 1.

The orchestrator surfaced this gap at every pre-`/ship` boundary (per the transcript), but the violation kept recurring because the offending step was inside `/build` — the Builder shipped code without its spec/PBI dependencies in the same commit. This is a recurring failure of an existing rule (Constitution §27), not a missing one. The persona that needs the reminder is `@Dev` (the agent doing the staging), and the gate that should catch it is `/ship`'s preflight, not `/review` (which reads the diff but does not own the staging discipline).

### F2. Parallel `/build` collision in commit `db1f8b3`

Two `/build` invocations were dispatched in parallel against different domains — `app-shell` (PBI 02) and `pomodoro` (PBI 12). Both Dev subagents wrote into the same git working tree. The resulting commit `db1f8b3 "feat(pomodoro): card padding 24px on all sides (PBI 12-card-padding)"` (verified via `git show --stat db1f8b3`):

```
 AGENTS.md                                      |  2 +-
 src/app/layout.tsx                             |  2 +-
 src/app/widgets/pomodoro/PomodoroCard.test.tsx | 12 ++++++++++++
 src/app/widgets/pomodoro/PomodoroCard.tsx      |  2 +-
```

`AGENTS.md` and `src/app/layout.tsx` are app-shell territory (`AGENTS.md:47` and the shell-owned chrome at `src/app/layout.tsx`). They have no business in a PBI-12 commit whose declared scope is `PomodoroCard.tsx` + `PomodoroCard.test.tsx` (`pbi/12:51-52`). The PBI-02 dev session halted before reporting PASS because its commit was now mislabeled and bundled.

The Constitution forbids cross-widget _imports_ (`CONSTITUTION.md:9`) but says nothing about cross-domain _staging_. `discover.md:98` does pin "One PBI at a time. No parallel `/build`. PBIs are isolated by design but the working tree is not." — but `discover.md` only governs the `/discover` orchestrator. `triage.md` and ad-hoc parallel `/build` invocations from the main thread inherit no such guardrail. This is a real harness gap, not a per-pipeline anomaly.

### F3. Six same-day spec amendments — churn rate exceeded plan-phase amortization

Six amendments to `spec.md` in a single day (`spec.md:9-19`, headers "Amendment 2026-05-08", "#2", "#3", "#4", "#5", "#6"). Decisions 4 and 7 were partially superseded by Decision 9 (`spec.md:31`, `:33`); Decision 6's final clause was inverted by Decision 12 (`spec.md:30`, `:36`); Decision 8's foreground-color clause was superseded by Decision 10 (`spec.md:32`, `:34`). The spec is now 567 lines — roughly half of which is preserved-for-audit deprecated text (e.g. the entire SVG ring construct at `spec.md:81-114`, the deprecated 2026-05-06 amendment block at `spec.md:106-110`, the four-segment idle dasharray dropped at `spec.md:238`).

The deprecation-marker discipline (Kept #2) means the audit trail holds up. The cost is that `@Dev`, `@Critic`, and any future `/triage` reading this spec must mentally page-fault through ~280 lines of historically-true-but-currently-dead text to find the binding contract. PBI 09 (the CSS rewrite) consumed ~128 lines (`pbi/09:1-128`) partly because it had to re-state which historical paragraphs survive ("the BEHAVIOR survives unchanged … the ENCODING moves" — `spec.md:28`, `pbi/09:11`).

This is not a bug; it's the documented cost of "living spec + same-commit rule + many small amendments". But there is no current convention that says "after the third amendment to a spec on a single day, fold the deprecated blocks into a `## Audit history` appendix." The spec template (referenced at `.claude/commands/spec.md:21` as `.specs/TEMPLATE.md`) has no such guidance.

### F4. Globals.css cascade-layer bug invisible to existing gates

User-collected note: a `*` reset in `globals.css` outside any `@layer` silently overrode every Tailwind utility class, causing the user's "Add 48px padding" / "Add 24px padding" requests to _appear_ not to work — the spec/code looked correct but the rendered output was wrong. There is no record of this bug in the spec or PBIs, because the gates that would have caught it (`lint`, `tsc`, `test:run`) all passed. Tests that asserted className substring presence (`pbi/12:62-66`, `pbi/13:55-60`) were green; the rendered effect was not what the className declared.

This connects to F6 below.

### F5. Hydration mismatch escaped `/build` and `/review`

User-collected note, codified by Amendment 2026-05-08 #6 (`spec.md:19`) and PBI 13 (`pbi/13`). The two root causes both touched the React/Tailwind boundary:

1. `--progress` inline-style serialized as a JavaScript `number` rather than a `string`. React's server-renderer and client-renderer disagreed on the serialization in some Node versions (`pbi/13:11`).
2. Tailwind v4's `font-[var(--font-…)]` shorthand on a CSS variable is ambiguous between the `font-family` and `font-weight` utility namespaces under the PostCSS pipeline, producing inconsistent class output between server and client (`pbi/13:12`).

Both passed `npm run lint`, `npx tsc --noEmit`, and `npm run test:run` because no pre-existing assertion observed `console.error` and the existing className regex tests used the deprecated form. The bug only surfaced after the user restarted a stale `npm run dev` process — which is itself a signal that the `/build` gate's notion of "passes tests" doesn't include "the dev server actually renders the same HTML on both sides of hydration."

PBI 13 closed the gap _for this widget_ — `spec.md:245` is now a Regression Guardrail at the pomodoro-spec level. The question for `/retro` is whether the broader risk class warrants a Constitution-level guardrail. I think it does — see Amendment 1.

### F6. Tests assert className strings, not rendered effects

Across PBIs 09 (`pbi/09:84-91`), 12 (`pbi/12:62-66`), and 13 (`pbi/13:60`), the test surface checks Tailwind utility class _presence_ on the rendered className rather than the actual computed style. Examples:

- `pbi/12:65`: `the className contains p-[24px]` (positive substring match), not `getComputedStyle(card).padding === "24px"`.
- `pbi/13:60`: `assert no element's className contains the substring font-[var(--font-`, with an explicit instruction at `pbi/13:109`: _"Do not assert the font-family contract by reading getComputedStyle — Tailwind utilities do not necessarily resolve to inline computed style in jsdom under Vitest."_

The trade-off is real: jsdom does not fully resolve Tailwind's utility classes to computed style, so a `getComputedStyle` assertion would be brittle. But the consequence is that **the test surface cannot detect F4 (the globals.css cascade-layer override) or F5's class-form drift**. Both bugs presented as "the className says one thing, the rendered output says another." A green test suite is consistent with a broken render.

This is a known cost of the framework choice (Tailwind + jsdom + Testing Library), not a per-PBI defect. But it reframes the Constitution's `/build` gate: passing `npm run test:run` is necessary, not sufficient, for "the widget renders correctly." Worth surfacing in `AGENTS.md` so future Builders and Critics know the limit.

### F7. PBI 09 was a large bundled change that the "atomic" guideline implies should have been smaller

PBI 09 ("rewrite ring as pure CSS with phase colors") shipped two coupled changes in one merge: the encoding swap (SVG → CSS) AND the phase-dependent foreground color (single `#3B82F6` → `{#F87171, #34D399, #3B82F6}`). The PBI's Directive at `pbi/09:8-11` argues the bundling explicitly: _"The two changes ship together because they are tightly coupled at the encoding layer: the new CSS construct names the foreground color directly inside the same property the rewrite introduces. Splitting them would force an intermediate state where the new CSS ring renders #3B82F6 in running/resting — that intermediate state already violates Decision 10 against the just-amended spec, so it is not a coherent landing point."_

This is the right call for this run. But it's a **recurring pattern**: when a same-day spec amendment rewrites the implementation contract, the corresponding PBI tends to be larger than one would author in a green-field plan, because the intermediate atomic states are no longer coherent against the just-amended spec. The plan-phase Critic has no current rubric for "the bundling is justified by an amendment that just inverted the contract" vs. "the bundling is unjustified scope creep." `@Lead`'s `/plan` decomposition rule (`.claude/agents/lead.md:17`) says PBIs must be _atomic, isolated, self-testable_ — but is silent on the case where atomicity at the PBI level forces incoherence at the spec level. Worth surfacing as a Lead guideline, not a Constitution rule.

### F8. "Defaults bundle" pattern worked well but is undocumented

The intake at `_intake/...md:3-30` records 5 quoted decisions resolving 8 `/challenge` objections — the user accepted a "defaults bundle" the Analyst proposed verbatim rather than answering each open question individually. This pattern is referenced indirectly in the intake (the intake says "Critic note #4 — C1 + C6 double-count. Merge C6 into C1 as historical context" — `_intake/...md:28`) but is not documented anywhere in the persona or command files. Future runs would benefit from the Analyst persona explicitly offering a defaults bundle when a `/challenge` returns ≥3 open questions, rather than re-asking each one. Worth codifying in the Analyst persona.

## Proposed amendments (diffs only — not applied)

Each amendment below is a concrete diff against a real file. I am proposing the **smallest** set that addresses recurring violations of existing rules (F1, F2) or platform-level decisions revealed by this run (F4–F6, F8). Per-pipeline anomalies (F3, F7) are documented above as narrative; they do not warrant new ALWAYS/NEVER rules.

### Amendment 1 — Constitution: hydration safety as an architectural invariant

Target: `.specs/CONSTITUTION.md`
Rationale: F5. Hydration mismatch is a recurring class of bug for client components under Next.js 16 + Tailwind v4 + React 19. PBI 13 closed it for the pomodoro widget; without a Constitution-level rule, every future widget with a client component re-runs the same trap. This is a "platform-level architectural decision changed" case (`CONSTITUTION.md:31`), not speculative.

Diff:

```diff
@@ .specs/CONSTITUTION.md @@
 ## NEVER

 - **Cross-widget imports.** ...
 - **Shared mutable state across widgets.** ...
 - **Widget-specific code in `src/lib/`.** ...
 - **Layered directories at the repo root.** ...
 - **A `pages/` directory.** App Router only.
 - **Hand-written `useMemo`/`useCallback`** for memoization the React Compiler already handles ...
 - **`<link rel="stylesheet">` for fonts.** Use `next/font/google`.
 - **Bypassing quality gates.** ...
 - **DRY across widgets.** ...
+- **Hydration-unsafe patterns in client components.** Two specific shapes are forbidden because they ship a class mismatch between server and client renders that `lint` / `tsc` / `test:run` do not catch: (a) assigning a JavaScript `number` (not `string`) to a CSS custom property at the React-style boundary, e.g. `style={{ "--x": 0.5 }}` — coerce with `String(...)` instead; (b) Tailwind v4's `font-[var(--font-…)]` shorthand on a CSS variable — use the unambiguous arbitrary-property form `[font-family:var(--font-…)]`. Codified after pomodoro Amendment 2026-05-08 #6 (`.specs/pomodoro/spec.md:19`, `.specs/pomodoro/pbi/13-hydration-guardrail.md`).
+- **Suppressing hydration warnings to dodge the contract.** `suppressHydrationWarning`, wrapping a component in `<ClientOnly>` / `dynamic(..., { ssr: false })`, or `useEffect`-gated mounts to opt out of SSR are not acceptable fixes for a hydration mismatch. The contract is that the component renders identically on server and client. Same incident reference as the rule above.
```

### Amendment 2 — Constitution: same-commit rule needs a `/ship` preflight, not just a written rule

Target: `.specs/CONSTITUTION.md` (clarifying note) AND `.claude/commands/ship.md` (executable check)
Rationale: F1. Constitution §27 (`CONSTITUTION.md:27`) is a written rule that was violated 8 successive times in commits `9615899`, `850f200`, `daa27ae`, `762cc44`, `09c2af4`, `b65f93b`, `1d7ac39`, `fa3475b` (all PBIs 04–11), then again at PBIs 02 and 12 in commit `db1f8b3` requiring catch-up commit `6e18f6a`. A rule that fails this often needs a deterministic check, not stronger wording. The right home for the check is `/ship`'s preflight (`ship.md:19-32`), where the existing diff-scope check already runs.

Diff:

```diff
@@ .claude/commands/ship.md @@
 ### 2. Run deterministic preflight (Constitutional checks against the diff)

 Compute the diff against `main`: `git diff --name-only main...HEAD`. Then run each check below and record green / red.

 - **Diff scope** — every changed path falls under one of:
   - `src/app/widgets/<name>/**` (the widget being shipped)
   - `.specs/<domain>/**` (its spec/PBI)
   - Conditionally allowed (call out, do not fail): `src/app/layout.tsx`, `src/app/page.tsx`, `src/lib/**` — these change the platform itself and warrant a sentence of justification in the PR body.
   - Anything else → red.
 - **Cross-widget imports** ...
 - **`src/lib/` growth** ...
 - **No layered-directory introduction** ...
 - **No gate-bypass markers in diff** ...
+- **Same-commit-rule check (Constitution §27).** For each commit on the branch since `main`, if the commit touches `src/app/widgets/<name>/` for any widget `<name>` whose `.specs/<name>/spec.md` was modified on the same branch but in a *different* commit, mark red and surface the offending pair `(<code-commit-sha>, <spec-commit-sha>)`. Concretely: `git log --format="%H" main..HEAD` × `git show --name-only <sha>`; look for cases where a code path under `src/app/widgets/<name>/` and the matching `.specs/<name>/spec.md` are split across commits. Catch-up commits like `448324a` and `6e18f6a` on the pomodoro pipeline (2026-05-08) would have been blocked at `/ship` by this check.
```

(I am intentionally proposing this as a `ship.md` preflight check, not a Constitution amendment, because the rule itself is already in the Constitution at `:27` — what's missing is the executable gate.)

### Amendment 3 — Analyst persona: codify the "defaults bundle" pattern at `/challenge`-objection resolution

Target: `.claude/agents/analyst.md`
Rationale: F8. The pomodoro intake's "Learner Decisions (resolving /challenge objections)" block at `_intake/pomodoro-...md:3-30` collapsed 8 objections into 5 quoted decisions in one round-trip. This worked well and is currently undocumented. Codifying it in the Analyst persona means future runs default to a defaults-bundle proposal rather than serial round-trips with the user.

Diff:

```diff
@@ .claude/agents/analyst.md @@
 **Guidelines for `/discover` and `/triage` (signal → intake / routing).**

 - Cluster raw input into named patterns; cite the source line/file for each pattern.
 - Separate observation from interpretation. Interpretations are tagged `(hypothesis)`.
 - Output goes to `.specs/_intake/<topic>.md` (Discover) or as an update draft to an existing `.specs/<domain>/spec.md` Context section (Triage). For Triage, do **not** apply spec edits yourself — produce a diff or new file content for `@Lead` to action.
 - Surface contradictions in the input rather than smoothing them over.
+- **Defaults bundle on objection resolution.** When `/challenge` returns three or more objections that each surface a learner-decidable open question (scope, persistence model, UI shape, semantics), do not round-trip the user one question at a time. Propose a concrete *defaults bundle* — a single block where each objection has a recommended resolution the user can accept verbatim or amend. Quote the user's signal as anchor (`AGENTS.md` → "Requirements in a practice platform"); do not invent intent the user did not express. Format the bundle as a "Learner Decisions (resolving /challenge objections)" subsection in the intake, with each decision tagged to the objection number it resolves. See `.specs/_intake/pomodoro-unfinished-ring-settings-polish.md` (2026-05-08) for the canonical shape.
 - **Figma URLs:** ...
```

### Amendment 4 — AGENTS.md: surface the "tests assert className, not computed style" trade-off

Target: `AGENTS.md`
Rationale: F4 + F6. The `globals.css` cascade-layer bug and the className-vs-computed-style trade-off are both "passes gates, renders wrong" classes of bug. Currently `AGENTS.md:80` says only _"Tests colocated as `_.test.ts(x)`next to the code (template:`src/smoke.test.tsx`). Use Testing Library queries."* — silent on the limit. A future Builder asserting on `className` substring may believe their test pins the rendered effect when it does not.

Diff:

```diff
@@ AGENTS.md @@
 ## Conventions (judgment, not toolchain)

 - **Server components by default.** Add `"use client"` only when the component needs interactivity, browser APIs, or React state/effects.
 - **Tests colocated** as `*.test.ts(x)` next to the code (template: `src/smoke.test.tsx`). Use Testing Library queries.
 - **CSS Modules only for genuinely scoped, non-utility cases** (see `page.module.css`). Tailwind is the default.
 - **Fonts via `next/font/google`** — never `<link rel="stylesheet">`.
 - **No `--no-verify`, no `// @ts-ignore`, no skipped tests** to make a gate pass (factory rule).
+- **Tests assert what they can observe under jsdom.** Tailwind utilities do not fully resolve to computed style under jsdom + Vitest, so most widget tests assert on `className` substring presence (e.g. `expect(card.className).toMatch(/p-\[24px\]/)`) rather than `getComputedStyle(card).padding === "24px"`. This is a known limit of the framework choice, not a defect. Two consequences: (a) a regression in `globals.css` (e.g. an unlayered universal-selector reset overriding utility classes) is invisible to `npm run test:run` even though the rendered output is wrong; (b) hydration drift between Tailwind class shapes (e.g. `font-[var(--font-…)]` vs. `[font-family:var(--font-…)]`) can pass the className regex on both sides while emitting a `console.error` in the browser. Counter-measures: at minimum, install a `console.error` spy on any Vitest scenario that mounts a client component, and avoid universal-selector resets in `globals.css` that sit outside an `@layer`. Pomodoro Amendment 2026-05-08 #6 (`.specs/pomodoro/spec.md:19`, `.specs/pomodoro/pbi/13-hydration-guardrail.md`) is the canonical worked example.
```

### Amendment 5 — `/discover` and `/triage`: forbid parallel `/build` against a shared working tree

Target: `.claude/commands/triage.md` (mirror the `discover.md:98` rule that already exists)
Rationale: F2. Commit `db1f8b3` bundled an app-shell PBI 02 commit and a pomodoro PBI 12 commit because two `dev` subagents wrote into the same working tree concurrently. `discover.md:98` already says _"One PBI at a time. No parallel `/build`. PBIs are isolated by design but the working tree is not."_ — but `triage.md` does not, and parallel `/build` invocations from the main thread (e.g. when a user manually dispatches two `/build` calls in one session) inherit no such rule. Closing the gap is a one-line copy.

Diff:

```diff
@@ .claude/commands/triage.md @@
 ## Boundaries

 - Do **not** edit specs, write code, or change PBIs yourself.
 - Do **not** auto-invoke `/ship`. Always human-gated.
 - On any unexpected verdict format, stop and surface the raw output.
+- One PBI at a time. No parallel `/build`, even across domains. PBIs are isolated by design but the working tree is not — concurrent dev sessions stage into the same tree and produce bundled, mislabeled commits (see pomodoro retro 2026-05-08 → commit `db1f8b3`, which mixed app-shell PBI 02 staging with pomodoro PBI 12 staging).
```

(I considered proposing a Constitution amendment for this, but the failure mode — two Dev agents racing at the working tree — is harness behavior, not architecture. The right home is the orchestrator command files. `discover.md` already has the rule; `triage.md` should mirror it.)

---

**Total amendments proposed:** 5. **By target:** `.specs/CONSTITUTION.md` × 1 (Amendment 1), `.claude/commands/ship.md` × 1 (Amendment 2), `.claude/agents/analyst.md` × 1 (Amendment 3), `AGENTS.md` × 1 (Amendment 4), `.claude/commands/triage.md` × 1 (Amendment 5).

None of the amendments above have been applied. The learner reviews this retro and applies the diffs they agree with in a separate commit referencing this file.
