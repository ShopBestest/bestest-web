// Zip -> centroid lookup and great-circle distance.
// The centroid table is bundled (data/zips.json); there are no external geocoding calls.
import ZIPS from '../data/zips.json';

export interface LatLng {
  lat: number;
  lng: number;
}

const TABLE: Record<string, [number, number]> = ZIPS as unknown as Record<string, [number, number]>;

/** Earth radius in miles, same constant js/srp-engine.js and js/distance.js use. */
const EARTH_RADIUS_MILES = 3958.8;

export function haversineMiles(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MILES * c;
}

/** Accepts "92868", " 92868 ", "92868-1234". Returns the 5-digit zip or null. */
export function normalizeZip(input: unknown): string | null {
  if (input == null) return null;
  const m = String(input).trim().match(/^(\d{5})(?:-\d{4})?$/);
  return m ? m[1] : null;
}

/** Centroid for a zip in the bundled table, or null when the zip is not covered. */
export function lookupZip(zip: string): LatLng | null {
  const row = TABLE[zip];
  if (!row) return null;
  return { lat: row[0], lng: row[1] };
}

export function zipCount(): number {
  return Object.keys(TABLE).length;
}
