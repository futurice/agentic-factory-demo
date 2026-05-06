---
description: Print the agentic factory slash-command reference card.
---

Display the following cheat sheet **verbatim** to the user, then stop. Do not add commentary, do not run any other tool, do not invoke any other command.

---

# Agentic Software Factory — Cheat Sheet

Pipeline: **Discover → Define → Spec → Assemble → Run**, with adversarial gates between phases. Personas are subagents in `.claude/agents/` (dispatched via the Agent tool); specs live in `.specs/`.

| Command                                  | Phase                           | Persona                     | Use case                                       | One-liner                                                                                                                                                                                                          |
| ---------------------------------------- | ------------------------------- | --------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/discover <signal>`                     | Discover (+ orchestrator)       | `@Analyst` then main thread | New idea, raw feedback, bug report, transcript | Cluster the signal into `.specs/_intake/<slug>.md`, then auto-chain through `/challenge` → `/spec` → `/plan` → `/challenge-plan` → `/build` → `/review` for every PBI. Halts only on objections or before `/ship`. |
| `/challenge <intake>`                    | Define gate                     | `@Critic`                   | Before writing any spec                        | Adversarially attack the problem statement. Returns `PASS` or numbered objections.                                                                                                                                 |
| `/spec create\|reverse\|update <domain>` | Spec                            | `@Lead`                     | Write/refresh a living spec                    | Produces `.specs/<domain>/spec.md` with Blueprint + Contract + Gherkin.                                                                                                                                            |
| `/plan <domain>`                         | Spec → Assemble                 | `@Lead`                     | Break the spec into work units                 | Writes atomic, isolated, self-testable PBIs to `.specs/<domain>/pbi/`.                                                                                                                                             |
| `/challenge-plan <domain>`               | Plan gate                       | `@Critic`                   | Before writing any code                        | Adversarially attack the PBI set (atomicity, isolation, self-testability, coverage). Returns `PASS` or numbered objections.                                                                                        |
| `/build <pbi-id>`                        | Assemble                        | `@Dev`                      | Implement one PBI                              | In-session Ralph Loop: edits + `lint` + `tsc` + `test:run`, max 10 iterations, micro-commits.                                                                                                                      |
| `/review <pbi-id>`                       | Assemble gate                   | `@Critic`                   | Adversarial code review                        | Fresh `critic` subagent reads only spec + diff. Returns `PASS`, violations, or `SPEC AMBIGUOUS`.                                                                                                                   |
| `/ship <pbi-id>`                         | Acceptance                      | human (main thread)         | Open the PR                                    | Strategic-fit checklist, awaits explicit human approval, then pushes + opens PR. Stays in main thread (no subagent) for the approval gate. Only command touching remote.                                           |
| `/triage <signal>`                       | Run → Discover (+ orchestrator) | `@Analyst` then main thread | Production bug, metric, incident               | Routes signal to spec amendment, regression guardrail, or new intake. On "new intake" auto-chains through the rest of the pipeline like `/discover`.                                                               |
| `/cheat-sheet`                           | —                               | —                           | This card                                      | Prints this reference.                                                                                                                                                                                             |

## Typical end-to-end flow

`/discover <signal>` (and `/triage` when it routes to "new intake") is the entry point and the orchestrator. It auto-chains every phase below; you only get prompted on objections or before `/ship`.

```
/discover <signal>            # entry point + orchestrator (main thread)
   → /challenge <intake>
        → (if PASS, asks for <domain>) /spec create <domain>
              → /plan <domain>
                    → /challenge-plan <domain>
                          → (if PASS) /build <pbi-id>
                                → /review <pbi-id>
                                      → (if PASS) next PBI, then HALT before /ship
                                      → (if violations) /build <pbi-id>   # loop, hard cap inside /build
                                      → (if SPEC AMBIGUOUS) HALT, suggest /spec update <domain>
                          → (if objections) HALT
        → (if objections) HALT
   /ship <pbi-id>              # always human-gated; orchestrator never auto-invokes
   (later, in production) /triage <signal>  # routes; on "new intake" re-enters the chain above
```

Individual phase commands (`/challenge`, `/spec`, `/plan`, `/challenge-plan`, `/build`, `/review`) remain runnable à la carte for manual control — only `/discover` and `/triage` self-orchestrate.

## Gate semantics

- **Quality gates** (deterministic): auto-enforced **inside** `/build`. Loop on failure, hard cap 10 iterations.
- **Review gates** (probabilistic): `/challenge`, `/challenge-plan`, and `/review`. Always fresh session. User decides whether to loop back on FAIL.
- **Acceptance gate** (human): `/ship`. No auto-anything. Explicit approval required.
- **Orchestration**: `/discover <signal>` (or `/triage` when routing to "new intake") drives the whole pipeline end-to-end from the main thread. It only halts on gate objections, the `/build` 10-iteration cap, or the pre-`/ship` boundary.

## Rules baked into the personas

- `@Dev` does not edit specs; `@Lead` does not write code; `@Critic` never edits anything.
- Spec changes ship in the **same commit** as the code change that revealed them (same-commit rule).
- Constraints are stated **positively**; failure modes are absorbed by Gherkin scenarios.
- No `--no-verify`, no `// @ts-ignore`, no skipped tests to make a gate pass.
