# Design Contract template

For widgets without a Figma reference. The Lead consults this when proposing a Visual Contract inside the spec's Blueprint. The learner reviews and approves before `/plan` runs.

The goal is to give the Lead concrete option sets to pick from so the spec contains real literals (colors, type scales, spacing) the way a Figma-driven spec would, rather than vague prose. Pick one option per section, don't list multiple.

## Platform chrome (already fixed)

These are owned by `src/app/layout.tsx` and **must not change** at the widget level. The widget's visuals must coexist on this background.

- **Page background:** `#030712`
- **Container max width:** `1280px`
- **Horizontal gutters:** `58.5px`
- **Top padding:** `32px`
- **Fonts available:** Geist (`--font-geist-sans`), Geist Mono (`--font-geist-mono`), Space Grotesk (`--font-space-grotesk`, weight 700), Inter (`--font-inter`, weight 400)

## Card surface (pick one)

| Option           | Background | Border              | Radius | Padding          |
| ---------------- | ---------- | ------------------- | ------ | ---------------- |
| **A — Standard** | `#101828`  | `1px solid #1E2939` | `10px` | `33px 33px 32px` |
| **B — Subtle**   | `#0F1623`  | `1px solid #1F2937` | `12px` | `24px`           |
| **C — Bold**     | `#111827`  | `2px solid #3B82F6` | `8px`  | `28px`           |

The pomodoro widget uses Option A; pick A unless you have a specific reason not to.

## Typography (pick one scale)

| Role                                  | Scale 1 (Pomodoro-aligned) | Scale 2 (Compact)          | Scale 3 (Editorial)        |
| ------------------------------------- | -------------------------- | -------------------------- | -------------------------- |
| **Page heading**                      | Space Grotesk Bold `36/40` | Space Grotesk Bold `28/32` | Space Grotesk Bold `48/56` |
| **Card title**                        | Space Grotesk Bold `24/32` | Space Grotesk Bold `20/24` | Space Grotesk Bold `32/40` |
| **Display value** (e.g. timer, score) | Space Grotesk Bold `60/60` | Space Grotesk Bold `48/48` | Space Grotesk Bold `72/72` |
| **Body**                              | Inter `16/24`              | Inter `14/20`              | Inter `18/28`              |
| **Subtitle / caption**                | Inter `16/24` `#99A1AF`    | Inter `12/16` `#99A1AF`    | Inter `16/24` `#99A1AF`    |

Page-heading gradient (used by widget showcase home): `linear-gradient(90deg, #51A2FF 0%, #AD46FF 100%)`.

## Spacing rhythm (pick one)

- **Rhythm 1 (8-grid, default):** `8px`, `16px`, `24px`, `32px`, `48px`, `64px`. Use `gap-[32px]` between major card sections, `gap-[16px]` for grouped controls.
- **Rhythm 2 (4-grid, dense):** `4px`, `8px`, `12px`, `20px`, `32px`. For information-dense widgets like dashboards.

Widget body padding: `33px 33px 32px` (Pomodoro-aligned) or `24px` (Compact).

## Color palette (pick a foreground)

The platform palette stays cool/dark. For the widget's **foreground** (primary action color, accent, focus):

- **Blue (default, Pomodoro-aligned):** `#3B82F6` for ring/accents, `#155DFC` for primary buttons, `#1E2939` for secondary buttons.
- **Violet:** `#8B5CF6` accent, `#7C3AED` primary, `#1E1B4B` secondary.
- **Teal:** `#14B8A6` accent, `#0D9488` primary, `#134E4A` secondary.
- **Amber:** `#F59E0B` accent, `#D97706` primary, `#451A03` secondary.

Track / disabled color across all palettes: `#1F2937`. Text on filled buttons: `#FFFFFF`. Text on dark surfaces: `#FFFFFF` for primary, `#99A1AF` for secondary, `#6B7280` for disabled.

## Buttons (pick one shape)

| Shape                            | Size              | Radius   | Notes                                            |
| -------------------------------- | ----------------- | -------- | ------------------------------------------------ |
| **A — Round (Pomodoro-aligned)** | `56×56`           | `10px`   | Icon-centered. `16px` gap between siblings.      |
| **B — Pill**                     | Auto width × `40` | `9999px` | Text + optional icon. `12px` horizontal padding. |
| **C — Rectangle**                | Auto width × `44` | `8px`    | Text-heavy actions.                              |

## Iconography

Use `lucide-react` (already a Next-friendly icon set). Default size `20px`, stroke width `2`. Decorative-only icons get `aria-hidden="true"`.

## Accessibility floor (non-negotiable)

These are not options — they must hold regardless of which palette/scale you picked.

- All interactive elements have a visible focus ring (`focus-visible:ring-2 focus-visible:ring-[<accent>]`).
- All buttons are real `<button>` elements with `type="button"` (or `submit` where appropriate). Decorative click-targets must be `aria-hidden="true"` and not focusable.
- Text contrast: foreground text vs its background passes WCAG AA (4.5:1 for body, 3:1 for ≥18px).
- Time-based widgets (timers, animations) respect `prefers-reduced-motion`.

---

## How the Lead uses this

When the intake has no Figma reference, the Lead:

1. Picks one option per section above (defaulting to the "Pomodoro-aligned" rows when in doubt — they harmonize with existing widgets).
2. Writes the chosen literals into the spec's Blueprint as a "Visual Contract (proposed)" subsection.
3. Marks the proposal `(proposed — confirm with learner)`.
4. After learner confirmation, drops the marker. The literals become binding for `@Dev` and `@Critic`.

The Lead does **not** invent values outside this template's option sets. If the learner wants something not covered here (a new palette, a non-grid spacing rhythm, etc.), the Lead surfaces it as a learner-decision point rather than guessing.
