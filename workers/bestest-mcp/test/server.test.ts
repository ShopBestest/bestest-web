// End-to-end: drive the Worker's fetch handler in-process with the official MCP client over
// Streamable HTTP. The feed is replaced with the fixture, so no network is used.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import fixture from './fixture.json';
import { createHandler, type Env } from '../src/app.js';
import { normalizeFeed } from '../src/inventory.js';
import { FeedError, createInventoryLoader, resetFeedCache } from '../src/feed.js';

const env: Env = { FEED_URL: 'https://feed.test/', SITE_URL: 'https://shopbestest.com', FEED_CACHE_SECONDS: '300' };
const handler = createHandler({ loadInventory: async () => normalizeFeed(fixture) });
const workerFetch: typeof fetch = (input, init) => handler(new Request(input as RequestInfo, init), env);

const NOTE = /Every car listed passed Bestest's screen.*https:\/\/shopbestest\.com/;

type ToolResult = { content: { type: string; text?: string }[]; structuredContent?: any; isError?: boolean };

let client: Client;
const call = async (name: string, args: Record<string, unknown> = {}) =>
  (await client.callTool({ name, arguments: args })) as ToolResult;
const text = (r: ToolResult) => r.content.map((c) => c.text ?? '').join('\n');

beforeAll(async () => {
  client = new Client({ name: 'test-client', version: '0.0.0' });
  const transport = new StreamableHTTPClientTransport(new URL('https://mcp.test/mcp'), { fetch: workerFetch });
  await client.connect(transport);
});
afterAll(async () => {
  await client.close();
});

describe('HTTP surface', () => {
  it('serves a health document and 404s elsewhere', async () => {
    const res = await workerFetch('https://mcp.test/');
    expect(res.status).toBe(200);
    const body: any = await res.json();
    expect(body.tools).toEqual(['search_cars', 'get_car', 'list_segments']);
    expect(body.mcp_endpoint).toBe('https://mcp.test/mcp');
    expect((await workerFetch('https://mcp.test/nope')).status).toBe(404);
  });
  it('answers CORS preflight', async () => {
    const res = await workerFetch('https://mcp.test/mcp', { method: 'OPTIONS' });
    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('*');
    expect(res.headers.get('access-control-allow-headers')).toContain('mcp-session-id');
  });
  it('serves the OpenAI domain challenge only when configured', async () => {
    expect((await workerFetch('https://mcp.test/.well-known/openai-apps-challenge')).status).toBe(404);
    const res = await handler(new Request('https://mcp.test/.well-known/openai-apps-challenge'), { ...env, OPENAI_APPS_CHALLENGE: 'tok123' });
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('tok123');
  });
  it('answers GET and DELETE on /mcp with 405 (stateless, POST only)', async () => {
    const get = await workerFetch('https://mcp.test/mcp', { headers: { accept: 'text/event-stream' } });
    expect(get.status).toBe(405);
    expect(get.headers.get('allow')).toContain('POST');
    expect((await workerFetch('https://mcp.test/mcp', { method: 'DELETE' })).status).toBe(405);
  });
});

describe('MCP handshake', () => {
  it('reports server info and three read-only tools with titles and annotations', async () => {
    expect(client.getServerVersion()?.name).toBe('bestest');
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(['get_car', 'list_segments', 'search_cars']);
    for (const t of tools) {
      expect(t.title, t.name).toBeTruthy();
      expect(t.annotations?.readOnlyHint, t.name).toBe(true);
      expect(t.annotations?.destructiveHint, t.name).toBe(false);
      expect(t.name.length).toBeLessThanOrEqual(64);
      expect(t.description).toMatch(/screen|qualif|approved/i);
      expect(t.description).not.toMatch(/only \d|more coming/i);
    }
    const search = tools.find((t) => t.name === 'search_cars')!;
    expect(Object.keys(search.inputSchema.properties ?? {})).toEqual(
      expect.arrayContaining(['segment', 'make', 'model', 'powertrain', 'max_price', 'max_miles', 'min_year', 'zip', 'radius_miles', 'sort', 'limit'])
    );
  });
});

describe('search_cars', () => {
  it('returns qualifying cars with title, price, miles, dealer, VDP link and verbatim image', async () => {
    const r = await call('search_cars', { segment: 'Compact SUV', sort: 'price' });
    expect(r.isError).toBeFalsy();
    expect(r.structuredContent.total).toBe(5);
    const first = r.structuredContent.cars[0];
    expect(first.title).toBe('2021 Honda CR-V');
    expect(first.price).toBe(26800);
    expect(first.miles).toBe(31000);
    expect(first.dealer).toBe('Norm Reeves Honda Irvine');
    expect(first.dealer_city).toBe('Irvine');
    expect(first.url).toBe('https://shopbestest.com/used/2021-honda-cr-v-ex-l-1003');
    expect(first.image_url).toBe('https://res.cloudinary.com/bestest/image/upload/w_800/crv-1003.jpg');
    expect(first.distance_miles).toBeNull();
    const t = text(r);
    expect(t).toMatch(/5 screened cars qualify/);
    expect(t).toContain('https://shopbestest.com/used/2021-honda-cr-v-ex-l-1003');
    expect(t).toMatch(NOTE);
    expect(r.structuredContent.note).toMatch(NOTE);
  });

  it('adds distance and sorts nearest first when a zip is given', async () => {
    const r = await call('search_cars', { zip: '92868', radius_miles: 15 });
    expect(r.isError).toBeFalsy();
    expect(r.structuredContent.sort).toBe('distance');
    const d = r.structuredContent.cars.map((c: any) => c.distance_miles);
    expect(d.every((x: number) => typeof x === 'number')).toBe(true);
    expect(d).toEqual([...d].sort((a: number, b: number) => a - b));
    expect(r.structuredContent.cars.map((c: any) => c.id)).not.toContain('1008');
    expect(text(r)).toMatch(/mi away/);
  });

  it('respects limit and offset', async () => {
    const r = await call('search_cars', { limit: 2, offset: 2 });
    expect(r.structuredContent.cars).toHaveLength(2);
    expect(r.structuredContent.total).toBe(10);
    expect(text(r)).toMatch(/Showing 3–4/);
  });

  it('rejects a limit over 20 at the schema level', async () => {
    const r = await call('search_cars', { limit: 50 });
    expect(r.isError).toBe(true);
  });

  it('accepts a numeric zip (some clients coerce digits to numbers)', async () => {
    const r = await call('search_cars', { zip: 92868, limit: 1 });
    expect(r.isError).toBeFalsy();
    expect(r.structuredContent.cars[0].distance_miles).not.toBeNull();
  });

  it('explains bad or uncovered zips', async () => {
    expect((await call('search_cars', { zip: '123' })).isError).toBe(true);
    const far = await call('search_cars', { zip: '10001' });
    expect(far.isError).toBe(true);
    expect(text(far)).toMatch(/outside the area/);
    expect((await call('search_cars', { sort: 'distance' })).isError).toBe(true);
  });

  it('empty results use approved wording, never "only"', async () => {
    const r = await call('search_cars', { make: 'Toyota', max_price: 5000 });
    expect(r.isError).toBeFalsy();
    expect(r.structuredContent.total).toBe(0);
    const t = text(r);
    expect(t).toMatch(/No screened cars currently qualify/);
    expect(t).not.toMatch(/\bonly\b/i);
    expect(t).toMatch(NOTE);
  });

  it('unknown and ambiguous segments return actionable errors', async () => {
    const unknown = await call('search_cars', { segment: 'spaceship' });
    expect(unknown.isError).toBe(true);
    expect(text(unknown)).toMatch(/Valid segments/);
    const amb = await call('search_cars', { segment: 'luxury' });
    expect(amb.isError).toBe(true);
    expect(text(amb)).toMatch(/matches several segments/);
  });

  it('never fabricates Cloudinary transformations', async () => {
    const r = await call('search_cars', { limit: 20 });
    const imgs = r.structuredContent.cars.map((c: any) => c.image_url);
    const feedImgs = new Set(fixture.map((f) => f.img));
    for (const u of imgs) expect(feedImgs.has(u)).toBe(true);
  });
});

describe('get_car', () => {
  it('finds by slug and by id and includes the VDP link and photo', async () => {
    const bySlug = await call('get_car', { slug: '2023-toyota-rav4-prime-se-1006' });
    expect(bySlug.isError).toBeFalsy();
    expect(bySlug.structuredContent.car.url).toBe('https://shopbestest.com/used/2023-toyota-rav4-prime-se-1006');
    expect(bySlug.structuredContent.car.certified_pre_owned).toBe(true);
    expect(text(bySlug)).toContain('Photo: https://res.cloudinary.com/bestest/image/upload/w_800/rav4prime-1006.jpg');
    expect(text(bySlug)).toMatch(NOTE);
    const byId = await call('get_car', { id: '1007' });
    expect(byId.structuredContent.car.slug).toBe('2021-lexus-rx-350-1007');
  });
  it('adds distance when a zip is given', async () => {
    const r = await call('get_car', { id: '1008', zip: '92868' });
    expect(r.structuredContent.car.distance_miles).toBeGreaterThan(40);
    expect(text(r)).toMatch(/Distance: \d+ mi away/);
  });
  it('errors clearly for a missing car or missing key', async () => {
    const r = await call('get_car', { slug: 'sold-car' });
    expect(r.isError).toBe(true);
    expect(text(r)).toMatch(/may have sold/);
    expect((await call('get_car', {})).isError).toBe(true);
  });
});

describe('list_segments', () => {
  it('lists segments with counts, price ranges and site links', async () => {
    const r = await call('list_segments');
    expect(r.isError).toBeFalsy();
    const segs = r.structuredContent.segments;
    const compact = segs.find((s: any) => s.segment === 'Compact SUV');
    expect(compact).toMatchObject({ count: 5, min_price: 26800, max_price: 39900, url: 'https://shopbestest.com/used-cars/best-used-compact-suvs' });
    expect(r.structuredContent.total_cars).toBe(10);
    expect(text(r)).toMatch(/Compact SUV: 5 screened cars, \$26,800–\$39,900/);
    expect(text(r)).toMatch(NOTE);
  });
});

describe('feed loader', () => {
  it('caches within the TTL and serves stale on upstream failure', async () => {
    resetFeedCache();
    let calls = 0;
    let fail = false;
    const fetchImpl = (async () => {
      calls++;
      if (fail) return new Response('boom', { status: 503 });
      return new Response(JSON.stringify(fixture), { headers: { 'content-type': 'application/json' } });
    }) as unknown as typeof fetch;
    const load = createInventoryLoader({ FEED_URL: 'https://feed.test/', FEED_CACHE_SECONDS: '300' }, fetchImpl);
    expect((await load()).length).toBe(10);
    expect((await load()).length).toBe(10);
    expect(calls).toBe(1);
    resetFeedCache();
    fail = true;
    await expect(load()).rejects.toBeInstanceOf(FeedError);
  });

  it('surfaces a friendly tool error when the feed is down', async () => {
    const down = createHandler({ loadInventory: async () => { throw new FeedError('HTTP 503'); } });
    const c = new Client({ name: 't', version: '0' });
    await c.connect(new StreamableHTTPClientTransport(new URL('https://mcp.test/mcp'), { fetch: (i, init) => down(new Request(i as RequestInfo, init), env) }));
    const r = (await c.callTool({ name: 'list_segments', arguments: {} })) as ToolResult;
    expect(r.isError).toBe(true);
    expect(text(r)).toMatch(/temporarily unavailable/);
    await c.close();
  });
});
