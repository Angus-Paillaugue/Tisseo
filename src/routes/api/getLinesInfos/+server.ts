import { BASE_API_URL } from '$lib/constants';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';
import { json } from '@sveltejs/kit';
import { getConfig } from '$lib/config';
import type { Line } from '$lib/types';
import { Cache } from '$lib/cache';
import { Logger } from '$lib/logger';

interface TisseoResponse {
	lines: {
		line: Line[];
	};
}

const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours
const cache = new Cache<TisseoResponse>(CACHE_DURATION);

export const GET: RequestHandler = async ({ fetch }) => {
	const config = await getConfig(fetch);
	const lines = config.toTrack.map((line) => line.lineId).filter((l) => l !== undefined);

	const enpoint = BASE_API_URL + `/lines.json?key=${env.TISSEO_API_KEY}&lineId={{lineId}}`;

	const promises = lines.map(async (lineId) => {
		const cachedData = cache.get(lineId);
		if (cachedData) {
			Logger.debug('/api/getLinesInfos - Cache hit');
			return cachedData;
		}
		Logger.debug('/api/getLinesInfos - Cache miss');

		const response = await fetch(enpoint.replace('{{lineId}}', lineId));
		const data: TisseoResponse = await response.json();
		cache.set(lineId, data);
		return data;
	});

	const data = await Promise.all(promises);
	const lineData = data.map((line) => {
		return line.lines.line[0];
	});

	return json(lineData);
};
