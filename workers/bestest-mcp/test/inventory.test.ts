import { describe, expect, it } from 'vitest';
import fixture from './fixture.json';
import {
  AmbiguousError,
  clampLimit,
  filterCars,
  findCar,
  listSegments,
  normalizeFeed,
  normalizeRecord,
  powertrainClass,
  resolveSegment,
  searchCars,
  sortCars,
  uniqueSegments
} from '../src/inventory.js';
import { lookupZip } from '../src/geo.js';

const cars = normalizeFeed(fixture);
const ORANGE = lookupZip('92868')!; // Orange, CA
const slugs = (r: { cars: { slug: string }[] }) => r.cars.map((c) => c.slug);

describe('normalizeRecord', () => {
  it('maps short feed keys to a Car and keeps the image URL verbatim', () => {
    const c = normalizeRecord(fixture[0]);
    expect(c).toMatchObject({
      id: '1001',
      slug: '2022-toyota-rav4-xle-1001',
      title: '2022 Toyota RAV4',
      year: 2022,
      make: 'Toyota',
      model: 'RAV4',
      trim: 'XLE',
      price: 28995,
      miles: 24510,
      powertrain: 'Combustion',
      segment: 'Compact SUV',
      body: 'SUV',
      dealer: 'Toyota of Orange',
      city: 'Orange',
      lat: 33.7879,
      lng: -117.8531,
      certified: false
    });
    expect(c.image).toBe(fixture[0].img);
  });

  it('tolerates string numbers, missing coordinates and builds a title when t is absent', () => {
    const c = normalizeRecord({ id: 7, y: '2020', mk: 'Kia', md: 'Telluride', p: '35000', mi: '12000', slug: 'x' });
    expect(c.year).toBe(2020);
    expect(c.price).toBe(35000);
    expect(c.miles).toBe(12000);
    expect(c.lat).toBeNull();
    expect(c.title).toBe('2020 Kia Telluride');
  });

  it('drops non-object rows and rows with neither slug nor id', () => {
    expect(normalizeFeed([null, 3, { y: 2020 }, { slug: 'ok' }])).toHaveLength(1);
    expect(normalizeFeed('nope')).toEqual([]);
  });
});

describe('powertrainClass', () => {
  it('buckets the feed vocabulary the same way the site does', () => {
    expect(powertrainClass('HEV')).toBe('hybrid');
    expect(powertrainClass('Hybrid')).toBe('hybrid');
    expect(powertrainClass('PHEV')).toBe('plug-in hybrid');
    expect(powertrainClass('Plug-In Hybrid')).toBe('plug-in hybrid');
    expect(powertrainClass('BEV')).toBe('electric');
    expect(powertrainClass('EV')).toBe('electric');
    expect(powertrainClass('Combustion')).toBe('gas');
    expect(powertrainClass('')).toBe('gas');
  });
});

describe('resolveSegment', () => {
  const known = uniqueSegments(cars);
  it('matches exactly, ignoring case and punctuation', () => {
    expect(resolveSegment('compact suv', known)).toBe('Compact SUV');
    expect(resolveSegment('Midsize / Full-size car', known)).toBe('Midsize/Full-size Car');
  });
  it('resolves aliases and unique partials', () => {
    expect(resolveSegment('minivans', known)).toBe('Minivan');
    expect(resolveSegment('EV', known)).toBe('Electric Vehicles');
    expect(resolveSegment('luxury midsize suv', known)).toBe('Luxury Midsize SUV');
    expect(resolveSegment('full-size truck', known)).toBe('Full-Size Truck');
  });
  it('throws on ambiguous partials and returns null for unknown', () => {
    expect(() => resolveSegment('luxury', known)).toThrow(AmbiguousError);
    expect(resolveSegment('spaceship', known)).toBeNull();
  });
});

describe('filterCars', () => {
  it('filters by segment', () => {
    const r = filterCars(cars, { segment: 'Compact SUV' });
    expect(r.map((c) => c.id).sort()).toEqual(['1001', '1002', '1003', '1006', '1010']);
  });
  it('virtual segments filter by powertrain', () => {
    expect(filterCars(cars, { segment: 'Hybrids' }).map((c) => c.id)).toEqual(['1002']);
    expect(filterCars(cars, { segment: 'Electric Vehicles' }).map((c) => c.id).sort()).toEqual(['1004', '1010']);
  });
  it('filters by make and model with forgiving matching', () => {
    expect(filterCars(cars, { make: 'toyota', model: 'rav4' }).map((c) => c.id).sort()).toEqual(['1001', '1002', '1006']);
    expect(filterCars(cars, { make: 'Honda', model: 'crv' }).map((c) => c.id)).toEqual(['1003']);
    expect(filterCars(cars, { model: 'model 3' }).map((c) => c.id)).toEqual(['1004']);
    expect(filterCars(cars, { make: 'Chevy' })).toEqual([]);
  });
  it('filters by powertrain, price, miles and year', () => {
    expect(filterCars(cars, { powertrain: 'plug-in hybrid' }).map((c) => c.id)).toEqual(['1006']);
    expect(filterCars(cars, { powertrain: 'electric' }).map((c) => c.id).sort()).toEqual(['1004', '1010']);
    expect(filterCars(cars, { max_price: 27000 }).map((c) => c.id).sort()).toEqual(['1003', '1009']);
    expect(filterCars(cars, { max_miles: 10000 }).map((c) => c.id).sort()).toEqual(['1006', '1010']);
    expect(filterCars(cars, { min_year: 2023 }).map((c) => c.id).sort()).toEqual(['1002', '1006', '1010']);
  });
  it('combines filters', () => {
    const r = filterCars(cars, { segment: 'compact suv', powertrain: 'gas', max_price: 28000 });
    expect(r.map((c) => c.id)).toEqual(['1003']);
  });
  it('returns nothing for an unknown segment', () => {
    expect(filterCars(cars, { segment: 'spaceship' })).toEqual([]);
  });
});

describe('distance and radius', () => {
  it('computes distance from the zip centroid and drops cars outside the radius', () => {
    const r = filterCars(cars, { origin: ORANGE, radius_miles: 10 });
    const ids = r.map((c) => c.id).sort();
    // Orange, Tustin, Anaheim, Irvine, Santa Ana-ish are within 10 mi; Temecula (~60 mi) is not.
    expect(ids).not.toContain('1008');
    expect(ids).toContain('1001');
    expect(ids).toContain('1002');
    const orange = r.find((c) => c.id === '1001')!;
    expect(orange.distance_miles).toBeGreaterThanOrEqual(0);
    expect(orange.distance_miles).toBeLessThan(2.5);
  });
  it('uses a 25 mile default radius', () => {
    const r = filterCars(cars, { origin: ORANGE });
    expect(r.map((c) => c.id)).not.toContain('1008');
    expect(r.length).toBe(8); // everyone but Temecula and the car with no coordinates
  });
  it('excludes cars with no coordinates from a radius search but keeps them otherwise', () => {
    expect(filterCars(cars, { origin: ORANGE, radius_miles: 500 }).map((c) => c.id)).not.toContain('1009');
    expect(filterCars(cars, {}).map((c) => c.id)).toContain('1009');
  });
  it('Temecula is roughly 70 miles from Orange', () => {
    const r = filterCars(cars, { origin: ORANGE, radius_miles: 100, make: 'Ford' });
    expect(r[0].distance_miles!).toBeGreaterThan(40);
    expect(r[0].distance_miles!).toBeLessThan(80);
  });
});

describe('sortCars', () => {
  const all = filterCars(cars, { origin: ORANGE, radius_miles: 500 });
  it('sorts by price ascending', () => {
    const p = sortCars(all, 'price').map((c) => c.price);
    expect(p).toEqual([...p].sort((a, b) => a - b));
  });
  it('sorts by miles ascending', () => {
    const m = sortCars(all, 'miles').map((c) => c.miles);
    expect(m).toEqual([...m].sort((a, b) => a - b));
  });
  it('sorts by distance ascending with price as tiebreak', () => {
    const d = sortCars(all, 'distance');
    const dist = d.map((c) => c.distance_miles!);
    expect(dist).toEqual([...dist].sort((a, b) => a - b));
    // Two cars at the same dealer (same distance): cheaper first.
    const orangeDealer = d.filter((c) => c.dealer === 'Toyota of Orange');
    expect(orangeDealer.map((c) => c.id)).toEqual(['1001', '1006']);
  });
  it('puts cars without a distance last when sorting by distance', () => {
    const placed = filterCars(cars, { origin: ORANGE, radius_miles: 500 });
    const noCoords = { ...cars.find((c) => c.id === '1009')!, distance_miles: null };
    const d = sortCars([noCoords, ...placed], 'distance');
    expect(d[0].id).not.toBe('1009');
    expect(d[d.length - 1].id).toBe('1009');
  });
});

describe('searchCars', () => {
  it('defaults to price sort without a zip and distance sort with one', () => {
    expect(searchCars(cars, {}).sort).toBe('price');
    expect(searchCars(cars, { origin: ORANGE }).sort).toBe('distance');
  });
  it('clamps limit to 1..20 and defaults to 10', () => {
    expect(clampLimit(undefined)).toBe(10);
    expect(clampLimit(0)).toBe(1);
    expect(clampLimit(50)).toBe(20);
    expect(clampLimit(7.9)).toBe(7);
  });
  it('pages with offset and reports the total', () => {
    const page1 = searchCars(cars, { limit: 3 });
    const page2 = searchCars(cars, { limit: 3, offset: 3 });
    expect(page1.total).toBe(10);
    expect(page1.cars).toHaveLength(3);
    expect(page2.cars).toHaveLength(3);
    expect(slugs(page1)).not.toEqual(slugs(page2));
  });
});

describe('findCar', () => {
  it('finds by slug, id, or pasted VDP URL', () => {
    expect(findCar(cars, '2021-lexus-rx-350-1007')?.id).toBe('1007');
    expect(findCar(cars, '1007')?.slug).toBe('2021-lexus-rx-350-1007');
    expect(findCar(cars, 'https://shopbestest.com/used/2021-LEXUS-rx-350-1007')?.id).toBe('1007');
    expect(findCar(cars, 'nope')).toBeNull();
  });
});

describe('listSegments', () => {
  it('counts real segments and adds virtual powertrain segments with price ranges', () => {
    const segs = listSegments(cars);
    const compact = segs.find((s) => s.segment === 'Compact SUV')!;
    expect(compact.count).toBe(5);
    expect(compact.min_price).toBe(26800);
    expect(compact.max_price).toBe(39900);
    expect(compact.median_price).toBe(32750); // 26800, 28995, [32750], 33450, 39900
    expect(compact.path).toBe('/used-cars/best-used-compact-suvs');
    expect(compact.virtual).toBe(false);
    const ev = segs.find((s) => s.segment === 'Electric Vehicles')!;
    expect(ev.count).toBe(2);
    expect(ev.virtual).toBe(true);
    expect(segs.find((s) => s.segment === 'Hybrids')!.count).toBe(1);
    // sorted by count desc
    expect(segs[0].segment).toBe('Compact SUV');
  });
});
