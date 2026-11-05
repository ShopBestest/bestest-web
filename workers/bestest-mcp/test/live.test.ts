// Assertions against real records from the live inventory feed (pulled 2026-11-04, trimmed to
// the fields the server reads). Catches drift between the feed's real shape and the code.
// Refresh: curl the FEED_URL, pick ~50 records across segments and powertrains, keep these keys.
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import live from './fixture-live.json';
import { createHandler, type Env } from '../src/app.js';
import {
  SEGMENT_PATHS,
  findCar,
  listSegments,
  normalizeFeed,
  powertrainClass,
  powertrainLabel,
  resolveSegment,
  searchCars,
  uniqueSegments
} from '../src/inventory.js';
import { lookupZip } from '../src/geo.js';
import { displayName } from '../src/mcp.js';

const cars = normalizeFeed(live);
const origin = lookupZip('92868')!;

describe('live feed: normalization', () => {
  it('keeps every record and fills every field the server reads', () => {
    expect(Array.isArray(live)).toBe(true); // feed is a bare JSON array, not wrapped
    expect(cars.length).toBe(live.length);
    for (const c of cars) {
      expect(c.id).toMatch(/^[A-Z0-9]{17}-[0-9a-f]+-[0-9a-f]+$/); // VIN-hash-hash
      expect(c.slug).toMatch(/^\d{4}-[a-z0-9-]+-[a-z0-9]{6}$/); // year-make-model-trim-last6
      expect(c.slug.startsWith(String(c.year))).toBe(true);
      expect(c.year).toBeGreaterThan(2000);
      expect(c.make && c.model && c.trim && c.title).toBeTruthy();
      expect(c.price).toBeGreaterThan(0);
      expect(c.miles).toBeGreaterThan(0);
      expect(c.dealer && c.city && c.segment && c.body).toBeTruthy();
      expect(typeof c.lat).toBe('number');
      expect(typeof c.lng).toBe('number');
      expect(c.image).toMatch(/^https:\/\/(res\.cloudinary\.com|cdn\.prod\.website-files\.com)\//); // Cloudinary fetch URL or Webflow CDN
      expect(c.firstSeen).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
  it('titles are "{year} {make} {model} ..." and displayName does not repeat trim words', () => {
    for (const c of cars) {
      expect(c.title.startsWith(`${c.year} ${c.make} ${c.model}`)).toBe(true);
      const shown = displayName(c.title, c.trim).toLowerCase().split(' ');
      expect(new Set(shown).size).toBe(shown.length);
    }
    expect(displayName('2023 Kia Sportage Hybrid LX', 'LX Hybrid')).toBe('2023 Kia Sportage Hybrid LX');
    expect(displayName('2023 Hyundai Santa Fe Hybrid Limited', 'Limited HEV')).toBe('2023 Hyundai Santa Fe Hybrid Limited');
  });
  it('reads cpo as 1 or absent', () => {
    expect(cars.some((c) => c.certified)).toBe(true);
    expect(cars.some((c) => !c.certified)).toBe(true);
  });
});

describe('live feed: segments', () => {
  it('every feed segment has a site page', () => {
    for (const s of uniqueSegments(cars)) expect(SEGMENT_PATHS[s], s).toBeTruthy();
    expect(uniqueSegments(cars).length).toBe(17);
  });
  it('lists Electric Vehicles once (it is a real sg) and Hybrids as virtual with plug-ins', () => {
    const segs = listSegments(cars);
    const names = segs.map((s) => s.segment);
    expect(new Set(names).size).toBe(names.length);
    const ev = segs.find((s) => s.segment === 'Electric Vehicles')!;
    expect(ev.virtual).toBe(false);
    expect(ev.count).toBe(cars.filter((c) => c.segment === 'Electric Vehicles').length);
    const hy = segs.find((s) => s.segment === 'Hybrids')!;
    expect(hy.virtual).toBe(true);
    expect(hy.count).toBe(cars.filter((c) => ['Hybrid', 'PHEV'].includes(c.powertrain)).length);
    for (const s of segs) expect(s.path).toBeTruthy();
  });
  it('resolves shorthand to live segment names', () => {
    const known = uniqueSegments(cars);
    expect(resolveSegment('compact suv', known)).toBe('Compact SUV');
    expect(resolveSegment('EVs', known)).toBe('Electric Vehicles');
    expect(resolveSegment('hybrids', known)).toBe('Hybrids');
    expect(resolveSegment('minivan', known)).toBe('Minivan');
    expect(resolveSegment('midsize truck', known)).toBe('Compact/Midsize Truck');
    expect(() => resolveSegment('luxury', known)).toThrow(/several segments/);
  });
});

describe('live feed: powertrain buckets', () => {
  it('maps the live vocabulary (Combustion, MHEV, Hybrid, PHEV, EV, null)', () => {
    const seen = new Set(live.map((r) => r.pt ?? null));
    for (const pt of ['Combustion', 'MHEV', 'Hybrid', 'PHEV', 'EV', null]) expect(seen.has(pt as any)).toBe(true);
    expect(powertrainClass('Combustion')).toBe('gas');
    expect(powertrainClass('MHEV')).toBe('gas'); // site treats mild hybrids as gas
    expect(powertrainClass('Hybrid')).toBe('hybrid');
    expect(powertrainClass('PHEV')).toBe('plug-in hybrid');
    expect(powertrainClass('EV')).toBe('electric');
    expect(powertrainClass('')).toBe('gas');
    expect(powertrainLabel('MHEV')).toBe('Gas (mild hybrid)');
    expect(powertrainLabel('Combustion')).toBe('Gas');
  });
  it('every EV sits in the Electric Vehicles segment', () => {
    for (const c of cars.filter((c) => c.powertrain === 'EV')) expect(c.segment).toBe('Electric Vehicles');
  });
  it('"CR-V Hybrid" finds hybrid CR-Vs even though model is "CR-V" and trim is "Sport"', () => {
    const r = searchCars(cars, { make: 'Honda', model: 'CR-V Hybrid', limit: 20 });
    expect(r.total).toBeGreaterThan(0);
    for (const c of r.cars) expect(c.powertrain).toBe('Hybrid');
    const all = searchCars(cars, { make: 'Honda', model: 'CR-V', limit: 20 });
    expect(all.total).toBeGreaterThan(r.total);
  });
});

describe('live feed: radius search from 92868', () => {
  it('distance-sorts by default, respects the radius, and every car has a distance', () => {
    const r = searchCars(cars, { origin, radius_miles: 25, limit: 20 });
    expect(r.sort).toBe('distance');
    expect(r.total).toBeGreaterThan(0);
    const d = r.cars.map((c) => c.distance_miles!);
    expect(d.every((x) => x != null && x <= 25)).toBe(true);
    expect([...d].sort((a, b) => a - b)).toEqual(d);
    const tight = searchCars(cars, { origin, radius_miles: 5, limit: 20 });
    expect(tight.total).toBeLessThan(r.total);
    expect(tight.cars.every((c) => c.distance_miles! <= 5)).toBe(true);
  });
  it('combines hybrid + max_price + distance sort', () => {
    const r = searchCars(cars, { origin, radius_miles: 25, powertrain: 'hybrid', max_price: 40000, sort: 'distance', limit: 20 });
    for (const c of r.cars) {
      expect(c.powertrain).toBe('Hybrid');
      expect(c.price).toBeLessThanOrEqual(40000);
    }
  });
});

describe('live feed: findCar', () => {
  const c = cars.find((x) => x.make === 'Honda' && x.model === 'CR-V')!;
  it('finds by slug, id, and VDP URL (with query string or trailing slash)', () => {
    expect(findCar(cars, c.slug)?.id).toBe(c.id);
    expect(findCar(cars, c.id)?.slug).toBe(c.slug);
    expect(findCar(cars, c.id.toLowerCase())?.slug).toBe(c.slug);
    expect(findCar(cars, `https://shopbestest.com/used/${c.slug}`)?.id).toBe(c.id);
    expect(findCar(cars, `https://shopbestest.com/used/${c.slug}/`)?.id).toBe(c.id);
    expect(findCar(cars, `https://shopbestest.com/used/${c.slug}?utm_source=chatgpt.com`)?.id).toBe(c.id);
    expect(findCar(cars, 'does-not-exist')).toBeNull();
  });
});

// In-process MCP round trip over the live records: wording guardrails and readOnlyHint.
const env: Env = { FEED_URL: 'https://feed.test/', SITE_URL: 'https://shopbestest.com', FEED_CACHE_SECONDS: '300' };
const handler = createHandler({ loadInventory: async () => normalizeFeed(live) });
const workerFetch: typeof fetch = (input, init) => handler(new Request(input as RequestInfo, init), env);
type ToolResult = { content: { type: string; text?: string }[]; structuredContent?: any; isError?: boolean };
let client: Client;
const call = async (name: string, args: Record<string, unknown> = {}) =>
  (await client.callTool({ name, arguments: args })) as ToolResult;
const text = (r: ToolResult) => r.content.map((c) => c.text ?? '').join('\n');
const BANNED = /only \d|\bonly (one|two|three|a few)\b|more coming|coming soon/i;

beforeAll(async () => {
  client = new Client({ name: 'live-test-client', version: '0.0.0' });
  await client.connect(new StreamableHTTPClientTransport(new URL('https://mcp.test/mcp'), { fetch: workerFetch }));
});
afterAll(async () => {
  await client.close();
});

describe('live feed: tools and wording guardrails', () => {
  it('every tool is read-only', async () => {
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual(['get_car', 'list_segments', 'search_cars']);
    for (const t of tools) expect(t.annotations?.readOnlyHint).toBe(true);
  });
  it('responses use screened/qualify wording, shopper powertrain labels, and no scarcity talk', async () => {
    const results = [
      await call('list_segments'),
      await call('search_cars', { zip: '92868', radius_miles: 25 }),
      await call('search_cars', { segment: 'Hybrids', zip: '92868' }),
      await call('search_cars', { make: 'Honda', model: 'CR-V Hybrid' }),
      await call('search_cars', { segment: 'Minivan', max_price: 1000 }),
      await call('get_car', { slug: cars[0].slug })
    ];
    for (const r of results) {
      const t = text(r);
      expect(t).toMatch(/screen/i);
      expect(t).not.toMatch(BANNED);
      expect(t).not.toMatch(/Combustion|MHEV/);
      // 545 of 1,234 live cars sit at a dealer of another make; the locked claim is factory-authorized.
      expect(t).not.toMatch(/make-matched|same make/i);
      expect(JSON.stringify(r.structuredContent)).not.toMatch(BANNED);
    }
    expect(text(results[1])).toMatch(/screened cars? qualif/);
    const seg = results[0].structuredContent.segments.map((s: any) => s.segment);
    expect(seg.filter((s: string) => s === 'Electric Vehicles').length).toBe(1);
  });
});
