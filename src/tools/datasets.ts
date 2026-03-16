import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SupersetClient, toolHandler } from "../client.js";

export function registerDatasetTools(server: McpServer, client: SupersetClient) {
  server.tool(
    "list_datasets",
    "List all datasets (tables) available in Superset.",
    {
      page: z.number().optional().describe("Page number (0-indexed)"),
      page_size: z.number().optional().describe("Results per page (default 20)"),
      filter: z.string().optional().describe("Search filter on dataset name"),
    },
    async ({ page, page_size, filter }) => toolHandler(async () => {
      const q: Record<string, unknown> = { page: page ?? 0, page_size: page_size ?? 20 };
      if (filter) {
        q.filters = [{ col: "table_name", opr: "ct", value: filter }];
      }
      const data = await client.get(`/api/v1/dataset/?q=${encodeURIComponent(JSON.stringify(q))}`);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }),
  );

  server.tool(
    "get_dataset",
    "Get dataset details including columns, metrics, and database info.",
    { id: z.number().describe("Dataset ID") },
    async ({ id }) => toolHandler(async () => {
      const data = await client.get(`/api/v1/dataset/${id}`);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    }),
  );
}
