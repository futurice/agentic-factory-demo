# docs

## `workflow.png` / `workflow.mmd`

Visual representation of the full pipeline: both diamonds, the three loops (Ralph, Run-phase loopback, Agent Optimization), and the contract artifacts (Constitution, Design Contract template) feeding the gates.

The `.mmd` file is the source of truth; the `.png` is a render. To regenerate after editing `workflow.mmd`:

```sh
npx -y @mermaid-js/mermaid-cli@11 -i docs/workflow.mmd -o docs/workflow.png -b transparent -s 2
```

First run downloads `@mermaid-js/mermaid-cli` (~150 MB, includes Puppeteer + Chromium for rendering). Subsequent runs reuse the cache.

A slimmer orientation diagram lives inline in `AGENTS.md` — keep that one quick to read; this one is the full picture.
