# Figviz MCP server

Generate clear, **labeled science & math diagrams** (biology, chemistry, physics,
K-12 math, lab setups, graphic organizers) straight from your AI assistant, via
the [Figviz](https://figviz.com) API.

Works with any [Model Context Protocol](https://modelcontextprotocol.io) client —
Claude Desktop, Cursor, Cline, Windsurf, and more.

## What it does

Exposes one tool:

- **`generate_diagram`** — describe a diagram in plain text and get back a hosted
  image URL. Options: `quality` (`1k` / `2k` / `4k`) and `aspectRatio`
  (e.g. `16:9`, `1:1`).

Example prompts:

- "labeled plant cell cross-section for 8th grade"
- "convex lens ray diagram, object between F and 2F"
- "acid–base titration setup for high school chemistry"
- "KWL chart graphic organizer, blank"

## Get an API key

Create a free key (includes 3 credits) at **https://figviz.com/settings/api**.
Figviz is pay-as-you-go — no subscription, credits never expire.

## Install

Run it with `npx` (no install needed):

```bash
FIGVIZ_API_KEY=fvk_xxx npx -y @figviz/figviz-mcp
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "figviz": {
      "command": "npx",
      "args": ["-y", "@figviz/figviz-mcp"],
      "env": { "FIGVIZ_API_KEY": "fvk_xxx" }
    }
  }
}
```

### Cursor / Cline / Windsurf

Add the same server entry to your client's MCP config (`mcp.json` or the MCP
settings UI):

```json
{
  "mcpServers": {
    "figviz": {
      "command": "npx",
      "args": ["-y", "@figviz/figviz-mcp"],
      "env": { "FIGVIZ_API_KEY": "fvk_xxx" }
    }
  }
}
```

Then ask your assistant: *"Use figviz to generate a labeled animal cell diagram
for 7th grade."*

## Environment variables

| Variable          | Required | Default              | Description                       |
| ----------------- | -------- | -------------------- | --------------------------------- |
| `FIGVIZ_API_KEY`  | yes      | —                    | Your `fvk_…` key from figviz.com  |
| `FIGVIZ_API_BASE` | no       | `https://figviz.com` | Override the API host (advanced)  |

## Credits & pricing

Each diagram costs 1 credit (4k costs 1.5). Buy credit packs at
https://figviz.com/pricing. The MCP shares the same balance as your Figviz
account.

## License

MIT
