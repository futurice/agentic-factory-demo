# Topic: Basic app grid and Pomodoro timer

## Sources

- **Raw signal (learner intent, quoted):** "Implement basic app grid and pomodoro timer. Design available at https://www.figma.com/design/w28z2LVnu8xwN4B51vgORg/Untitled?node-id=1-3&m=dev"
- **Figma design (primary source):** node `1:3` in file `w28z2LVnu8xwN4B51vgORg` ("Untitled"), retrieved via the **Figma desktop MCP** on 2026-05-06. A rendered screenshot, layout metadata (`get_metadata`), and design context (`get_design_context`, no Figma variables defined — values are literals) were captured. Supersedes the prior "inaccessible" note (that was a WebFetch limitation, not a real access issue).
- **Repo state — current home route:** `/Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/src/app/page.tsx:1-69` — a Next.js starter splash (logo, h1, paragraph, two CTAs). No widgets directory exists yet.
- **Repo state — app tree:** `/Users/jesse.laanti/Documents/source/temp/ai-learning-path-agentic-demo/src/app/` contains `favicon.ico`, `globals.css`, `layout.tsx`, `page.tsx`. No `widgets/` folder exists.
- **Existing specs:** `.specs/styling/spec.md` (Tailwind-only migration, completed/in-flight). No prior `.specs/_intake/` entries — directory was created for this intake.
- **Architecture contract:** `AGENTS.md` → "Architecture" — widgets are self-contained at `src/app/widgets/<widget-name>/`; `src/app/page.tsx` is described as "Index / catalog of widgets" in the target shape. Duplicate freely; no shared `lib/` for widget logic; server components by default; deletable in one `rm -rf`.
- **Git context:** Branch `feat/pomodoro` (clean), recent merges focus on orchestration, architecture realignment, and styling. No prior pomodoro or grid work in history.

## Patterns

### P1 — Two distinct deliverables in one signal

- Source: signal text "basic app grid **and** pomodoro timer".
- Observation: The signal bundles (a) an app grid (catalog/index of widgets) and (b) a Pomodoro timer widget.
- Observation: The Figma (node `1:3`) shows only **one** widget card under a header — there is no multi-cell grid yet (see P9).
- Interpretation `(hypothesis)`: The "app grid" maps to the role `AGENTS.md` already assigns to `src/app/page.tsx` ("Index / catalog of widgets"). The Pomodoro is the first (and currently only) entry. Treating these as two candidate problems lets each be scoped (and challenged) independently — but the grid's value at one widget is essentially zero, which reshapes prioritization (see Candidate Problems).

### P2 — Architectural fit for a Pomodoro widget

- Source: `AGENTS.md` → Architecture: "Each widget lives in its own folder under `src/app/widgets/<widget-name>/` with its `page.tsx`, components, and tests colocated."
- Observation: A Pomodoro timer is a self-contained interactive widget — it cleanly satisfies the one-folder, deletable-in-one-`rm -rf` shape the platform optimizes for.
- Observation: The branch name `feat/pomodoro` aligns with this framing.
- Interpretation `(hypothesis)`: The natural target path is `src/app/widgets/pomodoro/page.tsx` plus colocated components/tests; the widget will need `"use client"` because timers require state and intervals.

### P3 — App grid is a structural change to the home route, not a widget

- Source: `AGENTS.md` → "Target shape": `src/app/page.tsx  # Index / catalog of widgets`.
- Source: current `src/app/page.tsx:5-66` is a starter splash, not a catalog.
- Source: Figma node `1:3` shows a "Widget Showcase" header (gradient text) with a subtitle paragraph above a single Pomodoro card.
- Observation: Implementing the home-route restructure means replacing the starter splash with a "Widget Showcase" header + the Pomodoro card. This is a one-time scaffolding change, not a per-widget concern.
- Interpretation `(hypothesis)`: At one widget, the "grid" is structurally a header + one card. Tile/grid layout decisions (columns, gaps, responsive breakpoints, empty state) cannot be evidenced from the design — only one cell exists.

### P4 — Visual contract from Figma node `1:3` (verbatim observations)

- Source: Figma desktop MCP — `get_metadata`, `get_design_context`, and rendered screenshot of node `1:3`, retrieved 2026-05-06. No Figma variables are defined; all values below are literals from the design.
- Observation — **layout/structure**:
  - App frame: `1397×1043` (canvas size, not max content width).
  - Container: `1280×598`, padding `32px` top, `58.5px` sides from app edge.
  - Header block: `1280×72`, contains "Heading 1" (40px tall) and "Paragraph" (24px tall), `8px` gap.
  - PomodoroTimer card: `410.66×478`, positioned at the left of the inner container.
  - Inside the card: settings button `36×36` (top-right), circular ring container `344.66×256`, button row with two `56×56` buttons, `16px` gap, centered.
- Observation — **design tokens** (literals, no Figma variables):
  - Page background: `#030712`.
  - Card background: `#101828`.
  - Card border: `1px solid #1E2939`.
  - Card radius: `10px`.
  - Card padding: `33px` (with a `1px` bottom adjustment).
  - Header gradient text: `linear-gradient(90deg, #51A2FF 0%, #AD46FF 100%)` clipped to text.
  - Subtitle color: `#99A1AF`.
  - Card title color: `#FFFFFF`.
  - Time display color: `#FFFFFF`.
  - Play button background: `#155DFC`.
  - Reset button background: `#1E2939`.
  - Button radius: `10px`.
- Observation — **typography**:
  - "Widget Showcase": Space Grotesk Bold, `36px` / line-height `40px`.
  - Subtitle: Inter Regular, `16px` / line-height `24px`, letter-spacing `−0.3125px`.
  - "Work Time": Space Grotesk Bold, `24px` / line-height `32px`.
  - "25:00": Space Grotesk Bold, `60px` / line-height `60px`, centered.
- Observation — **components present in node `1:3`**:
  - Settings gear icon (top-right of card).
  - Circular progress ring (two SVG arcs, blue, on a darker track — segmented look suggests progress visualization).
  - Play button with white triangle icon (`#155DFC` background).
  - Reset button with white circular-arrow icon (`#1E2939` background).
- Observation — **components NOT present in node `1:3`** (relevant for scope):
  - No long-break UI.
  - No cycle counter.
  - No audio/notification UI.
  - No second widget — the "grid" is currently one card.
  - No pause-state variant — only the initial `25:00` state is captured in this frame.
- Interpretation `(hypothesis)`: The visual contract is sufficient to write acceptance criteria for the initial (idle/start) state of the timer card and the home-page header. Pause-state, running-state, and completed-state visuals are not evidenced and would need either a follow-up Figma frame or a deliberate spec-phase decision.

### P5 — "Basic" is a scoping signal, not a specification

- Source: signal text "**basic** app grid and pomodoro timer".
- Source: Figma node `1:3` shows only Work Time (`25:00`), play, reset, and a settings gear — no break phase, no cycle counter, no alerts.
- Observation: The qualifier "basic" plus the design's minimal surface converges on a narrow feature set: a single work-time countdown with start/pause/reset, plus a settings affordance whose behaviour is not evidenced.
- Interpretation `(hypothesis)`: Long-break-after-4, audible alerts, persistence, keyboard shortcuts, drag-reorder, search, categories are out of scope unless re-introduced explicitly. The settings gear's target behaviour is the one ambiguity the design itself surfaces.

### P6 — Coupling between the two deliverables

- Source: signal pairs them in one sentence.
- Source: Figma node `1:3` renders the header and the card on the same frame.
- Observation: The Pomodoro widget is independently usable at its own route even without a home-page restructure. The home page only has something interesting to show once the Pomodoro exists.
- Interpretation `(hypothesis)`: Pomodoro-first is the natural order — the home-page restructure has nothing to display otherwise. Doing both in one spec is plausible because the design pairs them; doing them as two specs is also plausible — `@Lead` decides.

### P7 — Stack constraints already locked

- Source: `AGENTS.md` → Stack and Conventions; `next.config.ts` (React Compiler on); Tailwind v4 PostCSS pipeline (per `.specs/styling/spec.md`).
- Observation: Any implementation must use App Router only, Tailwind utilities (no CSS Modules), `@/*` alias, server components by default, no hand-written `useMemo`/`useCallback`, colocated `*.test.tsx`, and pass `lint` + `test:run` + `build`.
- Observation: The design uses Space Grotesk and Inter — neither is currently loaded. `layout.tsx` imports Geist and Geist Mono via `next/font/google`. Adding the design's typefaces is a `next/font/google` change to the root layout.
- Interpretation `(hypothesis)`: The Pomodoro's interactive parts will be a client component leaf inside an otherwise server `page.tsx`; the home page can remain a server component because the widget list is effectively static.

### P8 — No shared `lib/` or cross-widget primitives

- Source: `AGENTS.md` → Architecture: "Duplicate freely; do not DRY across widgets… `lib/` stays tiny and stable."
- Observation: A Pomodoro timer hook, time-formatting helper, or button primitive must live inside the widget folder, not in `src/lib/` or a shared `components/` directory.
- Observation: The design has no Figma variables/tokens defined — values are literals — so there's no design-system pressure to extract shared tokens.
- Interpretation `(hypothesis)`: Color/spacing/typography literals from P4 should be encoded as Tailwind utility values inline in the widget (and in the home page), not extracted into a shared theme file.

### P9 — There is no "grid" in the current Figma — it's a header + one card

- Source: Figma node `1:3` rendered screenshot and `get_metadata`: a `1280×598` container with a `1280×72` header block and a single `410.66×478` Pomodoro card positioned at the left of the inner container. No second card. No grid layout container.
- Source: `AGENTS.md` → Architecture target: `src/app/page.tsx  # Index / catalog of widgets`.
- Observation: The framing "app grid" in the original signal is premature against the design. With one widget, there is nothing grid-like to specify — no columns, no gaps, no responsive breakpoints, no tile chrome variations, no empty state evidenced.
- Observation: The header reads "Widget Showcase" (gradient), with a subtitle paragraph beneath — this is brand/landing chrome, not a grid layout.
- Interpretation `(hypothesis)`: The natural first deliverable is the Pomodoro widget plus a home-page restructure that places one card under a "Widget Showcase" header. A real multi-widget grid layout becomes specifiable only when a second widget exists or the design adds further frames; until then, "implement an app grid" overshoots the evidence.

## Open Questions

1. **Pomodoro scope — persistence.** Should running state survive a tab refresh or navigation? Survive a full reload via `localStorage`? The design alone cannot answer this.
2. **Pomodoro — settings gear behaviour.** The Figma shows a settings gear (top-right of the card) but no settings panel/modal frame. What does it open, and what is configurable? Without a second frame this is unsourced.
3. **Pomodoro — non-idle visual states.** Only the initial `25:00` state is in node `1:3`. What do running, paused, and completed states look like (ring fill, button swap, time formatting)?
4. **Pomodoro — break phase.** The design shows "Work Time" only. Is there a break phase at all? If yes, its visuals are unsourced; if no, "Pomodoro" reduces to a single-phase countdown.
5. **Accessibility floor.** Any a11y expectations beyond Testing Library defaults — e.g. screen-reader announcements on phase change, keyboard control of start/pause/reset, focus management for the settings gear?
6. **Typeface loading.** Space Grotesk and Inter are not currently loaded in `layout.tsx` (which uses Geist + Geist Mono). Confirm they should be added via `next/font/google`, replacing or supplementing the current fonts.
7. **Home route fate.** Does the "Widget Showcase" restructure replace `src/app/page.tsx`'s current starter splash entirely, or coexist? (Architecture target says `page.tsx` _is_ the index, which leans toward replace.)
8. **Future-grid shape.** When (or if) a second widget arrives, what becomes the layout — multi-column grid, responsive breakpoints, tile chrome? Out of scope now per P9, but worth flagging so the home-page restructure does not paint itself into a corner.

## Candidate Problems

- **C1 — Pomodoro timer widget at `src/app/widgets/pomodoro/`.** A self-contained Pomodoro widget: page + interactive timer component + colocated tests, deletable in one `rm -rf`, conforming to App Router + Tailwind + React Compiler conventions, and matching the visual contract in P4 for the idle state. This is the natural first deliverable — it has the most design evidence and is the only thing the home page would have to show. Open Questions 1, 2, 3, 4, 5 define the feature boundary; OQ6 (typefaces) is a prerequisite for visual fidelity.
- **C2 — Home route restructure to "Widget Showcase" header + one card.** Replace the Next.js starter splash in `src/app/page.tsx` with the header block from node `1:3` (gradient "Widget Showcase" + subtitle) and a single tile/link to the Pomodoro widget. Stays a server component; uses Tailwind utilities only; encodes the P4 literals inline. Resolves OQ7. Per P9, this is **not** an "app grid" — it is a header plus one card, sized against the design.
- **C3 — Future multi-widget grid (deferred).** A real grid layout — columns, gaps, responsive breakpoints, tile chrome variants, empty state — is unspecifiable from the current Figma (P9). Park as a separate, later candidate triggered by either (a) a second widget arriving or (b) a Figma frame that actually shows a multi-cell layout. Flag to `@Lead`; do not bundle into C1 or C2.
- **C4 — Visual fidelity gating (folded into C1/C2).** The design contract from P4 is now concrete enough to encode acceptance criteria for the idle Pomodoro card and the Widget Showcase header. Non-idle Pomodoro states (OQ3) and the settings panel (OQ2) remain visually unsourced and should either be deferred or filled in by a follow-up Figma frame before they are speccable.
