import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { SupersetClient } from "../client.js";

export function registerDatabaseTools(server: McpServer, client: SupersetClient) {
  server.tool(
    "list_databases",
    "List all database connections configured in Superset.",
    {
      page: z.number().optional().describe("Page number (0-indexed)"),
      page_size: z.number().optional().describe("Results per page (default 20)"),
    },
    async ({ page, page_size }) => {
      const q = JSON.stringify({ page: page ?? 0, page_size: page_size ?? 20 });
      const data = await client.get(`/api/v1/database/?q=${encodeURIComponent(q)}`);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "get_database",
    "Get details of a specific database connection.",
    { id: z.number().describe("Database ID") },
    async ({ id }) => {
      const data = await client.get(`/api/v1/database/${id}`);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "list_database_schemas",
    "List all schemas in a database connection.",
    { id: z.number().describe("Database ID") },
    async ({ id }) => {
      const data = await client.get(`/api/v1/database/${id}/schemas/`);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    "list_database_tables",
    "List tables in a specific schema of a database connection.",
    {
      id: z.number().describe("Database ID"),
      schema: z.string().describe("Schema name"),
    },
    async ({ id, schema }) => {
      const data = await client.get(`/api/v1/database/${id}/tables/?q=${encodeURIComponent(JSON.stringify({ schema_name: schema }))}`);
      return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
    },
  );
}
