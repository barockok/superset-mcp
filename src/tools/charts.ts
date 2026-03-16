import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SupersetClient, toolHandler } from "../client.js";

export function registerChartTools(server: McpServer, client: SupersetClient) {
  server.tool(
    "list_charts",
    "List all charts in Superset. Returns chart names, types, and IDs.",
    {
      page: z.number().optional().describe("Page number (0-indexed)"),
      page_size: z.number().optional().describe("Results per page (default 20)"),
      filter: z.string().optional().describe("Search filter on chart name"),
    },
    async ({ page, page_size, filter }) => toolHandler(async () => {
      const q: Record<string, unknown> = { page: page ?? 0, page_size: page_size ?? 20 };
      if (filter) {
        q.filters = [{ col: "slice_name", opr: "ct", value: filter }];
      }
      const data = await client.get(`/api/v1/chart/?q=${encodeURIComponent(JSON.stringify(q))}`);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }),
  );

  server.tool(
    "get_chart",
    "Get detailed information about a specific chart.",
    { id: z.number().describe("Chart ID") },
    async ({ id }) => toolHandler(async () => {
      const data = await client.get(`/api/v1/chart/${id}`);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }),
  );

  server.tool(
    "get_chart_data",
    "Fetch the underlying data for a chart by its ID.",
    { id: z.number().describe("Chart ID") },
    async ({ id }) => toolHandler(async () => {
      const data = await client.get(`/api/v1/chart/${id}/data/`);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }),
  );
}
