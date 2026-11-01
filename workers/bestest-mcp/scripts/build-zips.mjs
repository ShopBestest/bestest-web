#!/usr/bin/env node
// Regenerates data/zips.json from the US Census ZCTA gazetteer, filtered to a Southern
// California bounding box. Run with network access:
//   node scripts/build-zips.mjs            (downloads the 2020 gazetteer)
//   node scripts/build-zips.mjs path/to/2020_Gaz_zcta_national.txt   (use a local copy)
//
// Output shape: { "92868": [33.7879, -117.8862], ... }  (lat, lng rounded to 4 dp)
//
// The gazetteer is tab-separated with header: GEOID  ALAND  AWATER  ALAND_SQMI  AWATER_SQMI  INTPTLAT  INTPTLONG
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const GAZ_URL = 'https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2020_Gazetteer/2020_Gaz_zcta_national.zip';

// Bounding box: roughly Santa Barbara/Bakersfield down to the Mexican border, coast to the
// Colorado River side of the Inland Empire. Covers OC and everything a shopper might search from.
const BOX = { minLat: 32.5, maxLat: 35.2, minLng: -119.6, maxLng: -115.0 };

async function loadText(arg) {
  if (arg) return readFile(arg, 'utf8');
  const res = await fetch(GAZ_URL);
  if (!res.ok) throw new Error(`download failed: HTTP ${res.status}`);
  const buf = new Uint8Array(await res.arrayBuffer());
  // The gazetteer ships zipped; Node has no built-in unzip, so ask the user for the extracted file.
  if (buf[0] === 0x50 && buf[1] === 0x4b) {
    throw new Error('Downloaded a zip. Extract 2020_Gaz_zcta_national.txt and pass its path as the first argument.');
  }
  return new TextDecoder().decode(buf);
}

const text = await loadText(process.argv[2]);
const lines = text.split(/\r?\n/).filter(Boolean);
const header = lines.shift().split('\t').map((h) => h.trim());
const iZip = header.indexOf('GEOID');
const iLat = header.indexOf('INTPTLAT');
const iLng = header.indexOf('INTPTLONG');
if (iZip < 0 || iLat < 0 || iLng < 0) throw new Error(`unexpected header: ${header.join(',')}`);

const out = {};
for (const line of lines) {
  const cols = line.split('\t');
  const zip = cols[iZip].trim();
  const lat = parseFloat(cols[iLat]);
  const lng = parseFloat(cols[iLng]);
  if (!/^\d{5}$/.test(zip) || !Number.isFinite(lat) || !Number.isFinite(lng)) continue;
  if (lat < BOX.minLat || lat > BOX.maxLat || lng < BOX.minLng || lng > BOX.maxLng) continue;
  out[zip] = [Math.round(lat * 1e4) / 1e4, Math.round(lng * 1e4) / 1e4];
}

const sorted = Object.fromEntries(Object.entries(out).sort(([a], [b]) => a.localeCompare(b)));
const dest = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'data', 'zips.json');
await writeFile(dest, JSON.stringify(sorted, null, 0).replace(/],"/g, '],\n"').replace('{', '{\n').replace(/}$/, '\n}') + '\n');
console.log(`wrote ${Object.keys(sorted).length} zips to ${dest}`);
