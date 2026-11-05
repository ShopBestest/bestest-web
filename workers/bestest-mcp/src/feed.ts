// Fetches the public inventory feed with a short cache.
// Two layers: a module-scope memory cache (survives across requests while the isolate
// lives) and Cloudflare's edge cache on the subrequest (`cf.cacheTtl`).
import { normalizeFeed, type Car } from './inventory.js';

export interface FeedEnv {
  FEED_URL: string;
  FEED_CACHE_SECONDS?: string;
}

export type InventoryLoader = () => Promise<Car[]>;

interface MemoryCache {
  url: string;
  cars: Car[];
  fetchedAt: number;
}

let memory: MemoryCache | null = null;

export const DEFAULT_CACHE_SECONDS = 300;

export function cacheSeconds(env: FeedEnv): number {
  const n = parseInt(env.FEED_CACHE_SECONDS ?? '', 10);
  return Number.isFinite(n) && n > 0 ? n : DEFAULT_CACHE_SECONDS;
}

export class FeedError extends Error {}

export function createInventoryLoader(env: FeedEnv, fetchImpl: typeof fetch = fetch): InventoryLoader {
  const url = env.FEED_URL;
  const ttlMs = cacheSeconds(env) * 1000;
  return async () => {
    const now = Date.now();
    if (memory && memory.url === url && now - memory.fetchedAt < ttlMs) return memory.cars;
    let res: Response;
    try {
      res = await fetchImpl(url, {
        headers: { accept: 'application/json', 'user-agent': 'bestest-mcp/0.1 (+https://shopbestest.com)' },
        // Edge-cache the subrequest for the same window (ignored outside Workers).
        cf: { cacheTtl: Math.floor(ttlMs / 1000), cacheEverything: true }
      } as RequestInit);
    } catch (e) {
      if (memory && memory.url === url) return memory.cars; // serve stale on network error
      throw new FeedError(`Inventory feed unreachable: ${(e as Error).message}`);
    }
    if (!res.ok) {
      if (memory && memory.url === url) return memory.cars;
      throw new FeedError(`Inventory feed returned HTTP ${res.status}`);
    }
    const json = await res.json();
    const cars = normalizeFeed(json);
    memory = { url, cars, fetchedAt: now };
    return cars;
  };
}

/** Test hook. */
export function resetFeedCache(): void {
  memory = null;
}
