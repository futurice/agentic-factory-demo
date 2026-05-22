---
description: Implement one PBI; auto-loop on deterministic quality gates until they pass or the iteration cap is reached, then dispatch the Critic for adversarial review.
---

You are the orchestrator. Run two phases sequentially: **Phase 1** dispatches `@Dev` to implement the PBI and clear deterministic gates. **Phase 2** dispatches `@Critic` (fresh subagent — required so Builder reasoning does not leak) to validate the resulting diff against the spec and the platform Constitution. Stop and report on Phase 2 violations; do **not** auto-loop back into Phase 1.

**Input:** $ARGUMENTS — a PBI id or path (e.g., `auth/01-login-form` or `.specs/auth/pbi/01-login-form.md`). Append the optional flag `--no-review` to skip Phase 2 (use for trivial scaffolding PBIs — routes, dependency installs — where the deterministic gates already cover the surface area).

---

## Phase 1 — Build

Dispatch the `dev` subagent (`subagent_type: dev`) with the prompt below. The whole Ralph Loop runs inside the subagent.

> Build-phase task for PBI: $ARGUMENTS
>
> Pipeline (in-session Ralph Loop, max 10 iterations).
>
> 1. **Load context.**
>    - Read the PBI file. If not found, stop and report that a valid PBI id is needed.
>    - Read the linked spec section.
>    - Read any files listed under "Files in scope".
>    - If `AGENTS.md` flags framework version constraints (e.g. Next.js docs in `node_modules/next/dist/docs/`), consult them before writing code.
> 2. **Implement.** Make the smallest change that satisfies the PBI's Acceptance criteria. Stay inside "Files in scope".
> 3. **Run quality gates** in order:
>    ```
>    npm run lint
>    npx tsc --noEmit
>    npm run test:run
>    ```
> 4. **Loop logic.**
>    - If all three pass → go to step 5.
>    - If any fails → analyze the error, fix the **root cause** (not the symptom), and re-run gates. Increment iteration counter.
>    - **Hard cap: 10 iterations.** If still failing, stop and report:
>      - which gate is failing
>      - what you tried
>      - your hypothesis for the root cause
>      - whether the PBI scope or spec needs revision (`/spec update`)
>    - Never bypass gates (no `--no-verify`, no skipped tests, no `// @ts-ignore` to silence errors).
> 5. **Micro-commit** with a conventional message that names the PBI id. One logical change per commit.
> 6. **Return:**
>    - PBI id and file
>    - Iteration count
>    - Files touched
>    - Commit SHA
>    - Final gate output (PASS)
>
> Do not push, open PRs, or touch remote state — that is `/ship`.
> Do not edit `.specs/` unless implementation revealed a contract change; in that case stop and request `/spec update <domain>` rather than editing yourself.
> Do not call `/review` on your own output — `@Critic` runs in a separate subagent dispatched by the main thread.

If Phase 1 fails (Ralph cap, missing PBI, or `/spec update` requested), surface the Dev report and stop — do not proceed to Phase 2.

If `--no-review` is set, relay the Dev report and stop. Suggest `/ship <pbi-id>` (after the user manually verifies, since the architectural gate was skipped) or `/review <pbi-id>` if the user wants to opt back in.

Otherwise, continue to Phase 2.

---

## Phase 2 — Review

**Orchestration steps performed in the main thread before dispatch.**

1. Resolve the PBI file (`.specs/<domain>/pbi/<id>.md`).
2. Identify the spec section the PBI points to and read it.
3. Read `.specs/CONSTITUTION.md` (the platform's architectural contract). If missing, stop and surface — the review pass requires it.
4. Capture the diff for the PBI's commits — typically `git show <sha>` for the SHA the Dev subagent reported, or `git diff <base>...HEAD` scoped to "Files in scope".

Dispatch the `critic` subagent (`subagent_type: critic`) with the self-contained prompt below — do **not** include your own analysis or the Builder's commit messages beyond the bare diff.

> Adversarial Code Review (`/review` mode). Validate against TWO contracts: the Spec (functional) and the Constitution (architectural).
>
> Spec: <paste relevant spec section verbatim, or pass file path + anchor>
> Constitution: <paste `.specs/CONSTITUTION.md` content>
> PBI: <paste PBI file content>
> Diff: <paste the unified diff>
>
> Run two passes:
>
> 1. **Spec pass** — does the diff implement the spec's Blueprint constraints and Contract (DoD, Regression Guardrails, Scenarios)?
> 2. **Constitutional pass** — does the diff respect every NEVER/ALWAYS rule? Check explicitly for: cross-widget imports, additions to `src/lib/`, new layered directories, gate-bypass markers, missing test colocation.
>
> Output one of:
>
> - `PASS` — one line confirming both passes (e.g. "Spec DoD items 1–4 met; no Constitutional violations.").
> - A numbered list of violations, each tagged `[Spec]` or `[Constitution]`. For each: contract broken (cite clause), impact, remediation path, regression test or check.
> - `SPEC AMBIGUOUS` — if the spec cannot decide the question. Name the gap.
>
> Do not edit any files. Do not propose alternative implementations beyond a one-line remediation pointer. Return your verdict only.

---

## Reporting

Relay both reports verbatim under clear headings (`### Build` and `### Review`), then suggest the next step based on the Critic verdict:

- `PASS` → `/ship <pbi-id>` (or continue to the next PBI in the domain).
- Violations → **stop**. Surface the verdict and ask the user to decide: re-run `/build <pbi-id>` to attempt a fix, `/spec update <domain>` if the spec is wrong, or accept the violation and proceed manually. Do **not** auto-loop. Re-running `/build` on critic feedback risks "fixing" a real architectural concern by silencing it; that judgment call belongs to the user.
- `SPEC AMBIGUOUS` → suggest `/spec update <domain>`.

## Boundaries

- The Critic must run in a fresh subagent dispatched by the main thread. Never have the Dev subagent invoke the Critic, and never relay Dev's reasoning into the Critic's prompt.
- Phase 2 is opt-out (`--no-review`), not opt-in. Skipping should be a deliberate choice.
- Never push, open PRs, or touch remote state — that is `/ship`.
