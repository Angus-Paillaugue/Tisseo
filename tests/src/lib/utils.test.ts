import { expect, test, describe } from 'vitest';
import { cn, tzOffetter } from '$lib/utils';

describe('cn', () => {
	test('should merge class names correctly', () => {
		expect(cn('foo', 'bar')).toBe('foo bar');
	});

	test('should handle conditional classes', () => {
		expect(cn('foo', { bar: true, baz: false })).toBe('foo bar');
	});

	test('should merge tailwind classes', () => {
		expect(cn('p-4 bg-red-500', 'p-8')).toBe('bg-red-500 p-8');
	});

	test('should handle null and undefined', () => {
		expect(cn('foo', null, undefined, 'bar')).toBe('foo bar');
	});

	test('should handle empty strings', () => {
		expect(cn('', 'foo', '')).toBe('foo');
	});
});

describe('tzOffetter', () => {
	test('should convert Tisseo time (Paris) to UTC', () => {
		const parisTime = '2025-02-27 18:00:00';
		const result = tzOffetter.fromTisseoToUTC(parisTime);
		expect(result).toBeInstanceOf(Date);
		// Paris is UTC+1 in winter, UTC+2 in summer
		expect(result.getUTCHours()).toBe(17); // Assuming winter time
	});

	// We can't test the conversion from UTC to local time because it depends on the local timezone
});
