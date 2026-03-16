#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { SupersetClient } from "./client.js";
import { registerDashboardTools } from "./tools/dashboards.js";
import { registerChartTools } from "./tools/charts.js";
import { registerSqlTools } from "./tools/sql.js";
import { registerDatasetTools } from "./tools/datasets.js";
import { registerDatabaseTools } from "./tools/databases.js";
function parseArgs(args) {
    let baseUrl;
    let cookie;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--base-url" && args[i + 1]) {
            baseUrl = args[++i];
        }
        else if (args[i] === "--cookie" && args[i + 1]) {
            cookie = args[++i];
        }
    }
    if (!baseUrl)
        throw new Error("Missing required argument: --base-url");
    if (!cookie)
        throw new Error("Missing required argument: --cookie");
    return { baseUrl, cookie };
}
async function main() {
    const { baseUrl, cookie } = parseArgs(process.argv.slice(2));
    const client = new SupersetClient(baseUrl, cookie);
    const server = new McpServer({
        name: "superset-mcp",
        version: "1.0.0",
    });
    registerDashboardTools(server, client);
    registerChartTools(server, client);
    registerSqlTools(server, client);
    registerDatasetTools(server, client);
    registerDatabaseTools(server, client);
    const transport = new StdioServerTransport();
    await server.connect(transport);
}
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
