// Response-text formatting found while exercising the Worker under wrangler dev (2026-11-04).
import { describe, expect, it } from 'vitest';
import fixture from './fixture.json';
import { normalizeFeed, searchCars } from '../src/inventory.js';
import { displayName, formatCar, formatSearch } from '../src/mcp.js';

const SITE = 'https://shopbestest.com';
const cars = normalizeFeed(fixture);

describe('displayName', () => {
  it('does not repeat words the title already ends with', () => {
    expect(displayName('2023 Toyota RAV4 Hybrid', 'Hybrid XLE')).toBe('2023 Toyota RAV4 Hybrid XLE');
    expect(displayName('2022 Toyota RAV4 XLE', 'XLE')).toBe('2022 Toyota RAV4 XLE');
    expect(displayName('2023 Toyota RAV4 Prime', 'prime SE')).toBe('2023 Toyota RAV4 Prime SE');
  });
  it('appends the trim when there is no overlap, and handles a blank trim', () => {
    expect(displayName('2021 Honda CR-V', 'EX-L')).toBe('2021 Honda CR-V EX-L');
    expect(displayName('2021 Honda CR-V', '')).toBe('2021 Honda CR-V');
  });
});

describe('response text', () => {
  it('uses "qualifies" for a single result and "qualify" otherwise', () => {
    const one = formatSearch(SITE, searchCars(cars, { powertrain: 'hybrid' }), 'hybrid');
    expect(one).toMatch(/^1 screened car qualifies for: hybrid/);
    const many = formatSearch(SITE, searchCars(cars, { segment: 'Compact SUV' }), 'Compact SUV');
    expect(many).toMatch(/^5 screened cars qualify for/);
  });
  it('renders the hybrid RAV4 without a doubled "Hybrid"', () => {
    const car = cars.find((c) => c.id === '1002')!;
    expect(formatCar(SITE, car).split('\n')[0]).toBe('2023 Toyota RAV4 Hybrid XLE');
    expect(formatSearch(SITE, searchCars(cars, { powertrain: 'hybrid' }), 'hybrid')).not.toMatch(/Hybrid Hybrid/);
  });
});
