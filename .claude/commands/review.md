---
description: Adversarial code review of a PBI's diff against its spec. Runs in a fresh subagent for session separation.
---

You are coordinating an **Adversarial Code Review**. The review itself MUST run in a fresh subagent so the Builder's reasoning does not leak into the Critic's context.

**Input:** $ARGUMENTS — a PBI id or path (e.g., `auth/01-login-form`).

**Steps you perform here (orchestration only).**

1. Resolve the PBI file (`.specs/<domain>/pbi/<id>.md`). If missing, stop.
2. Identify the spec section the PBI points to.
3. Capture the diff for the PBI's commits — typically `git log` since the previous PBI's merge or `git diff <base>...HEAD` scoped to "Files in scope".
4. Spawn a **fresh subagent** via the Agent tool (subagent_type=`general-purpose`) with the following self-contained prompt. Do **not** include your own analysis or the Builder's commit messages beyond the bare diff.

   ```
   You are the @Critic persona running an Adversarial Code Review.
   Read .claude/skills/critic.md and follow the /review guidelines exactly.

   Spec: <paste relevant spec section verbatim, or pass file path + anchor>
   PBI: <paste PBI file content>
   Diff: <paste the unified diff>

   Validate the diff against the spec's Blueprint constraints and Contract (DoD,
   Regression Guardrails, Scenarios). Output one of:
   - PASS  — followed by one line on what you verified.
   - A numbered list of violations. For each: contract broken, impact,
     remediation path, regression test that would prevent it.
   - SPEC AMBIGUOUS — if the spec cannot decide the question. Name the gap.

   Do not edit any files. Do not propose alternative implementations beyond a
   one-line remediation pointer. Return your verdict only.
   ```

5. Relay the subagent's verdict verbatim to the user. Then suggest the next step:
   - `PASS` → `/ship <pbi-id>`
   - violations → `/build <pbi-id>` again, passing the violations as the failure feedback
   - `SPEC AMBIGUOUS` → `/spec update <domain>`

**Boundaries.** This command never edits code or specs. It only runs the review and reports the verdict.
