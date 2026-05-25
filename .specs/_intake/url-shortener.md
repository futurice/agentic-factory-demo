# Topic: URL shortener widget

## Sources

- **Learner signal (raw, this run, 2026-05-21)** — quoted verbatim:
  > "I want to build a URL shortener widget. The user pastes a long URL, hits a button, and gets a short link back that they can copy. Show the hostname next to the short code so they can see what they shortened. Keep it small — single input, a button, and the result below."
- `AGENTS.md` → "Requirements in a practice platform" — learner intent is the legitimate source of requirements.
- `src/app/widgets/` — no existing `url-shortener/` folder. Adjacent widgets for shape reference: `src/app/widgets/pomodoro/` (single-component client widget with `useState`).

## Patterns

### P1 — Core flow: paste → shorten → display (observation)

Quoted intent: _"the user pastes a long URL, hits a button, and gets a short link back that they can copy."_ Three discrete UI affordances on one card: an input field, a "Shorten" button, and a result row with a copy affordance.

### P2 — Hostname display alongside short code (observation)

Quoted intent: _"Show the hostname next to the short code so they can see what they shortened."_ The result row must surface the host portion of the input URL (e.g. `example.com`) adjacent to the generated short code. Implies the widget parses the input to extract hostname.

### P3 — Single self-contained widget (observation)

Maps cleanly to `src/app/widgets/url-shortener/` with one `page.tsx` server mount and one client component (`UrlShortenerCard.tsx`) holding interactive state. Constitution `rm -rf` deletability (`.specs/CONSTITUTION.md:9`, `:23`) is straightforward — no cross-widget imports needed.

### P4 — Persistence shape unstated (observation)

The signal says nothing about whether short codes persist across page reloads, or whether the same long URL always produces the same short code. Open Question 1.

### P5 — Short code shape unstated (observation)

The signal says "short link" / "short code" without specifying length, character set, or generation algorithm. Open Question 2.

### P6 — "Keep it small" — polish license implicit (observation)

Quoted intent: _"Keep it small — single input, a button, and the result below."_ Anchors the visual shape to a compact card; concrete typography/spacing/color choices defer to `@Lead` at `/spec` under the learner-as-stakeholder rule (`AGENTS.md` → Requirements in a practice platform).

## Open Questions

1. **Persistence model.** Should the short-code → long-URL mapping survive a page reload? Options: (a) session-only via in-memory `useState` — simplest, no persistence guarantees; (b) `localStorage` — survives reload but per-browser; (c) server-side store — out of scope for a single self-contained widget.
2. **Short code generation.** Random base62 characters, an incrementing counter, or a content-derived hash? What length (4? 6? 8?)?

## Candidate Problems

This list is the basis for **one bundled spec** in the `url-shortener` domain. `/plan` will decompose it into atomic PBIs.

- **C1. URL shortener widget with paste → shorten → display flow.** A single client component at `src/app/widgets/url-shortener/UrlShortenerCard.tsx`, mounted by a server `page.tsx`, with three rows: (a) input field for the long URL, (b) a "Shorten" button, (c) a result row showing the hostname extracted from the input alongside the generated short code, plus a copy-to-clipboard affordance. Resolves the learner's quoted intent (P1, P2, P3, P6). Persistence and code-generation shape are open (see Open Questions); both are learner-decidable defaults with no architectural cost either way.
