import { z } from "zod";
import { toolHandler } from "../client.js";
export function registerDashboardTools(server, client) {
    server.tool("list_dashboards", "List all dashboards in Superset. Returns dashboard titles, IDs, and status.", {
        page: z.number().optional().describe("Page number (0-indexed)"),
        page_size: z.number().optional().describe("Results per page (default 20)"),
        filter: z.string().optional().describe("Search filter on dashboard title"),
    }, async ({ page, page_size, filter }) => toolHandler(async () => {
        const q = { page: page ?? 0, page_size: page_size ?? 20 };
        if (filter) {
            q.filters = [{ col: "dashboard_title", opr: "ct", value: filter }];
        }
        const data = await client.get(`/api/v1/dashboard/?q=${encodeURIComponent(JSON.stringify(q))}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }));
    server.tool("get_dashboard", "Get detailed information about a specific dashboard by ID or slug.", { id_or_slug: z.string().describe("Dashboard ID or slug") }, async ({ id_or_slug }) => toolHandler(async () => {
        const data = await client.get(`/api/v1/dashboard/${id_or_slug}`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }));
    server.tool("get_dashboard_charts", "Get all charts contained in a dashboard.", { id_or_slug: z.string().describe("Dashboard ID or slug") }, async ({ id_or_slug }) => toolHandler(async () => {
        const data = await client.get(`/api/v1/dashboard/${id_or_slug}/charts`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }));
    server.tool("get_dashboard_datasets", "Get all datasets used by a dashboard.", { id_or_slug: z.string().describe("Dashboard ID or slug") }, async ({ id_or_slug }) => toolHandler(async () => {
        const data = await client.get(`/api/v1/dashboard/${id_or_slug}/datasets`);
        return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
    }));
    server.tool("export_dashboard", "Export dashboards as YAML/JSON bundle.", { ids: z.array(z.number()).describe("Array of dashboard IDs to export") }, async ({ ids }) => toolHandler(async () => {
        const params = ids.map((id) => `q=${id}`).join("&");
        const response = await client.fetch(`/api/v1/dashboard/export/?${params}`);
        const text = await response.text();
        return { content: [{ type: "text", text }] };
    }));
}
