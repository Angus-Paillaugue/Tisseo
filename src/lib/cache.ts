export class Cache<T> {
	private cache = new Map<string, { data: T; expiry: number }>();
	private duration: number;

	constructor(duration: number) {
		this.duration = duration;
	}

	get(key: string): T | null {
		const cached = this.cache.get(key);
		if (cached && cached.expiry > Date.now()) {
			return cached.data;
		}
		return null;
	}

	set(key: string, data: T): void {
		this.cache.set(key, { data, expiry: Date.now() + this.duration });
	}
}
