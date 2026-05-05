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

The pipeline is **Discover → Define → Spec → Assemble → Run**, with adversarial gates between phases.

**Personas** (`.claude/skills/`): `@Analyst`, `@Lead`, `@Dev`, `@Critic`. Each command loads only the persona(s) it needs.

**Slash commands** (`.claude/commands/`):

| Command | Phase | Purpose |
|---|---|---|
| `/discover` | Discover | Cluster a raw signal into a Problem Graph under `.specs/_intake/` |
| `/challenge` | Define gate | `@Critic` attacks the problem statement before any spec is written |
| `/spec` | Spec | `@Lead` writes/updates a living spec at `.specs/<domain>/spec.md` |
| `/plan` | Spec → Assemble | Decompose the spec into atomic, self-testable PBIs |
| `/build` | Assemble | `@Dev` implements one PBI; loops on lint + tsc + tests, max 10 iterations |
| `/review` | Assemble gate | Fresh-subagent adversarial code review against the spec |
| `/ship` | Acceptance | Human-approved PR open; the only command that touches remote |
| `/learn` | Run → Discover | Route production signals back into spec amendments or new intake |
| `/cheat-sheet` | — | Print the full reference card |

Run **`/cheat-sheet`** inside Claude Code for the canonical, always-up-to-date reference (gate semantics, typical end-to-end flow, persona rules).
