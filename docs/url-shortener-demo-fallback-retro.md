# Retro — `url-shortener` domain (Agent Optimization Loop)

Distilled 2026-05-21 from the trail at `.specs/_intake/url-shortener.md`, `.specs/url-shortener/spec.md`, `.specs/url-shortener/pbi/01-04`, source files at `src/app/widgets/url-shortener/`, and `git log` on this branch. No prior retro existed for this domain.

## Pipeline summary

- **Span.** Single pipeline run (2026-05-21): widget bootstrap → ship → crash → triage fix.
- **Intake.** `.specs/_intake/url-shortener.md` (46 lines) — single run, 6 patterns (P1–P6), 2 Open Questions, 1 Candidate Problem (C1). `/challenge` PASS first try (no objections).
- **Spec.** `.specs/url-shortener/spec.md` (208 lines). Blueprint includes a "Decision 1 (2026-05-21)" deferring input validation to v2 (spec line 71). Constraints block (line 95, now deprecated) explicitly stated v1 throws on malformed input. Scenarios were initially deprecated and deferred to v2 (spec lines 135–147), then restored in v1.1 amendment after triage (spec lines 149–169, added by commit `254af3a`).
- **PBIs.** 4 total. Build sequence: 01 (pure helper) → 02 (client component) → 03 (component tests) → 04 (server route). Build iteration counts: PBI 01 ≤ 1 iteration (confirmed: commit `ec79cc3`), PBI 02 ≤ 2 iterations (code at `c243cee`, test fix at `f764763`), PBI 03 ≤ 1 iteration, PBI 04 ≤ 1 iteration.
- **`/review` verdicts.** All PBIs shipped on first review (no `/build` re-skill events recorded; no `SPEC AMBIGUOUS` escalations).
- **Production incident.** After `/ship`, widget crashed on user input of `"not a url"` or empty string with uncaught TypeError in `UrlShortenerCard.tsx:26` (`new URL(input).hostname` called without try/catch, exactly as the spec's deprecated Constraints block (line 95) allowed). `/triage` routed as "Spec amendment", produced v1.1 amendment restoring input-validation scenarios with error styling (commit `254af3a`).

## Kept (what worked, worth preserving)

- **Happy-path decomposition was tight.** PBIs 01–04 each shipped in ≤2 iterations with clear file-scope boundaries (`shorten.ts` alone, `UrlShortenerCard.tsx` alone, tests alone, route alone). No merge contention, no ambiguity. The Constitution's atomicity rule and the Refinement-rule pattern in the PBI template appear to be doing real work.
- **Spec explicitly documented a deferral decision.** Line 71 reads "Decision 1 (2026-05-21): v1 is happy-path-only. Input validation is deferred to v2." This is a legitimate design choice — the learner's intake said nothing about error handling. The decision is on the record, auditable, and correctly routed to v2. **The problem was not that the decision was made, but that it was made without securing a contract that failure modes would be handled somewhere in the build / test / review gates.**
- **Deprecation-marker discipline prevented spec chaos.** When the v1.1 amendment restored input-validation scenarios post-triage, the old deprecated blocks remained marked (spec lines 106, 134–147). The spec is now unambiguously auditable: readers can see exactly what changed and why.

## Friction (named patterns with evidence)

### F1. Spec explicitly deferred failure modes; no gate caught the resulting gap

The spec's Blueprint (line 71) states "Input validation is deferred to v2." The spec's Constraints block (line 95, now deprecated) endorses this: "v1 calls `new URL(input)` directly without input validation; throwing on malformed input is acceptable v1 behavior (deferred to v2)." This is a legitimate and documented choice.

**The problem:** No gate in the Define → Plan → Build → Review pipeline checked whether a deferred failure-mode contract was actually enforced by the spec's Contract (scenarios + DoD + Regression Guardrails). The consequence: the spec permitted throwing, the tests never checked for error handling, and the code had no error handler. The gap was invisible until production.

Evidence:
- `.specs/url-shortener/spec.md:71` — Decision 1 explicitly defers input validation.
- `.specs/url-shortener/spec.md:95` — deprecated Constraints block endorses throwing behavior (exact text: "throwing on malformed input is acceptable v1 behavior").
- `.specs/url-shortener/spec.md:106` — Gherkin scenarios for invalid input were deprecated alongside the Constraints block.
- `src/app/widgets/url-shortener/UrlShortenerCard.test.tsx` — no test scenario exercises `handleShorten()` with invalid input (e.g. `"not a url"`, empty string, or any malformed URL).
- `src/app/widgets/url-shortener/UrlShortenerCard.tsx:26` — `const hostname = new URL(input).hostname;` called without try/catch, per spec's allowed behavior.

### F2. `/challenge` passed without questioning deferred failure modes

The spec's intake at `.specs/_intake/url-shortener.md` is explicit: "The signal says nothing about … whether short codes persist across page reloads … Short code shape unstated." The `/challenge` gate (per pipeline context: "The intake passed `/challenge` first try (PASS)") accepted this under-specification without raising an objection.

**The gap:** Neither the `/challenge` gate nor the post-challenge spec-writing process checked whether a v1 feature with deferred error handling (a quasi-temporary feature contract) was coherent without an explicit v1 error-handling contract. The precedent from pomodoro (`pomodoro/retro.md:17-18`) shows that deprecation-marker discipline works well, but only after the error is discovered. For a feature that explicitly defers something, the `/challenge` or `/spec` gate should confirm the binding v1 contract accounts for the deferral.

Evidence:
- Intake at `.specs/_intake/url-shortener.md:26-40` lists two Open Questions (persistence, short-code shape) but no "what happens on invalid input?" question.
- No objection recorded at `/challenge` (pipeline context: "PASS first try").
- Spec's Blueprint resolved the two Open Questions explicitly (lines 9–12) but did not resolve "what should v1 do with invalid input?" beyond "defer it".

### F3. Spec Constraints block authorized throwing without a v1 alternative contract

The spec's deprecated Constraints block (lines 95) reads: "v1 calls `new URL(input)` directly without input validation; throwing on malformed input is acceptable v1 behavior (deferred to v2)."

This single clause creates a **coherence gap**:
- It tells `@Dev` "you are allowed to throw" (spec permission).
- It does not tell `@Dev` "you must prevent throwing" (spec requirement) as an alternative.
- It does not tell `@Critic` "verify that UrlShortenerCard has error handling OR surfaces an error to the user" (test/review requirement).
- It defers the fix to v2 without anchoring v1 to a fallback contract (e.g. "while v2 is pending, catch and log but do not show error UI").

When `@Dev` later chose not to add a try/catch, there was no spec clause that blocked it. `@Critic` would have checked the spec's Scenarios; the scenarios for invalid input were deprecated (spec lines 135–147), so there was nothing to verify. The code passed all gates because the gates had nothing to gate on.

Evidence:
- `.specs/url-shortener/spec.md:95` — the exact constraint wording (now deprecated).
- `.specs/url-shortener/spec.md:134-147` — Gherkin scenarios for "Shorten an invalid input" and "Shorten an empty input" were deprecated alongside the Constraints.
- `src/app/widgets/url-shortener/UrlShortenerCard.test.tsx:1-256` — no scenario invokes `handleShorten()` with invalid input; the test suite only validates the happy path.
- The Spec Contract's Definition of Done (spec lines 100–114) includes items like "Clicking 'Shorten' with a valid URL renders a result row" but has no item like "Clicking 'Shorten' with an invalid URL does not throw".

## Proposed amendments (diffs only — not applied)

### Amendment 1 — Spec guidelines: failure-mode contracts must not be deferred without explicit v1 fallback

Target: `.specs/TEMPLATE.md`
Rationale: F1 + F3. When a spec explicitly defers a failure mode to v2 ("input validation deferred to v2"), the deferred-to version becomes a blocking dependency. Specs that lack this pattern (or lack tests that exercise it) ship with a hidden assumption: **if v2 never ships, the feature breaks without warning**. The constitution rule-writing guidance at `.specs/CONSTITUTION.md:31-33` already says "Add or amend rules only when you have observed a recurring violation" — this counts. Prevent the pattern by documenting it in the spec template: if you defer error handling, you must anchor v1 to either (a) a v1 error-handling requirement, or (b) an explicit "unimplemented" state that is safe (e.g. no UI, silent failure mode, logged-but-safe throw). The alternative is a hidden coupling to future work.

Diff:

```diff
@@ .specs/TEMPLATE.md @@
 ### Decisions (optional)

 Document design trade-offs or deferred work here. Mark deferred work clearly.

+**Important:** If you defer error handling (e.g., "input validation deferred to v2"), you must specify a v1 fallback contract. Options:
+- (a) v1 includes error handling with the error UI you will use in v2.
+- (b) v1 has no error handling, but you explicitly document the failure mode as "unimplemented" and confirm it is safe (no crash, no silent data loss, no leaked secrets).
+- (c) v1 surfaces the error without styling (e.g., `alert()` or bare error message) — a deliberate "we know this is ugly, v2 will fix it" compromise.
+
+Do not defer error handling without anchoring v1 to one of these contracts. A deferred error handler is a hidden coupling to future work; if the future work stalls, the feature breaks without warning.
```

### Amendment 2 — Lead persona: spell out failure-mode requirements as a spec-writing checklist

Target: `.claude/agents/lead.md`
Rationale: F2 + F3. The Lead persona's spec-writing guidelines (`.claude/agents/lead.md:12-28`) include strong guidance on coherence ("Specs live at `.specs/<domain>/spec.md` and follow `.specs/TEMPLATE.md` (Blueprint + Contract)") and on constraints ("State constraints positively. No 'Anti-Patterns' sections — encode failure modes as Gherkin scenarios."). But there is no explicit check that mirrors this pattern: "If you defer error handling, you must define v1's contract in the spec's Scenarios/DoD/Regression Guardrails." Baking it into the persona means every `/spec create` and `/spec update` invocation runs this check.

Diff:

```diff
@@ .claude/agents/lead.md @@
 **Guidelines.**

 - Specs live at `.specs/<domain>/spec.md` and follow `.specs/TEMPLATE.md` (Blueprint + Contract).
 - State constraints positively. No "Anti-Patterns" sections — encode failure modes as Gherkin scenarios.
 - Reference concrete file paths, not abstract descriptions.
 - PBIs go in `.specs/<domain>/pbi/<id>.md`. Each PBI is **atomic** (lands whole or not at all), **isolated** (distinct files/modules), and **self-testable** (verifiable without other pending PBIs).
 - Same-commit rule: spec updates ship in the same commit as the code change that revealed them.
 - Match spec depth to feature complexity — omit empty sections.
 - Heed `AGENTS.md` and `CLAUDE.md` — framework version constraints (e.g. Next.js docs in `node_modules/next/dist/docs/`) shape what specs can promise.
+- **Failure-mode contracts.** If a spec defers error handling to a future version (e.g., "input validation deferred to v2"), anchor v1 with an explicit contract: either (a) v1 includes the error-handling UI, or (b) the failure mode is documented as "unimplemented" and confirmed safe, or (c) v1 surfaces the error unstyled (alert, console.error, bare message). Do not defer error handling without this anchor — deferred error handlers create hidden couplings to future work. Codified after url-shortener production crash 2026-05-21.
 - Bash use is limited to read-only repo inspection (`git log`, `git diff`, `git show`, file listings). Do not run code or modify the working tree outside `.specs/`.
```

### Amendment 3 — Critic persona: require failure-mode verification when scenarios are present or deferred

Target: `.claude/agents/critic.md`
Rationale: F2. The Critic's guidelines for `/challenge` (lines 14–26) include strong guidance on attacking "Assumptions" and "Alternatives", but there is no explicit check for "has the spec deferred error handling without a fallback v1 contract?" The Critic currently validates against "Coherence" and "Alternatives" — but a spec that punts error handling to v2 without confirming v1 is safe is neither coherent nor alternative (it's incomplete). Adding this check to the `/challenge` or `/spec` gate would have caught the url-shortener gap before code was written.

Diff:

```diff
@@ .claude/agents/critic.md @@
 **Guidelines for `/challenge` (requirements review).**

 This repo is a practice platform — learners build widgets from their own ideas. The learner's stated intent **is** the source of requirements. Do **not** block on "no user asked for X" or "this widget doesn't teach anything." The legitimate source of an ask is the learner's quoted intent in the intake (see `AGENTS.md` → Requirements in a practice platform).

 - Read the Problem Graph or draft strategy. Attack on these axes:
   - **Coherence** — does the learner's stated intent line up with what's being proposed? Are there contradictions or unstated leaps?
   - **Assumptions** — what is being assumed without justification?
   - **Scope** — is this still a single widget, deletable in one `rm -rf`, not bundling unrelated ideas?
   - **Next.js architecture** — does the proposal respect App Router conventions, server-first defaults, the `@/*` alias, `next/font`, Tailwind-first styling, and the no-exotic-layering rule?
   - **Alternatives** — is there a simpler shape that still satisfies the learner's intent?
+  - **Failure-mode contracts** — if the spec (or intake) defers error handling to a future version, does it anchor v1 with an explicit contract (v1 includes error handling, or the failure mode is documented as "unimplemented" and safe, or v1 surfaces error unstyled)? Unanchored deferrals are hidden couplings to future work.
 - Output one of:
   - `PASS` — followed by a one-line summary of why the problem is well-formed enough to spec.
   - A numbered list of objections, each with `severity: blocking|major|minor` and `resolved by: …`.
```

### Amendment 4 — Critic persona: verify Scenarios/DoD/Guardrails cover deferred error cases

Target: `.claude/agents/critic.md` (in `/review` guidelines section)
Rationale: F1 + F3. The Critic's guidelines for `/review` (lines 43–59) validate against the Spec Contract, but the instruction "Scenarios cover happy path + at least one error case + relevant edges" is advisory, not mandatory, and is stated in the spec-writing prompt (`.claude/commands/spec.md:29`) rather than the Critic's persona. When a spec deliberately defers error handling, the Critic should explicitly flag: "If this PBI tests the deferred case (e.g., calling `handleShorten` with invalid input), it must either (a) check that the deferred handler will run (test the safety assumption), or (b) confirm it will not run in v1 (explicit uncaught-exception contract)." The url-shortener code caught neither — tests never exercised invalid input, and the code threw.

Diff:

```diff
@@ .claude/agents/critic.md @@
 - **Spec pass.** Validate against the spec's Blueprint (constraints) and Contract (Definition of Done, Regression Guardrails, Scenarios).
 - **Constitutional pass.** For each `NEVER`/`ALWAYS` rule in the Constitution, check whether the diff violates or omits it. Pay special attention to: cross-widget imports, additions to `src/lib/`, new layered directories, gate-bypass markers (`--no-verify`, `// @ts-ignore`, skipped tests), and missing test colocation.
+- **Deferred error handling.** If the spec defers error handling to a future version, the Scenarios and Definition of Done must explicitly account for v1's behavior. Check: (a) are there Gherkin scenarios that would exercise the deferred case (e.g. "Shorten an invalid input")? If yes, are they marked `[DEPRECATED]` or do they describe v1 behavior? If they are deprecated, the tests must **not** exercise them. If v1 tests **do** exercise them, the scenario must have been restored in a spec amendment. If no scenarios mention the deferred case, confirm that omitting them is intentional (the spec is silent on the case, not deferring it). Codified after url-shortener 2026-05-21 — deferred input-validation scenarios were marked deprecated but tests never exercised them, leading to an unhandled crash.
 - For each violation report: (1) which contract (Spec or Constitution) was broken and which clause, (2) impact, (3) remediation path, (4) test or check that would prevent regression.
 - Output one of:
   - `PASS` — one line on what you verified, calling out both passes (e.g. "Spec DoD items 1–4 met; no Constitutional violations.").
   - A numbered list of violations, each tagged `[Spec]` or `[Constitution]`.
   - `SPEC AMBIGUOUS` — if the spec cannot decide the question. Name the gap and escalate to `@Lead`. (Constitutional ambiguity is rarer; if a Constitutional rule is itself unclear, flag it as a Constitution amendment candidate rather than blocking the PBI.)
```

---

**Total amendments proposed:** 4. **By target:** `.specs/TEMPLATE.md` × 1 (Amendment 1), `.claude/agents/lead.md` × 1 (Amendment 2), `.claude/agents/critic.md` × 2 (Amendments 3–4).

None of the amendments above have been applied. The learner reviews this retro and applies the diffs they agree with in a separate commit referencing this file.
