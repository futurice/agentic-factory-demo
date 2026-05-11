# ai-learning-path-agentic-demo

A minimal Next.js 16 + React 19 app used as a sandbox for demonstrating an **agentic software factory** workflow inside Claude Code.

The app itself is intentionally close to the `create-next-app` starter (App Router, Tailwind v4, Vitest, React Compiler enabled). The interesting part lives in `.claude/` and `.specs/`: a set of personas and slash commands that drive a phased, gated pipeline from raw signal to shipped PR.

## Stack

Next.js 16.2 (App Router) · React 19.2 + React Compiler · TypeScript 5 (strict) · Tailwind CSS v4 · Vitest 3 + Testing Library · ESLint 9 · Prettier 3.

```bash
npm run dev        # next dev
npm run lint       # eslint
npm run test:run   # vitest run  (the gate /build enforces)
npm run build      # next build
```

See [`AGENTS.md`](./AGENTS.md) for the full stack/convention briefing that Claude reads on every session.

## Agentic factory

The pipeline is the **agentic double diamond** — Diamond 1 (Problem Space) and Diamond 2 (Solution Space) — with adversarial gates between phases and a human-gated `/ship`. `/retro` closes a second loop, distilling each completed run into proposed amendments to the Constitution, AGENTS.md, personas, and templates.

**Personas** (`.claude/agents/`): `@Analyst`, `@Lead`, `@Dev`, `@Critic`. Each is a subagent dispatched via the Agent tool; tool allowlists enforce persona boundaries (e.g. `@Critic` has no Edit/Write).

**Slash commands** (`.claude/commands/`):

| Command           | Phase                           | Purpose                                                                            |
| ----------------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| `/discover`       | Discover (+ orchestrator)       | Cluster a raw signal into `.specs/_intake/`, then auto-chain the whole pipeline    |
| `/challenge`      | Define gate                     | `@Critic` attacks the problem statement before any spec is written                 |
| `/spec`           | Spec                            | `@Lead` writes/updates a living spec at `.specs/<domain>/spec.md`                  |
| `/plan`           | Spec → Assemble                 | Decompose the spec into atomic, self-testable PBIs                                 |
| `/challenge-plan` | Plan gate                       | `@Critic` attacks the PBI set (atomicity, isolation, coverage) before code         |
| `/build`          | Assemble                        | `@Dev` implements one PBI; loops on lint + tsc + tests, max 10 iterations          |
| `/review`         | Assemble gate                   | Fresh-subagent adversarial code review against spec + Constitution                 |
| `/ship`           | Acceptance                      | Human-approved PR open; the only command that touches remote                       |
| `/triage`         | Run → Discover (+ orchestrator) | Route production signals to spec amendment, regression guardrail, or new intake    |
| `/retro`          | Agent Optimization Loop         | After ship/stall, distill the pipeline into proposed amendments (diffs only)       |
| `/status`         | —                               | Read-only diagnostic: which artifacts exist, which PBIs are built/reviewed/shipped |
| `/cheat-sheet`    | —                               | Print the full reference card                                                      |

Run **`/cheat-sheet`** inside Claude Code for the canonical, always-up-to-date reference (gate semantics, typical end-to-end flow, persona rules).

## Example workflows

Three sketches of how the pipeline actually unfolds in practice. None of these are mandatory scripts — they're the orchestrator's default path, halted only by gate objections or the pre-`/ship` boundary.

### 1. Small feature — a Markdown scratchpad widget

A one-PBI widget. `/discover` auto-chains the entire pipeline.

```text
You:    /discover I want a widget that lets me type Markdown on the left
        and see the rendered HTML on the right. Local only, no persistence.

→ @Analyst writes .specs/_intake/markdown-scratchpad.md (Patterns, Open Questions, Candidate Problems)
→ /challenge runs — @Critic PASSes (scope is one widget, intent coherent)
→ Orchestrator asks: "domain name?"  → you reply: markdown-scratchpad
→ /spec create markdown-scratchpad   → .specs/markdown-scratchpad/spec.md
→ /plan markdown-scratchpad          → one or two PBIs under .specs/markdown-scratchpad/pbi/
→ /challenge-plan markdown-scratchpad → PASS
→ /build 01-render-pane              → Ralph loop: edit → lint → tsc → test:run (≤10 iters)
→ /review 01-render-pane             → PASS
→ HALT: "Ready to ship. Run /ship 01-render-pane when ready."

You:    /ship 01-render-pane   # human-gated; preflight + PR
```

Expect ~1 human touchpoint after the initial signal (the domain-name prompt) before the pre-ship boundary.

### 2. Larger feature with a design prompt — a Figma-driven dashboard

A multi-PBI widget whose source of truth is a Figma frame. The Analyst pulls visual context via the Figma desktop MCP rather than guessing.

```text
You:    /discover Build the "Today" dashboard from this Figma frame:
        https://www.figma.com/design/AbCd1234/Playground?node-id=42-117
        It should show greeting, three KPI tiles, and a recent-activity list.
        Static data is fine.

→ @Analyst extracts nodeId 42:117, calls mcp__figma-desktop__get_metadata /
   get_screenshot / get_design_context / get_variable_defs, cites the frame
   in .specs/_intake/today-dashboard.md
   (If the Figma MCP is not connected, it records the URL + an Open Question
    rather than inventing visuals.)
→ /challenge → may object: "KPI tile data source unspecified" → you clarify → re-run
→ /spec create today-dashboard       → spec.md captures layout, tokens from get_variable_defs, Gherkin
→ /plan today-dashboard              → multiple PBIs: 01-layout-shell, 02-kpi-tile, 03-activity-list, …
→ /challenge-plan → PASS or objections about atomicity/isolation
→ For each PBI in dependency order: /build → /review → next
→ HALT at pre-/ship boundary with the list of reviewed PBIs

You:    /ship 01-layout-shell        # ship PBIs individually as they land
```

Notes specific to design-driven runs:

- The Figma URL must include `node-id`; the Analyst translates `?node-id=42-117` → `42:117` before calling the MCP.
- If the MCP is not connected, the run continues but Sources will say "Figma MCP not connected — design content unavailable." Don't expect pixel-accurate output in that case.
- Design tokens surfaced by `get_variable_defs` belong in the spec's Contract, not hard-coded inline.

### 3. Bugfix — production signal via `/triage`

`/triage` is the Run-phase entry point. It routes the signal to one of three destinations; only "new intake" auto-chains into the full pipeline.

```text
You:    /triage Pomodoro timer drifts ~2s per minute when the tab is
        backgrounded in Chrome. Repro: start a 25-min session, switch
        tabs, return — clock is behind wall time.

→ @Analyst inspects .specs/pomodoro/spec.md and routes:
   • Spec amendment      → existing Contract is silent on backgrounding; drafts a diff
   • Regression guardrail → if this matches a previously-fixed bug, proposes a Gherkin scenario
   • New intake          → only if it's an unscoped problem

→ For a spec amendment (most bugs in an existing domain):
   /triage HALTs and surfaces the draft diff + suggests:
   "Run /spec update pomodoro to apply."

You:    /spec update pomodoro         → @Lead edits spec.md (Contract + Gherkin regression)
You:    /plan pomodoro                → new PBI, e.g. 14-background-clock-drift
You:    /build 14-background-clock-drift
You:    /review 14-background-clock-drift
You:    /ship 14-background-clock-drift
```

Why `/triage` halts on spec amendments: spec writes belong to `@Lead`, not the orchestrator. The same-commit rule (spec change ships with the code change that revealed it) means the fix and the amended Gherkin land together in `/build`'s commits.

If the routing comes back as **new intake** instead, `/triage` behaves exactly like `/discover` from that point on — chains through `/challenge` → `/spec` → … → pre-`/ship` boundary without further prompts.
