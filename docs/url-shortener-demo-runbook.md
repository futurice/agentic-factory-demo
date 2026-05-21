# URL Shortener `/retro` Demo Runbook

A 15–20 minute live demo of the agentic factory's second loop — `/retro` and `/triage` — using the `url-shortener` widget as a baked example. Audience: developer community at a potential client.

The headline message: **agents learn from mistakes**. `/retro` turns a production incident into a durable amendment to the producer (Constitution, AGENTS.md, personas, templates), so the same class of mistake doesn't happen twice.

---

## Demo state at stage start

Branch: `feat/factory-demo`. The pipeline has already run end-to-end. Trail commits, oldest first:

| Sha       | Subject                                                                    |
| --------- | -------------------------------------------------------------------------- |
| `ec79cc3` | feat(01-pure-helper): add generateCode pure helper and unit tests          |
| `c243cee` | feat(02-client-component): add UrlShortenerCard client component and tests |
| `f16cc31` | feat(04-route-page): add server component route for url-shortener widget   |
| `f764763` | fix(url-shortener): avoid Tailwind class generation from test description  |
| `e5d1be6` | docs(specs): land url-shortener intake, spec, and PBIs (catch-up)          |
| `254af3a` | docs(specs): apply triage v1.1 input-validation amendment                  |

Files on disk:

- `.specs/_intake/url-shortener.md` — intake silent on failure modes
- `.specs/url-shortener/spec.md` — deferral note (line 95, deprecated) + v1.1 amendment (added by `254af3a`)
- `.specs/url-shortener/pbi/01..04` — four PBIs
- `src/app/widgets/url-shortener/` — the built widget
- `.claude/agents/critic.md` — **baseline** (no failure-modes axis)
- `AGENTS.md` — **baseline** (4-axis "Requirements in a practice platform" list)
- `.specs/url-shortener/retro.md` — **deleted** (live `/retro` will create fresh)

Fallback recordings (do not surface unless needed):

- `docs/url-shortener-demo-fallback-retro.md` — the rehearsed `/retro` output

---

## Pre-stage checklist (5 min before)

1. `git status` clean (no `.specs/url-shortener/retro.md`; no edits to `.claude/agents/critic.md` or `AGENTS.md`)
2. `git log -6 --oneline` shows the trail above
3. `npm run dev` running; browser tab open at `http://localhost:3000/widgets/url-shortener`; **verify a valid URL shortens correctly** and a malformed URL crashes (paste `not a url`, click Shorten, see error overlay)
4. Terminal in repo root, clean prompt
5. Code editor open with `.claude/agents/critic.md` and `AGENTS.md` visible in tabs (for the amendment step)
6. Backup recordings of `/retro` (slowest step) ready to drop in

---

## Stage flow (15–20 min)

### 0:00 — 2:00 · Frame + bug demo

- "Yesterday this URL shortener shipped through our agentic factory. Watch what happens."
- Paste `https://www.example.com/some/long/path` → click Shorten → result row appears with hostname + 6-char code → looks great.
- Paste `not a url` → click Shorten → **React error overlay** (uncaught `TypeError: Invalid URL`).
- "OK, a crash on bad input. Two questions: how does the factory fix the *product* (this widget), and how does it fix the *process* (so the next widget doesn't ship with the same gap)? Those are two different loops."

### 2:00 — 3:00 · Diagnose

- Open `.claude/agents/critic.md`. Show lines 18–23 — the 5 axes of `/challenge` (Coherence, Assumptions, Scope, Next.js architecture, Alternatives).
- "Notice — no axis for failure modes. The intake said nothing about invalid input, the spec inherited that silence, the dev wrote code that crashes on it, and no gate flagged it."
- Open the intake briefly (`.specs/_intake/url-shortener.md`) — show that it's silent on edge cases. "The learner didn't think to mention it. The producer didn't think to ask."

### 3:00 — 7:00 · Run `/triage` (product fix)

- "First loop — fix the actual artifact. Run `/triage` on the production signal."
- Run on stage:
  ```
  /triage shipped url-shortener crashes on /widgets/url-shortener when the user pastes "not a url" or empty input — uncaught TypeError from new URL(). Spec is silent on this behavior.
  ```
- Expected output: analyst routes as **Spec amendment**, produces a diff with v1.1 input-validation contract + 3 Gherkin scenarios + error styling.
- "Product fix routed. `@Lead` would apply this and re-run `/plan` + `/build` to ship v1.1. Loop one closed."
- *(Don't actually apply — for time. The diff is the artifact.)*

### 7:00 — 13:00 · Run `/retro` (process fix)

- "But why did this reach production in the first place? That's what `/retro` answers."
- Run on stage:
  ```
  /retro url-shortener
  ```
- ~3–6 min of analyst subagent runtime. While it runs, narrate: "/retro reads the whole pipeline trail — intake, spec, every PBI, the git log, the existing Constitution and persona files — and asks where the producer could have been smarter. It proposes diffs but never applies them; humans curate."
- When done, open `.specs/url-shortener/retro.md`. Walk through:
  - Pipeline summary (~30s)
  - Friction items, especially F1 ("spec explicitly deferred failure modes; no gate caught the resulting gap")
  - **Proposed amendments** — show that one of them targets `.claude/agents/critic.md`, adding a Failure-mode contracts axis to `/challenge`

#### Fallback if `/retro` is slow or produces wrong amendments

Read `docs/url-shortener-demo-fallback-retro.md` aloud instead. It's the rehearsed output and contains the exact same 4 amendments. Frame: *"While we wait, here's what `/retro` produced when I ran it earlier — same trail, same analysis."*

### 13:00 — 15:00 · Apply the amendment (live edit)

- "The analyst's draft is a starting point — we review and curate. Let me apply Amendment 3 (the `/challenge` axis) but sharpen it a bit; the analyst was conservative."

**Edit 1 — `.claude/agents/critic.md`.** Two indentation rules matter and both are non-negotiable:

- The new line must sit at **2-space indentation**, matching `Coherence`/`Assumptions`/`Scope`/etc. — i.e. a **top-level 6th axis bullet**, NOT a sub-bullet under Assumptions. A sub-bullet doesn't reliably flip the verdict (verified during prep — see appendix item 7).
- It goes **after** the `Alternatives` line and **before** the `- Output one of:` line.

Concretely, locate this block (around lines 18–24):

```markdown
- Read the Problem Graph or draft strategy. Attack on these axes:
  - **Coherence** — ...
  - **Assumptions** — ...
  - **Scope** — ...
  - **Next.js architecture** — ...
  - **Alternatives** — is there a simpler shape that still satisfies the learner's intent?
- Output one of:
```

Insert this exact line (with leading `  - ` at 2-space indentation) between the `Alternatives` bullet and the `- Output one of:` bullet:

```markdown
  - **Failure-mode contracts (required check).** Before concluding `PASS`, you **MUST** explicitly verify that the intake addresses the relevant failure modes for this widget. For input-handling widgets: at minimum invalid input, empty input, malformed input. For network-touching widgets: at minimum timeout, 4xx, 5xx, offline. For each plausible failure mode, state whether the intake addresses it. If any plausible failure mode is unaddressed in the intake — even by omission — raise a **blocking** objection naming the specific failure mode and the code path that would hit it (e.g. *"calling `new URL()` on user-supplied input"*). **Silence on a relevant failure mode is itself the objection**; a deferral must be named to be safe.
```

**Edit 2 — `AGENTS.md` (load-bearing companion edit).** The critic also reads AGENTS.md, which has its own "Critic still gates on:" list. If that list doesn't include failure-mode contracts, the critic treats AGENTS.md as authoritative and ignores the new critic.md bullet. Locate this block (around lines 55–62):

```markdown
The Critic still gates on:

- **Coherence** — ...
- **Scope** — ...
- **Next.js architecture** — ...
- **Alternatives** — is there a simpler shape that still satisfies the learner's intent?

Objections of the form "no user asked for X" ...
```

Insert this line (at the same indentation as Alternatives) between `Alternatives` and the blank line before "Objections of the form":

```markdown
- **Failure-mode contracts** — does the intake enumerate the failure modes for this feature (invalid input, empty input, network failure, etc.) and pin v1 behavior for each? Silence on a relevant failure mode is a blocking objection — a deferral has to be named to be safe. (Added after url-shortener 2026-05-21 production crash on `new URL()` of invalid user input.)
```

**Edit 3 — commit both files:**

```sh
git add .claude/agents/critic.md AGENTS.md
git commit -m "apply /retro amendment: add failure-mode contracts axis to /challenge"
```

### 15:00 — 17:00 · Proof: re-run `/challenge` on the original intake

- "Same intake. Same `/challenge` skill. Different persona file. Watch."
- Run on stage:
  ```
  /challenge .specs/_intake/url-shortener.md
  ```
- **Expected output (rehearsed, see "Live behavior caveat" below):** approximately **1 in 3 runs** produces blocking objections that explicitly cite the AGENTS.md amendment and name `new URL()` as the crash path; the other 2 in 3 still PASS. The amendment shifts the probability of catching the gap, not the certainty. When it flips, the verdict cites the amendment by name and references the 2026-05-21 production incident — that's the strongest possible demo moment. When it doesn't flip, fall back to the responses in "Live behavior caveat" below.
- "That's the second loop. The producer just learned. Every future intake that comes through `/challenge` inherits this rule."

### 17:00 — 19:00 · Land the message

- Two loops closed in this demo:
  - `/triage` routed the **product fix** (v1.1 spec amendment) — fixing the artifact that bit users.
  - `/retro` proposed the **process fix** (critic.md amendment) — preventing the next widget from making the same mistake.
- "This is what we mean by *the factory learns*. Every shipped pipeline is also an opportunity to make the next pipeline better. The amendments are diffs — humans review and apply — but the *discovery* is automated. That's the compounding return."

### 19:00 — 20:00 · Q&A buffer

Common questions and answers:

- *"Does `/retro` always converge on the right amendment?"* — No. The analyst is non-deterministic; sometimes the proposed amendment is too soft, sometimes it misses the headline. That's why humans curate. The retro produces *candidates*; the diff stays in a file you can edit, ignore, or sharpen — exactly as we did with Amendment 3 here.
- *"What about `/review`?"* — Not run on this demo for time. Same gate the Critic runs on the code diff. `/retro`'s Amendment 4 sharpens it.
- *"Could we automate the amendment application?"* — Deliberately not. Amendments change the producer permanently; auto-applying inferred lessons is how you get uncontrolled drift in agent behavior. Same posture as `/triage` toward spec edits.

---

## Live behavior caveat (rehearsal honesty)

The amended `/challenge` is **not deterministic**. Across 5 rehearsal runs (top-level axis + AGENTS.md update) against the unmodified intake:

| Run | Verdict | Failure-modes mentioned?                                                                                  |
| --- | ------- | --------------------------------------------------------------------------------------------------------- |
| 1   | PASS    | No                                                                                                        |
| 2   | PASS    | No                                                                                                        |
| 3   | PASS    | No                                                                                                        |
| 4   | PASS    | No                                                                                                        |
| 5   | **3 objections** | **Yes — blocking, cites AGENTS.md by name, names `new URL()` crash path, lists 5 failure modes** |

So the amendment **changes the probability** that `/challenge` catches the gap (roughly **1 in 3 to 1 in 5**), not the certainty. When it does flip, it flips dramatically — the critic literally attributes the objection to the amendment and the 2026-05-21 incident. On stage you may get any of these outcomes. Three graceful responses:

1. **If verdict flips to objections** → ideal demo. Land the "same input, different verdict" punch. Read the critic's reasoning aloud — it cites the amendment by name and connects it to the production crash. That self-reference is itself the demo's payoff.
2. **If verdict is PASS but failure-modes appears in the analysis** → say: *"Notice — it's now even listing failure modes as something to think about. Before the amendment, it didn't. The critic is asking new questions; whether they're 'blocking' is a calibration the team will tune over time."*
3. **If verdict is clean PASS with no mention** → say: *"And there's the LLM non-determinism that's the cost of doing business in this stack. The amendment shifts the probability of catching this, not the certainty — that's why we have multiple gates, not just one. Let me run it again."* (Then run once more; if still PASS, move to the wrap-up rather than getting stuck in retries.)

The honest framing: **non-determinism is real and worth naming**. Hiding it would be misleading; embracing it strengthens the demo's credibility. You can also point out that the *producer-side artifact change is deterministic* — the amendment is visibly in `critic.md` and `AGENTS.md` regardless of what any given `/challenge` run does.

**Pre-stage rehearsal tip:** run `/challenge` 2–3 times in the green room before the demo to see what outcomes the day's variance produces. If you get a flip, you know one's possible on stage. If you don't, you've already mentally rehearsed the fallback responses.

---

## State reset (after the demo, before the next one)

```sh
git checkout .claude/agents/critic.md AGENTS.md          # undo the live amendment
rm -f .specs/url-shortener/retro.md                       # remove the live retro
git reset --soft HEAD~1                                   # undo the amendment commit (if you commit on stage)
```

Re-verify pre-stage checklist before next run.

---

## Appendix — what happened during prep (for context)

Prep itself produced several pieces of friction worth knowing about, in case the audience asks how the demo was built:

1. **`/spec create` over-specified.** The first `/spec create` ran included input-validation Gherkin scenarios that weren't in the intake — because the Lead's validation checklist requires "at least one error case." We ran `/spec update` to defer them to v2 (commit not in the trail because spec/PBI files were uncommitted at that point, see #4 below).
2. **PBI 02 absorbed PBI 03's scope.** PBI 02's dev wrote `UrlShortenerCard.test.tsx` because PBI 02's acceptance criteria required tests to verify, but the file was technically in PBI 03's declared scope. We never ran `/build` on PBI 03 — its work was already done.
3. **Test description triggered Tailwind to generate broken CSS.** A string of the form `font-[var(--font-NAME)]` (with `NAME` standing for any token containing the three-ASCII-dot placeholder we used) in an `it()` description was scanned by Tailwind v4 as a class to generate, producing unparseable CSS that 500'd every route. Fixed by rewording the description (`f764763`). Important: this runbook cannot itself include the literal-three-dot form in plain text without re-triggering the bug — pomodoro retro F2 / Constitution rule are written using the ellipsis character (U+2026, `…`) instead, which Tailwind does not parse as a class.
4. **Same-commit rule violations.** Code commits shipped without spec/PBI files; `e5d1be6` is the catch-up. This is the recurring pattern pomodoro retro flagged as F1.
5. **First `/retro` didn't find failure modes.** Because the spec's explicit deferral marker made the gap look like intentional scope, not friction. Pivoted to running `/triage` first, which gave `/retro` production-signal evidence to anchor against. The 2nd `/retro` (the one we'll use on stage) converged on the critic.md amendment.
6. **The amendment as auto-generated was too soft.** The analyst's Amendment 3 used a conditional ("if the spec defers…") that didn't fire on silence. We sharpened it on stage to be procedurally directive ("MUST enumerate failure modes before PASS"). This sharpening is part of the live demo — it shows that humans curate `/retro`'s output.
7. **Sub-bullet vs top-level axis placement was load-bearing.** A later `/retro` run proposed Amendment 3 as a *sub-bullet nested under Assumptions* in `critic.md`. With that placement, `/challenge` walked Assumptions, satisfied itself on the Open Questions, and never separately addressed the sub-bullet — verdict didn't flip in 4 runs. Moving the bullet to be a **top-level 6th axis** at the same indentation as Alternatives flipped 1 in 5 runs (with the same wording). Indentation matters: a sub-bullet reads as subordinate; a top-level bullet reads as another axis the critic must traverse. The runbook above bakes the top-level placement in.
8. **AGENTS.md "Requirements in a practice platform" was overriding `critic.md`.** Even with the top-level axis in `critic.md`, the verdict stayed PASS until we *also* added a Failure-mode contracts entry to AGENTS.md's "Critic still gates on:" list. The critic reads both files and treats AGENTS.md's numbered list as authoritative when the two disagree. **Both edits are non-negotiable** — applying just one is functionally a no-op.
