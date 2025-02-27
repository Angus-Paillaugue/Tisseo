/**
 * A generic caching class that stores data with an expiration time.
 * @typeParam T - The type of data to be stored in the cache
 */
export class Cache<T> {
	private cache = new Map<string, { data: T; expiry: number }>();
	private duration: number;

	/**
	 * Creates a new Cache instance.
	 * @param duration - The duration in milliseconds for which cache entries should remain valid
	 */
	constructor(duration: number) {
		this.duration = duration;
	}

	/**
	 * Retrieves a value from the cache if it exists and hasn't expired.
	 * @param key - The key to look up in the cache
	 * @returns The cached value if it exists and hasn't expired, null otherwise
	 */
	get(key: string): T | null {
		const cached = this.cache.get(key);
		if (cached && cached.expiry > Date.now()) {
			return cached.data;
		}
		return null;
	}

	/**
	 * Stores a value in the cache with the specified expiration time.
	 * @param key - The key under which to store the value
	 * @param data - The data to store in the cache
	 */
	set(key: string, data: T): void {
		this.cache.set(key, { data, expiry: Date.now() + this.duration });
	}
}
