import { expect, test, describe, vi } from 'vitest';
import { Logger } from '$lib/logger';

describe('Logger', () => {
	test('error logs to console.error', () => {
		const spy = vi.spyOn(console, 'error');
		Logger.error('test error');
		expect(spy).toHaveBeenCalledWith('[ERROR]:', 'test error');
		spy.mockRestore();
	});

	test('warn logs to console.warn', () => {
		const spy = vi.spyOn(console, 'warn');
		Logger.warn('test warning');
		expect(spy).toHaveBeenCalledWith('[WARN]:', 'test warning');
		spy.mockRestore();
	});

	test('info logs to console.info', () => {
		const spy = vi.spyOn(console, 'info');
		Logger.info('test info');
		expect(spy).toHaveBeenCalledWith('[INFO]:', 'test info');
		spy.mockRestore();
	});

	test('debug logs to console.debug', () => {
		const spy = vi.spyOn(console, 'debug');
		Logger.debug('test debug');
		expect(spy).toHaveBeenCalledWith('[DEBUG]:', 'test debug');
		spy.mockRestore();
	});

	test('debug_count logs to console.count', () => {
		const spy = vi.spyOn(console, 'count');
		Logger.debug_count('test count');
		expect(spy).toHaveBeenCalledWith('[DEBUG]: test count');
		spy.mockRestore();
	});

	test('methods handle multiple arguments', () => {
		const spy = vi.spyOn(console, 'error');
		Logger.error('test', 123, { foo: 'bar' });
		expect(spy).toHaveBeenCalledWith('[ERROR]:', 'test', 123, { foo: 'bar' });
		spy.mockRestore();
	});
});
