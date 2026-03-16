import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export class SupersetClient {
  constructor(
    private baseUrl: string,
    private cookie: string,
  ) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async fetch(path: string, init?: RequestInit): Promise<Response> {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(init?.headers);
    headers.set("Cookie", this.cookie);
    headers.set("Content-Type", "application/json");
    headers.set("Accept", "application/json");
    headers.set("Referer", this.baseUrl);

    const response = await fetch(url, { ...init, headers });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Superset API error ${response.status}: ${body}`);
    }

    return response;
  }

  async get(path: string): Promise<any> {
    const response = await this.fetch(path);
    return response.json();
  }
}

export function toolHandler(fn: () => Promise<CallToolResult>): Promise<CallToolResult> {
  return fn().catch((error) => ({
    content: [{ type: "text" as const, text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
    isError: true,
  }));
}
