import { expect, test, describe } from 'vitest';
import { Cache } from '$lib/cache';

describe('Cache', () => {
	test('should store and retrieve data', () => {
		const cache = new Cache<string>(1000);
		cache.set('key', 'value');
		expect(cache.get('key')).toBe('value');
	});

	test('should return null for missing key', () => {
		const cache = new Cache<string>(1000);
		expect(cache.get('missing')).toBeNull();
	});

	test('should expire cached data', async () => {
		const cache = new Cache<string>(100);
		cache.set('key', 'value');
		await new Promise((resolve) => setTimeout(resolve, 150));
		expect(cache.get('key')).toBeNull();
	});

	test('should work with different data types', () => {
		const cache = new Cache<number>(1000);
		cache.set('num', 42);
		expect(cache.get('num')).toBe(42);

		const objCache = new Cache<object>(1000);
		const testObj = { test: true };
		objCache.set('obj', testObj);
		expect(objCache.get('obj')).toEqual(testObj);
	});
});
