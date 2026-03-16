import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
export declare class SupersetClient {
    private baseUrl;
    private cookie;
    constructor(baseUrl: string, cookie: string);
    fetch(path: string, init?: RequestInit): Promise<Response>;
    get(path: string): Promise<any>;
}
export declare function toolHandler(fn: () => Promise<CallToolResult>): Promise<CallToolResult>;
