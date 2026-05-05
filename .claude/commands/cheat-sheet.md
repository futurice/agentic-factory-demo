---
description: Print the agentic factory slash-command reference card.
---

Display the following cheat sheet **verbatim** to the user, then stop. Do not add commentary, do not run any other tool, do not invoke any other command.

---

# Agentic Software Factory — Cheat Sheet

Pipeline: **Discover → Define → Spec → Assemble → Run**, with adversarial gates between phases. Personas are subagents in `.claude/agents/` (dispatched via the Agent tool); specs live in `.specs/`.

| Command                                  | Phase           | Persona             | Use case                                       | One-liner                                                                                                                                                                |
| ---------------------------------------- | --------------- | ------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/discover <signal>`                     | Discover        | `@Analyst`          | New idea, raw feedback, bug report, transcript | Cluster the signal into `.specs/_intake/<slug>.md` (Problem Graph). No solutions yet.                                                                                    |
| `/challenge <intake>`                    | Define gate     | `@Critic`           | Before writing any spec                        | Adversarially attack the problem statement. Returns `PASS` or numbered objections.                                                                                       |
| `/spec create\|reverse\|update <domain>` | Spec            | `@Lead`             | Write/refresh a living spec                    | Produces `.specs/<domain>/spec.md` with Blueprint + Contract + Gherkin.                                                                                                  |
| `/plan <domain>`                         | Spec → Assemble | `@Lead`             | Break the spec into work units                 | Writes atomic, isolated, self-testable PBIs to `.specs/<domain>/pbi/`.                                                                                                   |
| `/challenge-plan <domain>`               | Plan gate       | `@Critic`           | Before writing any code                        | Adversarially attack the PBI set (atomicity, isolation, self-testability, coverage). Returns `PASS` or numbered objections.                                              |
| `/build <pbi-id>`                        | Assemble        | `@Dev`              | Implement one PBI                              | In-session Ralph Loop: edits + `lint` + `tsc` + `test:run`, max 10 iterations, micro-commits.                                                                            |
| `/review <pbi-id>`                       | Assemble gate   | `@Critic`           | Adversarial code review                        | Fresh `critic` subagent reads only spec + diff. Returns `PASS`, violations, or `SPEC AMBIGUOUS`.                                                                         |
| `/ship <pbi-id>`                         | Acceptance      | human (main thread) | Open the PR                                    | Strategic-fit checklist, awaits explicit human approval, then pushes + opens PR. Stays in main thread (no subagent) for the approval gate. Only command touching remote. |
| `/learn <signal>`                        | Run → Discover  | `@Analyst`          | Production bug, metric, incident               | Routes signal back into spec amendment, new intake, or regression guardrail.                                                                                             |
| `/factory <signal>`                      | Orchestrator    | main thread         | Run the whole pipeline end-to-end              | Runs the double diamond: dispatches the commands above, pauses at diamond boundaries (`/challenge` PASS, before `/ship`). `--auto` collapses pauses except `/ship`.      |
| `/cheat-sheet`                           | —               | —                   | This card                                      | Prints this reference.                                                                                                                                                   |

## Typical end-to-end flow

```
/discover <signal>
   → /challenge .specs/_intake/<slug>.md
        → (if PASS)  /spec create <domain>
              → /plan <domain>
                    → /challenge-plan <domain>
                          → (if PASS) /build <pbi-id>
                                → /review <pbi-id>
                                      → (if PASS) /ship <pbi-id>
                                      → (if violations) /build <pbi-id>   # loop
                                      → (if SPEC AMBIGUOUS) /spec update <domain>
                          → (if objections) /plan <domain>   # or /spec update <domain>
   (later, in production) /learn <signal>   # feeds back to top
```

## Gate semantics

- **Quality gates** (deterministic): auto-enforced **inside** `/build`. Loop on failure, hard cap 10 iterations.
- **Review gates** (probabilistic): `/challenge`, `/challenge-plan`, and `/review`. Always fresh session. User decides whether to loop back on FAIL.
- **Acceptance gate** (human): `/ship`. No auto-anything. Explicit approval required.
- **Orchestration**: `/factory <signal>` runs the whole pipeline as a double diamond — pauses at the convergence of each diamond (after `/challenge` PASS; before `/ship`). `/challenge-plan` is an internal D2 checkpoint and only halts on objections.

## Rules baked into the personas

- `@Dev` does not edit specs; `@Lead` does not write code; `@Critic` never edits anything.
- Spec changes ship in the **same commit** as the code change that revealed them (same-commit rule).
- Constraints are stated **positively**; failure modes are absorbed by Gherkin scenarios.
- No `--no-verify`, no `// @ts-ignore`, no skipped tests to make a gate pass.
