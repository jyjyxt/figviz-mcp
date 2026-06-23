#!/usr/bin/env node
/**
 * Figviz MCP server.
 *
 * Exposes a `generate_diagram` tool so MCP clients (Claude Desktop, Cursor,
 * Cline, Windsurf, etc.) can generate labeled science & math diagrams from a
 * text description via the Figviz public API.
 *
 * Auth: set FIGVIZ_API_KEY (get a free key with 3 credits at
 * https://figviz.com/settings/api). Optional FIGVIZ_API_BASE overrides the host.
 */
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const API_BASE = (process.env.FIGVIZ_API_BASE ?? 'https://figviz.com').replace(
  /\/+$/,
  ''
);
const API_KEY = process.env.FIGVIZ_API_KEY;
const GET_KEY_URL = 'https://figviz.com/settings/api';
const PRICING_URL = 'https://figviz.com/pricing';

interface GenerateResponse {
  images?: { url: string; prompt: string }[];
  credits_used?: number;
  credits_remaining?: number;
  error?: string;
  code?: string;
}

const server = new McpServer({ name: 'figviz', version: '0.1.0' });

server.registerTool(
  'generate_diagram',
  {
    title: 'Generate a science or math diagram',
    description:
      'Generate a clear, labeled science or math diagram (biology, chemistry, physics, K-12 math, lab setups, graphic organizers) from a plain-text description using Figviz. Returns hosted image URL(s). Requires the FIGVIZ_API_KEY environment variable.',
    inputSchema: {
      prompt: z
        .string()
        .min(3)
        .describe(
          "What to draw, e.g. 'labeled plant cell cross-section for 8th grade' or 'convex lens ray diagram, object between F and 2F'"
        ),
      quality: z
        .enum(['1k', '2k', '4k'])
        .optional()
        .describe('Resolution. 4k costs 1.5 credits; 1k/2k cost 1. Default 1k.'),
      aspectRatio: z
        .string()
        .optional()
        .describe("Aspect ratio, e.g. '16:9', '1:1', '4:3'. Omit for auto."),
    },
  },
  async ({ prompt, quality, aspectRatio }) => {
    if (!API_KEY) {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: `FIGVIZ_API_KEY is not set. Get a free key (3 credits included) at ${GET_KEY_URL}, then set the FIGVIZ_API_KEY environment variable in your MCP client config.`,
          },
        ],
      };
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/generate`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({ prompt, quality, aspectRatio }),
      });

      const data = (await res.json().catch(() => null)) as GenerateResponse | null;

      if (!res.ok) {
        const base = data?.error ?? `Request failed (HTTP ${res.status}).`;
        let hint = '';
        if (res.status === 402) hint = ` Buy a credit pack at ${PRICING_URL}.`;
        else if (res.status === 401)
          hint = ` Check your FIGVIZ_API_KEY (get one at ${GET_KEY_URL}).`;
        return {
          isError: true,
          content: [{ type: 'text' as const, text: base + hint }],
        };
      }

      const images = data?.images ?? [];
      if (images.length === 0) {
        return {
          isError: true,
          content: [
            {
              type: 'text' as const,
              text: 'No image was generated. Try rephrasing the prompt with a clearer subject and grade level.',
            },
          ],
        };
      }

      const body = images
        .map((img) => `![${img.prompt}](${img.url})\n${img.url}`)
        .join('\n\n');
      const credits =
        typeof data?.credits_remaining === 'number'
          ? `\n\nCredits remaining: ${data.credits_remaining}`
          : '';

      return {
        content: [{ type: 'text' as const, text: `${body}${credits}` }],
      };
    } catch (err) {
      return {
        isError: true,
        content: [
          {
            type: 'text' as const,
            text: `Network error contacting Figviz: ${
              err instanceof Error ? err.message : String(err)
            }`,
          },
        ],
      };
    }
  }
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Logs go to stderr so they don't corrupt the stdio JSON-RPC stream.
  console.error('Figviz MCP server running on stdio');
}

main().catch((err) => {
  console.error('Fatal error starting Figviz MCP server:', err);
  process.exit(1);
});
