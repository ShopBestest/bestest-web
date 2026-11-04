// MCP server definition: three read-only tools over the screened inventory.
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CfWorkerJsonSchemaValidator } from '@modelcontextprotocol/sdk/validation/cfworker';
import { z } from 'zod';
import { FeedError, type InventoryLoader } from './feed.js';
import { haversineMiles, lookupZip, normalizeZip, type LatLng } from './geo.js';
import {
  AmbiguousError,
  DEFAULT_LIMIT,
  DEFAULT_RADIUS_MILES,
  MAX_LIMIT,
  SEGMENT_PATHS,
  findCar,
  powertrainClass,
  powertrainLabel,
  listSegments,
  resolveSegment,
  searchCars,
  uniqueSegments,
  type Car,
  type CarWithDistance,
  type SearchResult,
  type SegmentSummary
} from './inventory.js';

export const SERVER_VERSION = '0.1.0';

export interface ServerOptions {
  loadInventory: InventoryLoader;
  siteUrl: string;
}

/** One line that goes on every response. */
export function screenNote(siteUrl: string): string {
  return `Every car listed passed Bestest's screen: approved model, year and trim, under 50K miles, sold by a make-matched franchise dealer. ${siteUrl}`;
}

export function vdpUrl(siteUrl: string, car: Pick<Car, 'slug'>): string {
  // VDP pattern confirmed from js/srp-engine.js mapRecord(): href = '/used/' + slug
  return `${siteUrl.replace(/\/$/, '')}/used/${car.slug}`;
}

export function segmentUrl(siteUrl: string, segment: string): string | null {
  const path = SEGMENT_PATHS[segment];
  return path ? `${siteUrl.replace(/\/$/, '')}${path}` : null;
}

const money = (n: number) => (n > 0 ? `$${n.toLocaleString('en-US')}` : 'Price on request');
const milesFmt = (n: number) => `${n.toLocaleString('en-US')} mi`;
const distFmt = (d: number | null) => (d == null ? null : d < 1.5 ? '1 mi away' : `${Math.round(d)} mi away`);

export function carToPublic(siteUrl: string, c: CarWithDistance | Car) {
  const distance = 'distance_miles' in c ? c.distance_miles : null;
  return {
    id: c.id,
    slug: c.slug,
    title: c.title,
    year: c.year,
    make: c.make,
    model: c.model,
    trim: c.trim,
    price: c.price,
    miles: c.miles,
    powertrain: c.powertrain ? powertrainLabel(c.powertrain) : 'Gas',
    powertrain_type: powertrainClass(c.powertrain),
    segment: c.segment,
    body: c.body,
    dealer: c.dealer,
    dealer_city: c.city,
    distance_miles: distance == null ? null : Math.round(distance * 10) / 10,
    certified_pre_owned: c.certified,
    first_seen: c.firstSeen,
    url: vdpUrl(siteUrl, c),
    image_url: c.image || null // feed value verbatim; never a rebuilt Cloudinary URL
  };
}

/**
 * Title plus trim without repeating words: feed titles can already end with the start of
 * the trim ("2023 Toyota RAV4 Hybrid" + "Hybrid XLE" -> "2023 Toyota RAV4 Hybrid XLE").
 */
export function displayName(title: string, trim: string): string {
  const t = title.trim();
  const tr = trim.trim();
  if (!tr) return t;
  const tw = t.split(/\s+/);
  const rw = tr.split(/\s+/);
  const same = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
  // Live feed titles are "{year} {make} {model} {trim}" and a few reorder the trim words
  // ("2023 Kia Sportage Hybrid LX" / "LX Hybrid", "... Santa Fe Hybrid Limited" / "Limited HEV").
  // If every trim word (ignoring powertrain codes) is already in the title, the title is enough.
  const titleWords = new Set(tw.map((w) => w.toLowerCase()));
  const codes = new Set(['hev', 'phev', 'bev', 'mhev', 'ev']);
  if (rw.every((w) => titleWords.has(w.toLowerCase()) || codes.has(w.toLowerCase()))) return t;
  for (let k = Math.min(tw.length, rw.length); k > 0; k--) {
    const tail = tw.slice(tw.length - k);
    if (tail.every((w, i) => same(w, rw[i]))) return [...tw, ...rw.slice(k)].join(' ');
  }
  return `${t} ${tr}`;
}

export function carLine(siteUrl: string, c: CarWithDistance | Car): string {
  const p = carToPublic(siteUrl, c);
  const bits = [money(p.price), milesFmt(p.miles)];
  if (p.powertrain) bits.push(p.powertrain);
  const where = [p.dealer, p.dealer_city].filter(Boolean).join(', ');
  const d = distFmt(p.distance_miles);
  return `- ${displayName(p.title, p.trim)} — ${bits.join(' · ')} — ${where}${d ? ` (${d})` : ''}\n  ${p.url}`;
}

interface ToolText {
  [key: string]: unknown;
  content: { type: 'text'; text: string }[];
  structuredContent?: Record<string, unknown>;
  isError?: boolean;
}

function textResult(text: string, structured?: Record<string, unknown>): ToolText {
  return { content: [{ type: 'text', text }], structuredContent: structured };
}

function errorResult(message: string): ToolText {
  return { content: [{ type: 'text', text: message }], isError: true };
}

function describeFilters(args: Record<string, unknown>, zipLabel: string | null): string {
  const parts: string[] = [];
  if (args.segment) parts.push(String(args.segment));
  if (args.make) parts.push(String(args.make));
  if (args.model) parts.push(String(args.model));
  if (args.powertrain) parts.push(String(args.powertrain));
  if (args.min_year) parts.push(`${args.min_year}+`);
  if (args.max_price) parts.push(`under ${money(Number(args.max_price))}`);
  if (args.max_miles) parts.push(`under ${milesFmt(Number(args.max_miles))}`);
  if (zipLabel) parts.push(zipLabel);
  return parts.length ? parts.join(', ') : 'all screened cars';
}

export function formatSearch(siteUrl: string, result: SearchResult, filters: string): string {
  const note = screenNote(siteUrl);
  if (result.total === 0) {
    return [
      `No screened cars currently qualify for: ${filters}.`,
      'Widen the radius, raise the price or mileage cap, or drop a filter and search again.',
      note
    ].join('\n');
  }
  const first = result.offset + 1;
  const last = result.offset + result.cars.length;
  const head =
    result.total === result.cars.length && result.offset === 0
      ? `${result.total} screened car${result.total === 1 ? ' qualifies' : 's qualify'} for: ${filters} (sorted by ${result.sort}).`
      : `${result.total} screened cars qualify for: ${filters}. Showing ${first}–${last}, sorted by ${result.sort}.`;
  return [head, ...result.cars.map((c) => carLine(siteUrl, c)), note].join('\n');
}

export function formatCar(siteUrl: string, c: Car): string {
  const p = carToPublic(siteUrl, c);
  const rows = [
    displayName(p.title, p.trim),
    `Price: ${money(p.price)}`,
    `Miles: ${milesFmt(p.miles)}`,
    p.powertrain ? `Powertrain: ${p.powertrain}` : null,
    p.segment ? `Segment: ${p.segment}${p.body ? ` (${p.body})` : ''}` : null,
    `Dealer: ${[p.dealer, p.dealer_city].filter(Boolean).join(', ')}`,
    p.certified_pre_owned ? 'Certified pre-owned: yes' : null,
    `Listing: ${p.url}`,
    p.image_url ? `Photo: ${p.image_url}` : null,
    screenNote(siteUrl)
  ];
  return rows.filter(Boolean).join('\n');
}

export function formatSegments(siteUrl: string, segs: SegmentSummary[]): string {
  const lines = segs.map((s) => {
    const range = s.min_price === s.max_price ? money(s.min_price) : `${money(s.min_price)}–${money(s.max_price)}`;
    const url = segmentUrl(siteUrl, s.segment);
    return `- ${s.segment}: ${s.count} screened car${s.count === 1 ? '' : 's'}, ${range} (median ${money(s.median_price)})${
      url ? ` — ${url}` : ''
    }`;
  });
  return ['Screened inventory by segment (Orange County, CA):', ...lines, screenNote(siteUrl)].join('\n');
}

const SEGMENT_NAMES = Object.keys(SEGMENT_PATHS).join(', ');

export function createMcpServer(opts: ServerOptions): McpServer {
  const { loadInventory, siteUrl } = opts;
  const server = new McpServer(
    {
      name: 'bestest',
      title: 'Bestest',
      version: SERVER_VERSION,
      websiteUrl: siteUrl
    },
    {
      jsonSchemaValidator: new CfWorkerJsonSchemaValidator(),
      instructions:
        'Bestest is a curated used-car marketplace for Orange County, California. Every car in its inventory ' +
        'has already passed a screen: an approved model, year and trim, under 50,000 miles, sold by a franchise ' +
        'dealer of the same make. Use search_cars to find screened cars by segment, make, model, powertrain, ' +
        'price, mileage, year and distance from a zip code; get_car for one listing; list_segments for an ' +
        'overview of what qualifies right now.'
    }
  );

  async function inventory(): Promise<Car[]> {
    return loadInventory();
  }

  function handleError(e: unknown): ToolText {
    if (e instanceof AmbiguousError) return errorResult(e.message);
    if (e instanceof FeedError) return errorResult(`Bestest inventory is temporarily unavailable (${e.message}). Try again in a minute.`);
    throw e;
  }

  server.registerTool(
    'search_cars',
    {
      title: 'Search screened used cars',
      description:
        'Search Bestest\'s screened used-car inventory in Orange County, CA. Every result is a car that already ' +
        'passed Bestest\'s screen (approved model, year and trim; under 50K miles; make-matched franchise dealer). ' +
        'Filter by segment, make, model, powertrain, max price, max miles, min year, and distance from a zip code. ' +
        'Returns title, price, miles, dealer and city, distance (when a zip is given), listing URL and photo URL. ' +
        `Segments: ${SEGMENT_NAMES}.`,
      inputSchema: {
        segment: z
          .string()
          .max(60)
          .optional()
          .describe('Segment name, e.g. "Compact SUV", "Minivan", "Hybrids", "Electric Vehicles", "Luxury Midsize SUV".'),
        make: z.string().max(40).optional().describe('Make, e.g. "Toyota", "Honda", "Lexus".'),
        model: z.string().max(60).optional().describe('Model, e.g. "RAV4", "CR-V", "Model 3". Prefix match.'),
        powertrain: z
          .enum(['gas', 'hybrid', 'plug-in hybrid', 'electric'])
          .optional()
          .describe('Powertrain class.'),
        max_price: z.number().int().positive().optional().describe('Maximum price in USD.'),
        max_miles: z.number().int().positive().optional().describe('Maximum odometer miles.'),
        min_year: z.number().int().min(1990).max(2100).optional().describe('Earliest model year to include.'),
        zip: z
          .union([z.string(), z.number().int()])
          .optional()
          .describe('5-digit US zip (Orange County / Southern California) to measure distance from and sort by.'),
        radius_miles: z
          .number()
          .positive()
          .max(500)
          .optional()
          .describe(`Search radius around zip in miles. Default ${DEFAULT_RADIUS_MILES}. Ignored without zip.`),
        sort: z
          .enum(['price', 'miles', 'distance'])
          .optional()
          .describe('Sort order. Default: distance when zip is given, otherwise price (low to high).'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(MAX_LIMIT)
          .optional()
          .describe(`Results to return, 1–${MAX_LIMIT}. Default ${DEFAULT_LIMIT}.`),
        offset: z.number().int().min(0).optional().describe('Skip this many results (for paging).')
      },
      annotations: { title: 'Search screened used cars', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      _meta: {
        'openai/toolInvocation/invoking': 'Searching Bestest\'s screened inventory',
        'openai/toolInvocation/invoked': 'Searched Bestest\'s screened inventory'
      }
    },
    async (args) => {
      let origin: LatLng | null = null;
      let zipLabel: string | null = null;
      if (args.zip != null && String(args.zip).trim() !== '') {
        const zip = normalizeZip(args.zip);
        if (!zip) return errorResult(`"${args.zip}" is not a 5-digit US zip code.`);
        origin = lookupZip(zip);
        if (!origin) {
          return errorResult(
            `Zip ${zip} is outside the area Bestest can measure distance from (Orange County and nearby Southern California). ` +
              'Search again without a zip, or use a nearby Orange County zip such as 92868 (Orange).'
          );
        }
        zipLabel = `within ${args.radius_miles ?? DEFAULT_RADIUS_MILES} mi of ${zip}`;
      }
      if (args.sort === 'distance' && !origin) return errorResult('sort "distance" needs a zip code.');
      try {
        const cars = await inventory();
        const result = searchCars(cars, {
          segment: args.segment,
          make: args.make,
          model: args.model,
          powertrain: args.powertrain,
          max_price: args.max_price,
          max_miles: args.max_miles,
          min_year: args.min_year,
          origin,
          radius_miles: args.radius_miles,
          sort: args.sort,
          limit: args.limit,
          offset: args.offset
        });
        const filters = describeFilters(args as Record<string, unknown>, zipLabel);
        if (result.total === 0 && args.segment && !resolvesKnownSegment(args.segment, cars)) {
          return errorResult(`Unknown segment "${args.segment}". Valid segments: ${SEGMENT_NAMES}.`);
        }
        return textResult(formatSearch(siteUrl, result, filters), {
          total: result.total,
          offset: result.offset,
          sort: result.sort,
          cars: result.cars.map((c) => carToPublic(siteUrl, c)),
          note: screenNote(siteUrl),
          site: siteUrl
        });
      } catch (e) {
        return handleError(e);
      }
    }
  );

  server.registerTool(
    'get_car',
    {
      title: 'Get one screened car',
      description:
        'Get a single screened car from Bestest by its slug or id (as returned by search_cars), or by its listing URL. ' +
        'Returns price, miles, powertrain, segment, dealer and city, listing URL and photo URL.',
      inputSchema: {
        slug: z.string().max(200).optional().describe('Listing slug, e.g. "2022-toyota-rav4-hybrid-xle-abc123", or the full listing URL.'),
        id: z.string().max(100).optional().describe('Listing id from search_cars.'),
        zip: z.union([z.string(), z.number().int()]).optional().describe('Optional 5-digit zip to include distance to the dealer.')
      },
      annotations: { title: 'Get one screened car', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      _meta: {
        'openai/toolInvocation/invoking': 'Looking up the listing on Bestest',
        'openai/toolInvocation/invoked': 'Looked up the listing on Bestest'
      }
    },
    async (args) => {
      const key = (args.slug || args.id || '').trim();
      if (!key) return errorResult('Pass a slug or an id.');
      try {
        const cars = await inventory();
        const car = findCar(cars, key);
        if (!car) {
          return errorResult(
            `No screened car matches "${key}". It may have sold or been removed. Use search_cars to find current listings.`
          );
        }
        let withDistance: CarWithDistance = { ...car, distance_miles: null };
        if (args.zip) {
          const zip = normalizeZip(args.zip);
          const origin = zip ? lookupZip(zip) : null;
          if (origin && car.lat != null && car.lng != null) {
            withDistance = { ...car, distance_miles: haversineMiles(origin.lat, origin.lng, car.lat, car.lng) };
          }
        }
        const pub = carToPublic(siteUrl, withDistance);
        const text = formatCar(siteUrl, car) + (pub.distance_miles != null ? `\nDistance: ${distFmt(pub.distance_miles)}` : '');
        return textResult(text, { car: pub, note: screenNote(siteUrl), site: siteUrl });
      } catch (e) {
        return handleError(e);
      }
    }
  );

  server.registerTool(
    'list_segments',
    {
      title: 'List segments in screened inventory',
      description:
        'List the vehicle segments in Bestest\'s screened inventory right now, with the number of qualifying cars, ' +
        'the price range and median, and the link to the segment page on shopbestest.com. Use it to see what is ' +
        'available before calling search_cars, or to pick an exact segment name.',
      inputSchema: {},
      annotations: { title: 'List segments in screened inventory', readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false },
      _meta: {
        'openai/toolInvocation/invoking': 'Reading Bestest\'s screened inventory',
        'openai/toolInvocation/invoked': 'Read Bestest\'s screened inventory'
      }
    },
    async () => {
      try {
        const cars = await inventory();
        const segs = listSegments(cars);
        return textResult(formatSegments(siteUrl, segs), {
          total_cars: cars.length,
          segments: segs.map((s) => ({ ...s, url: segmentUrl(siteUrl, s.segment) })),
          note: screenNote(siteUrl),
          site: siteUrl
        });
      } catch (e) {
        return handleError(e);
      }
    }
  );

  return server;
}

function resolvesKnownSegment(input: string, cars: Car[]): boolean {
  try {
    return resolveSegment(input, uniqueSegments(cars)) != null;
  } catch {
    return true; // ambiguous is reported by searchCars itself, not as "unknown"
  }
}
