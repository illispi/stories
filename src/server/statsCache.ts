/**
 * allStats is public and reads whole tables, so its results are kept in memory for a minute
 * per input. Anything that changes which rows count (review results, edits, deletions, new
 * fake data) calls clearStatsCache() so the change shows up right away.
 */
const TTL_MS = 60_000;
const MAX_ENTRIES = 200;

const cache = new Map<string, { expires: number; value: Promise<unknown> }>();

export const cachedStats = <T>(key: string, compute: () => Promise<T>): Promise<T> => {
	const now = Date.now();
	const hit = cache.get(key);
	if (hit && hit.expires > now) return hit.value as Promise<T>;

	if (cache.size >= MAX_ENTRIES) {
		for (const [k, v] of cache) if (v.expires <= now) cache.delete(k);
		if (cache.size >= MAX_ENTRIES) cache.clear();
	}
	// Cache the promise, so simultaneous requests share one computation
	const value = compute();
	cache.set(key, { expires: now + TTL_MS, value });
	// Don't keep failures around
	value.catch(() => cache.delete(key));
	return value;
};

export const clearStatsCache = () => cache.clear();
