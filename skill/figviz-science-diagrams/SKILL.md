---
name: figviz-science-diagrams
description: Generate clear, labeled science and math diagrams (biology, chemistry, physics, K-12 math, lab setups, graphic organizers) from a text description. Use when the user asks to draw, illustrate, or create a diagram/figure for teaching, studying, worksheets, slides, or papers.
---

# Figviz — science & math diagrams

Generate labeled educational diagrams from plain-text descriptions using
[Figviz](https://figviz.com).

## Setup (once)

1. Get a free API key (3 credits included) at https://figviz.com/settings/api
2. Make the key available as the `FIGVIZ_API_KEY` environment variable.

Two ways to use it:

- **MCP (recommended):** install the `figviz-mcp` server and call its
  `generate_diagram` tool. See https://www.npmjs.com/package/figviz-mcp
- **Direct API:** `POST https://figviz.com/api/v1/generate`

## How to use

When the user asks for a science/math diagram or figure:

1. Turn the request into a precise prompt: name the **subject**, **grade level**,
   and what must be **labeled** (e.g. "labeled plant cell cross-section for 8th
   grade, label nucleus, chloroplast, vacuole, cell wall").
2. Call the tool / API.
3. Return the resulting image URL to the user (embed as markdown image).

### Direct API example

```bash
curl -X POST https://figviz.com/api/v1/generate \
  -H "Authorization: Bearer $FIGVIZ_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"labeled plant cell cross-section for 8th grade","quality":"2k","aspectRatio":"4:3"}'
```

Response:

```json
{
  "images": [{ "url": "https://cdn.figviz.io/...", "prompt": "..." }],
  "credits_used": 1,
  "credits_remaining": 2
}
```

## Parameters

- `prompt` (required): what to draw. Be specific about subject, grade, and labels.
- `quality`: `1k` | `2k` | `4k` (4k costs 1.5 credits; others 1).
- `aspectRatio`: e.g. `16:9`, `1:1`, `4:3` (omit for auto).

## Good prompt patterns

- Biology: "labeled <organelle/system> diagram for <grade>, cross-section"
- Chemistry: "<reaction/apparatus> setup for <level> chemistry, labeled"
- Physics: "<concept> diagram, <specific configuration>, labeled vectors"
- Math (K-12): "<manipulative> — e.g. number bond to 20, blank ten frame, area model"
- ELA organizers: "<organizer> graphic organizer, blank (KWL, Frayer, story map)"

## Notes

- Best for labeled diagrams, posters, organizers, and figures — not precise
  data-from-numbers charts or interactive editors.
- Each call spends credits from your Figviz balance; top up at
  https://figviz.com/pricing.
