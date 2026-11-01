import { describe, expect, it } from 'vitest';
import { haversineMiles, lookupZip, normalizeZip, zipCount } from '../src/geo.js';

describe('geo', () => {
  it('haversine matches known distances', () => {
    // Orange (92868) to Irvine Spectrum (92618): roughly 11 miles.
    const d = haversineMiles(33.788, -117.875, 33.666, -117.732);
    expect(d).toBeGreaterThan(10);
    expect(d).toBeLessThan(13);
    expect(haversineMiles(33.788, -117.875, 33.788, -117.875)).toBe(0);
    // LA to San Diego, about 112 mi.
    const la_sd = haversineMiles(34.0522, -118.2437, 32.7157, -117.1611);
    expect(la_sd).toBeGreaterThan(108);
    expect(la_sd).toBeLessThan(116);
  });

  it('normalizes zip input', () => {
    expect(normalizeZip('92868')).toBe('92868');
    expect(normalizeZip(' 92868-1234 ')).toBe('92868');
    expect(normalizeZip(92868)).toBe('92868');
    expect(normalizeZip('9286')).toBeNull();
    expect(normalizeZip('abcde')).toBeNull();
    expect(normalizeZip(null)).toBeNull();
  });

  it('bundled table covers Orange County and nearby, not the whole country', () => {
    expect(zipCount()).toBeGreaterThan(300);
    for (const z of ['92868', '92618', '92660', '92801', '90802', '92880', '92008', '90210']) {
      const ll = lookupZip(z);
      expect(ll, z).not.toBeNull();
      expect(ll!.lat).toBeGreaterThan(32);
      expect(ll!.lat).toBeLessThan(35.5);
      expect(ll!.lng).toBeGreaterThan(-120);
      expect(ll!.lng).toBeLessThan(-115);
    }
    expect(lookupZip('10001')).toBeNull();
  });
});
