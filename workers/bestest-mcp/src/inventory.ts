// Pure inventory logic: feed-record normalization, filtering, sorting, distance and
// segment summaries. No I/O here so it is trivially testable.
import { haversineMiles, type LatLng } from './geo.js';

/** A raw feed record. Short keys are documented in js/srp-engine.js (mapRecord). */
export interface FeedRecord {
  id?: string | number;
  y?: number | string;
  mk?: string;
  md?: string;
  tr?: string;
  p?: number | string;
  mi?: number | string;
  pt?: string;
  sg?: string;
  bd?: string;
  dn?: string;
  dc?: string;
  la?: number | string;
  ln?: number | string;
  img?: string;
  slug?: string;
  pho?: number | string;
  pm?: string;
  fs?: string;
  t?: string;
  cpo?: boolean | string | number;
}

export interface Car {
  id: string;
  slug: string;
  title: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  price: number;
  miles: number;
  powertrain: string;
  segment: string;
  body: string;
  dealer: string;
  city: string;
  lat: number | null;
  lng: number | null;
  /** Feed image URL, passed through verbatim. Never rewritten. */
  image: string;
  photoCount: number;
  firstSeen: string | null;
  certified: boolean;
}

export type PowertrainFilter = 'gas' | 'hybrid' | 'plug-in hybrid' | 'electric';
export type SortKey = 'price' | 'miles' | 'distance';

export interface SearchParams {
  segment?: string;
  make?: string;
  model?: string;
  powertrain?: PowertrainFilter;
  max_price?: number;
  max_miles?: number;
  min_year?: number;
  origin?: LatLng | null;
  radius_miles?: number;
  sort?: SortKey;
  limit?: number;
  offset?: number;
}

export interface CarWithDistance extends Car {
  distance_miles: number | null;
}

export interface SearchResult {
  total: number;
  offset: number;
  cars: CarWithDistance[];
  sort: SortKey;
}

// Powertrain vocab seen in the feed (mirrors HYBRID_PT and the powertrain filter in js/srp-engine.js).
const HYBRID_PT = new Set(['hev', 'hybrid']);
const PHEV_PT = new Set(['phev', 'plug-in hybrid', 'plug in hybrid', 'plugin hybrid']);
const ELECTRIC_PT = new Set(['bev', 'ev', 'electric']);

// Segment pages on shopbestest.com (SEGMENT_TO_SLUG in js/srp-engine.js). 'Hybrids' and
// 'Electric Vehicles' are virtual segments the site resolves by powertrain.
export const SEGMENT_PATHS: Record<string, string> = {
  'Compact Car': '/used-cars/best-used-compact-cars',
  'Midsize/Full-size Car': '/used-cars/best-used-midsize-cars',
  'Subcompact SUV': '/used-cars/best-used-subcompact-suvs',
  'Compact SUV': '/used-cars/best-used-compact-suvs',
  'Midsize SUV': '/used-cars/best-used-midsize-suvs',
  'Full-Size SUV': '/used-cars/best-used-full-size-suvs',
  'Compact/Midsize Truck': '/used-cars/best-used-midsize-trucks',
  'Full-Size Truck': '/used-cars/best-used-full-size-trucks',
  Minivan: '/used-cars/best-used-minivans',
  'Electric Vehicles': '/used-cars/best-used-electric-vehicles',
  Hybrids: '/used-cars/best-used-hybrids',
  'Luxury Small Car': '/used-cars/best-used-luxury-small-cars',
  'Luxury Midsize Car': '/used-cars/best-used-luxury-midsize-cars',
  'Luxury Full-Size Car': '/used-cars/best-used-luxury-full-size-cars',
  'Luxury Subcompact SUV': '/used-cars/best-used-luxury-subcompact-suvs',
  'Luxury Compact SUV': '/used-cars/best-used-luxury-compact-suvs',
  'Luxury Midsize SUV': '/used-cars/best-used-luxury-midsize-suvs',
  'Luxury Full-Size SUV': '/used-cars/best-used-luxury-full-size-suvs'
};

export const VIRTUAL_SEGMENTS: Record<string, PowertrainFilter> = {
  Hybrids: 'hybrid',
  'Electric Vehicles': 'electric'
};

export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 20;
export const DEFAULT_RADIUS_MILES = 25;

function num(v: unknown): number {
  if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
  const n = parseInt(String(v ?? ''), 10);
  return Number.isFinite(n) ? n : 0;
}

function coord(v: unknown): number | null {
  if (typeof v === 'number') return Number.isFinite(v) ? v : null;
  if (v == null || v === '') return null;
  const n = parseFloat(String(v));
  return Number.isFinite(n) ? n : null;
}

/** Feed record -> Car. Mirrors mapRecord() in js/srp-engine.js. */
export function normalizeRecord(r: FeedRecord): Car {
  const year = num(r.y);
  const make = (r.mk || '').trim();
  const model = (r.md || '').trim();
  return {
    id: r.id != null ? String(r.id) : '',
    slug: (r.slug || '').trim(),
    title: (r.t || `${year || ''} ${make} ${model}`).trim(),
    year,
    make,
    model,
    trim: (r.tr || '').trim(),
    price: num(r.p),
    miles: num(r.mi),
    powertrain: (r.pt || '').trim(),
    segment: (r.sg || '').trim(),
    body: (r.bd || '').trim(),
    dealer: (r.dn || '').trim(),
    city: (r.dc || '').trim(),
    lat: coord(r.la),
    lng: coord(r.ln),
    image: r.img || '',
    photoCount: num(r.pho),
    firstSeen: r.fs || null,
    certified: !!r.cpo && r.cpo !== '0' && r.cpo !== 'false'
  };
}

export function normalizeFeed(rows: unknown): Car[] {
  if (!Array.isArray(rows)) return [];
  return rows
    .filter((r): r is FeedRecord => !!r && typeof r === 'object')
    .map(normalizeRecord)
    .filter((c) => c.slug || c.id);
}

/** Lowercase, strip everything but letters and digits: "CR-V" -> "crv", "Model 3" -> "model3". */
export function fold(s: string): string {
  return String(s || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

export function powertrainClass(pt: string): PowertrainFilter {
  const k = String(pt || '').trim().toLowerCase();
  if (PHEV_PT.has(k)) return 'plug-in hybrid';
  if (HYBRID_PT.has(k)) return 'hybrid';
  if (ELECTRIC_PT.has(k)) return 'electric';
  return 'gas';
}

export function matchesPowertrain(car: Car, want: PowertrainFilter): boolean {
  return powertrainClass(car.powertrain) === want;
}

/**
 * Resolve a user-supplied segment string to a canonical segment name.
 * Exact (folded) match first, then unique substring match. Returns null when nothing
 * matches and throws when the input is ambiguous so the caller can list the options.
 */
export function resolveSegment(input: string, known: string[]): string | null {
  const q = fold(input);
  if (!q) return null;
  const names = Array.from(new Set([...known, ...Object.keys(SEGMENT_PATHS)]));
  const exact = names.find((n) => fold(n) === q);
  if (exact) return exact;
  // Common shorthands.
  const alias: Record<string, string> = {
    suv: 'Compact SUV',
    suvs: 'Compact SUV',
    sedan: 'Midsize/Full-size Car',
    sedans: 'Midsize/Full-size Car',
    midsizecar: 'Midsize/Full-size Car',
    fullsizecar: 'Midsize/Full-size Car',
    truck: 'Full-Size Truck',
    trucks: 'Full-Size Truck',
    pickup: 'Full-Size Truck',
    midsizetruck: 'Compact/Midsize Truck',
    compacttruck: 'Compact/Midsize Truck',
    minivans: 'Minivan',
    van: 'Minivan',
    ev: 'Electric Vehicles',
    evs: 'Electric Vehicles',
    electric: 'Electric Vehicles',
    electricvehicle: 'Electric Vehicles',
    hybrid: 'Hybrids',
    hybrids: 'Hybrids'
  };
  if (alias[q] && names.includes(alias[q])) return alias[q];
  const partial = names.filter((n) => fold(n).includes(q));
  if (partial.length === 1) return partial[0];
  if (partial.length > 1) {
    throw new AmbiguousError(`"${input}" matches several segments: ${partial.join(', ')}. Pass one of them exactly.`);
  }
  return null;
}

export class AmbiguousError extends Error {}

function matchesSegment(car: Car, segment: string): boolean {
  const virtual = VIRTUAL_SEGMENTS[segment];
  if (virtual) return matchesPowertrain(car, virtual);
  return fold(car.segment) === fold(segment);
}

function matchesMake(car: Car, make: string): boolean {
  const q = fold(make);
  if (!q) return true;
  const m = fold(car.make);
  // "Mercedes" should match "Mercedes-Benz"; "Chevy" matches "Chevrolet".
  if (m === q || m.startsWith(q)) return true;
  if (q === 'chevy' && m === 'chevrolet') return true;
  if (q === 'vw' && m === 'volkswagen') return true;
  if (q === 'merc' && m === 'mercedesbenz') return true;
  return false;
}

function matchesModel(car: Car, model: string): boolean {
  const q = fold(model);
  if (!q) return true;
  const m = fold(car.model);
  if (m === q || m.startsWith(q)) return true;
  // Allow "RAV4 Hybrid" / "RAV4 Prime" style queries against trim as well.
  return fold(`${car.model}${car.trim}`).startsWith(q);
}

export function distanceFrom(origin: LatLng, car: Car): number | null {
  if (car.lat == null || car.lng == null) return null;
  return haversineMiles(origin.lat, origin.lng, car.lat, car.lng);
}

export function filterCars(cars: Car[], p: SearchParams): CarWithDistance[] {
  const segment = p.segment ? resolveSegment(p.segment, uniqueSegments(cars)) : null;
  if (p.segment && !segment) return [];
  const radius = p.origin ? (p.radius_miles ?? DEFAULT_RADIUS_MILES) : null;
  const out: CarWithDistance[] = [];
  for (const car of cars) {
    if (segment && !matchesSegment(car, segment)) continue;
    if (p.make && !matchesMake(car, p.make)) continue;
    if (p.model && !matchesModel(car, p.model)) continue;
    if (p.powertrain && !matchesPowertrain(car, p.powertrain)) continue;
    if (p.max_price != null && !(car.price > 0 && car.price <= p.max_price)) continue;
    if (p.max_miles != null && car.miles > p.max_miles) continue;
    if (p.min_year != null && car.year < p.min_year) continue;
    const distance_miles = p.origin ? distanceFrom(p.origin, car) : null;
    if (radius != null) {
      // Dealers without coordinates cannot be placed, so a radius search leaves them out.
      if (distance_miles == null || distance_miles > radius) continue;
    }
    out.push({ ...car, distance_miles });
  }
  return out;
}

export function sortCars(cars: CarWithDistance[], sort: SortKey): CarWithDistance[] {
  const byPrice = (a: CarWithDistance, b: CarWithDistance) => a.price - b.price;
  const byMiles = (a: CarWithDistance, b: CarWithDistance) => a.miles - b.miles;
  const byDist = (a: CarWithDistance, b: CarWithDistance) =>
    (a.distance_miles ?? Infinity) - (b.distance_miles ?? Infinity);
  const chain = (...fns: ((a: CarWithDistance, b: CarWithDistance) => number)[]) =>
    (a: CarWithDistance, b: CarWithDistance) => {
      for (const f of fns) {
        const d = f(a, b);
        if (d !== 0) return d;
      }
      return a.slug.localeCompare(b.slug);
    };
  const cmp =
    sort === 'miles' ? chain(byMiles, byPrice) : sort === 'distance' ? chain(byDist, byPrice) : chain(byPrice, byMiles);
  return [...cars].sort(cmp);
}

export function clampLimit(limit: unknown): number {
  const n = typeof limit === 'number' && Number.isFinite(limit) ? Math.floor(limit) : DEFAULT_LIMIT;
  return Math.min(MAX_LIMIT, Math.max(1, n));
}

export function searchCars(cars: Car[], p: SearchParams): SearchResult {
  const sort: SortKey = p.sort ?? (p.origin ? 'distance' : 'price');
  const matched = sortCars(filterCars(cars, p), sort);
  const limit = clampLimit(p.limit);
  const offset = Math.max(0, Math.floor(p.offset ?? 0));
  return { total: matched.length, offset, sort, cars: matched.slice(offset, offset + limit) };
}

/** Find one car by slug or id (slug first, exact, case-insensitive). */
export function findCar(cars: Car[], key: string): Car | null {
  const k = String(key || '').trim().toLowerCase();
  if (!k) return null;
  return (
    cars.find((c) => c.slug.toLowerCase() === k) ??
    cars.find((c) => c.id.toLowerCase() === k) ??
    // Tolerate a pasted VDP URL.
    cars.find((c) => c.slug && k.endsWith('/used/' + c.slug.toLowerCase())) ??
    null
  );
}

export function uniqueSegments(cars: Car[]): string[] {
  return Array.from(new Set(cars.map((c) => c.segment).filter(Boolean))).sort();
}

export interface SegmentSummary {
  segment: string;
  count: number;
  min_price: number;
  max_price: number;
  median_price: number;
  path: string | null;
  virtual: boolean;
}

function summarize(segment: string, members: Car[], virtual: boolean): SegmentSummary {
  const prices = members.map((c) => c.price).filter((p) => p > 0).sort((a, b) => a - b);
  const median = prices.length ? prices[Math.floor((prices.length - 1) / 2)] : 0;
  return {
    segment,
    count: members.length,
    min_price: prices[0] ?? 0,
    max_price: prices[prices.length - 1] ?? 0,
    median_price: median,
    path: SEGMENT_PATHS[segment] ?? null,
    virtual
  };
}

/** Real segments (by feed `sg`) plus the two virtual powertrain segments, with counts and price ranges. */
export function listSegments(cars: Car[]): SegmentSummary[] {
  const groups = new Map<string, Car[]>();
  for (const c of cars) {
    if (!c.segment) continue;
    const arr = groups.get(c.segment) ?? [];
    arr.push(c);
    groups.set(c.segment, arr);
  }
  const real = Array.from(groups.entries())
    .map(([seg, members]) => summarize(seg, members, false))
    .sort((a, b) => b.count - a.count || a.segment.localeCompare(b.segment));
  const virtual = Object.entries(VIRTUAL_SEGMENTS)
    .map(([seg, pt]) => summarize(seg, cars.filter((c) => matchesPowertrain(c, pt)), true))
    .filter((s) => s.count > 0);
  return [...real, ...virtual];
}
