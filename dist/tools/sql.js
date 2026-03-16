import { z } from "zod";
import { toolHandler } from "../client.js";
export function registerSqlTools(server, client) {
    server.tool("run_sql_query", "Execute a SQL query against a Superset database connection. Returns the query results.", {
        database_id: z.number().describe("Database connection ID to run the query against"),
        sql: z.string().describe("SQL query to execute"),
        schema: z.string().optional().describe("Schema to use"),
    }, async ({ database_id, sql, schema }) => toolHandler(async () => {
        // Fetch CSRF token for POST requests
        const csrf = await client.get("/api/v1/security/csrf_token/");
        const csrfToken = csrf.result;
        const response = await client.fetch("/api/v1/sqllab/execute/", {
            method: "POST",
            headers: { "X-CSRFToken": csrfToken },
            body: JSON.stringify({
                database_id,
                sql,
                schema: schema ?? null,
                runAsync: false,
                queryLimit: 1000,
            }),
        });
        const data = await response.json();
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }));
    server.tool("list_saved_queries", "List saved SQL queries.", {
        page: z.number().optional().describe("Page number (0-indexed)"),
        page_size: z.number().optional().describe("Results per page (default 20)"),
    }, async ({ page, page_size }) => toolHandler(async () => {
        const q = JSON.stringify({ page: page ?? 0, page_size: page_size ?? 20 });
        const data = await client.get(`/api/v1/saved_query/?q=${encodeURIComponent(q)}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }));
    server.tool("get_saved_query", "Get a saved SQL query by ID, including the SQL text.", { id: z.number().describe("Saved query ID") }, async ({ id }) => toolHandler(async () => {
        const data = await client.get(`/api/v1/saved_query/${id}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }));
}
