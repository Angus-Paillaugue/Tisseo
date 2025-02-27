export class Logger {
	static error(...args: unknown[]) {
		console.error('[ERROR]:', ...args);
	}

	static warn(...args: unknown[]) {
		console.warn('[WARN]:', ...args);
	}

	static info(...args: unknown[]) {
		console.info('[INFO]:', ...args);
	}

	static debug(...args: unknown[]) {
		console.debug('[DEBUG]:', ...args);
	}

	static debug_count(arg: string) {
		console.count('[DEBUG]: ' + arg);
	}
}
