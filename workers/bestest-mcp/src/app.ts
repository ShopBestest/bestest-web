// HTTP routing: the MCP transport plus a few plain endpoints. src/index.ts is the Worker entry
// and exports only the default handler (workerd rejects other kinds of exports from the entry).
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
import { createInventoryLoader, type FeedEnv, type InventoryLoader } from './feed.js';
import { zipCount } from './geo.js';
import { SERVER_VERSION, createMcpServer } from './mcp.js';

export interface Env extends FeedEnv {
  SITE_URL?: string;
  OPENAI_APPS_CHALLENGE?: string;
}

export const MCP_PATH = '/mcp';

const CORS_HEADERS: Record<string, string> = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET, POST, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, accept, authorization, mcp-session-id, mcp-protocol-version, last-event-id',
  'access-control-expose-headers': 'mcp-session-id, mcp-protocol-version',
  'access-control-max-age': '86400'
};

function withCors(res: Response): Response {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);
  return new Response(res.body, { status: res.status, statusText: res.statusText, headers });
}

function json(body: unknown, status = 200, extraHeaders: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...extraHeaders }
  });
}

export interface HandlerOptions {
  /** Override the feed loader (tests inject a fixture). */
  loadInventory?: InventoryLoader;
}

/** Build the Worker's fetch handler. Exported so tests can run it in-process. */
export function createHandler(opts: HandlerOptions = {}) {
  return async (request: Request, env: Env): Promise<Response> => {
    const url = new URL(request.url);
    const siteUrl = env.SITE_URL || 'https://shopbestest.com';
    const path = url.pathname.replace(/\/+$/, '') || '/';

    if (request.method === 'OPTIONS') return withCors(new Response(null, { status: 204 }));

    if (path === MCP_PATH) {
      // Stateless server: there are no server-initiated messages, so a standalone GET stream
      // has nothing to carry. The spec allows 405 here; it also keeps idle SSE connections
      // from pinning Worker invocations.
      if (request.method !== 'POST') {
        return withCors(json({ error: 'method not allowed', hint: 'POST JSON-RPC to this endpoint' }, 405, { allow: 'POST, OPTIONS' }));
      }
      const loadInventory = opts.loadInventory ?? createInventoryLoader(env);
      // Stateless: a fresh server + transport per request. The Worker holds no session
      // state, so any edge location can answer any request.
      const server = createMcpServer({ loadInventory, siteUrl });
      const transport = new WebStandardStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      await server.connect(transport);
      // handleRequest resolves as soon as the response stream is open; the JSON-RPC reply is
      // written to it afterwards, so the transport must not be closed here. Both objects are
      // per-request and are collected once the stream ends.
      return withCors(await transport.handleRequest(request));
    }

    if (path === '/' || path === '/health') {
      return withCors(
        json({
          name: 'bestest-mcp',
          status: 'ok',
          version: SERVER_VERSION,
          mcp_endpoint: `${url.origin}${MCP_PATH}`,
          transport: 'streamable-http',
          auth: 'none',
          tools: ['search_cars', 'get_car', 'list_segments'],
          zip_table_size: zipCount(),
          site: siteUrl,
          note: 'Every car this server returns passed Bestest\'s screen.'
        })
      );
    }

    // OpenAI directory domain verification token (see README).
    if (path === '/.well-known/openai-apps-challenge') {
      const token = (env.OPENAI_APPS_CHALLENGE || '').trim();
      if (!token) return new Response('not configured', { status: 404, headers: { 'content-type': 'text/plain' } });
      return new Response(token, { status: 200, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }

    if (path === '/privacy' || path === '/terms') {
      return Response.redirect(`${siteUrl.replace(/\/$/, '')}${path}`, 302);
    }

    return withCors(json({ error: 'not found', mcp_endpoint: `${url.origin}${MCP_PATH}` }, 404));
  };
}

