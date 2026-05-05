---
description: Implement one PBI; auto-loop on deterministic quality gates until they pass or the iteration cap is reached.
---

Dispatch this task to the `dev` subagent via the Agent tool (`subagent_type: dev`). The whole Ralph Loop runs inside the subagent. Relay its final report to the user.

**Input:** $ARGUMENTS — a PBI id or path (e.g., `auth/01-login-form` or `.specs/auth/pbi/01-login-form.md`).

**Subagent prompt to send:**

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
>    - Final gate output (PASS)
>
> Do not push, open PRs, or touch remote state — that is `/ship`.
> Do not edit `.specs/` unless implementation revealed a contract change; in that case stop and request `/spec update <domain>` rather than editing yourself.
> Do not call `/review` on your own output — `@Critic` runs in a separate subagent by design.

After relaying, suggest `/review <pbi-id>` as the next step.
