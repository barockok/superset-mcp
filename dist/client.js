export class SupersetClient {
    baseUrl;
    cookie;
    constructor(baseUrl, cookie) {
        this.baseUrl = baseUrl;
        this.cookie = cookie;
        this.baseUrl = baseUrl.replace(/\/+$/, "");
    }
    async fetch(path, init) {
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
    async get(path) {
        const response = await this.fetch(path);
        return response.json();
    }
}
export function toolHandler(fn) {
    return fn().catch((error) => ({
        content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
    }));
}
