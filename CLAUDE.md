# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

An MCP (Model Context Protocol) server that exposes Apache Superset's REST API as typed tools. Uses cookie-based authentication via CLI arguments.

## Commands

```bash
npm run build          # Compile TypeScript to dist/
npm run dev            # Run in development with tsx
npm start              # Run compiled output
npx tsc --noEmit       # Type-check without emitting
```

The server requires two CLI arguments:
```bash
node dist/index.js --base-url https://superset.example.com --cookie "session=abc123"
```

## Architecture

```
src/
  index.ts          — Entry point: CLI arg parsing, McpServer setup, stdio transport
  client.ts         — SupersetClient: fetch wrapper injecting Cookie header on every request
  tools/
    dashboards.ts   — list_dashboards, get_dashboard, get_dashboard_charts, get_dashboard_datasets, export_dashboard
    charts.ts       — list_charts, get_chart, get_chart_data
    sql.ts          — run_sql_query (with CSRF token fetch), list_saved_queries, get_saved_query
    datasets.ts     — list_datasets, get_dataset
    databases.ts    — list_databases, get_database, list_database_schemas, list_database_tables
```

**Key patterns:**
- Each tool file exports a `register*Tools(server, client)` function called from `index.ts`
- Tools use Zod schemas for parameter validation
- All tools return `{ content: [{ type: "text", text: JSON.stringify(data, null, 2) }] }`
- Superset's list endpoints use a `q` query parameter with JSON-encoded filter/pagination objects
- `run_sql_query` must fetch a CSRF token from `/api/v1/security/csrf_token/` before POSTing to `/api/v1/sqllab/execute/`

## MCP Client Configuration

```json
{
  "mcpServers": {
    "superset": {
      "command": "node",
      "args": ["dist/index.js", "--base-url", "https://superset.example.com", "--cookie", "session=abc123"]
    }
  }
}
```

## Superset API

All endpoints are under `/api/v1/`. Key patterns:
- List: `GET /api/v1/{resource}/?q={encoded_json}`
- Get: `GET /api/v1/{resource}/{id}`
- Schemas: `GET /api/v1/database/{id}/schemas/`
- Tables: `GET /api/v1/database/{id}/tables/?q={encoded_json}`
- SQL execute: `POST /api/v1/sqllab/execute/` (requires X-CSRFToken header)
