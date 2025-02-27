import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { DateTime } from 'luxon';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export const noop = (...args: unknown[]) => {
	void args;
};

export class tzOffetter {
	// Handle conversion from Tisseo time (Paris) to UTC
	static fromTisseoToUTC(dateStr: string) {
		return DateTime.fromSQL(dateStr, { zone: 'Europe/Paris' }).toUTC().toJSDate();
	}

	// Hanndle conversion from UTC to local time
	static fromUTCToLocale(dateStr: string | Date) {
		if (dateStr instanceof Date) {
			return DateTime.fromJSDate(dateStr, { zone: 'UTC' }).toLocal().toJSDate();
		}
		return DateTime.fromISO(dateStr, { zone: 'UTC' }).toLocal().toJSDate();
	}
}
