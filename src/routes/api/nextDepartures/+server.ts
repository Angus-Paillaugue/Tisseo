import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import type { TisseoNextDepartureResponse, Departures, Departure, LineConfig } from '$lib/types';
import { env } from '$env/dynamic/private';
import { BASE_API_URL } from '$lib/constants';
import { getConfig } from '$lib/config';
import { Logger } from '$lib/logger';

const STOP_SCHEDULE_URL = BASE_API_URL + `/stops_schedules.json?key=${env.TISSEO_API_KEY}`;
const DEFAULT_RESULT_PER_LINE = 5;

// Fetch the next departures at a given stop for a given line
const getNextDeparturesAtStop = async (entry: LineConfig): Promise<TisseoNextDepartureResponse> => {
	if (env.NODE_ENV !== 'production') console.count('Sending a request to Tisseo API');
	const res = await fetch(
		`${STOP_SCHEDULE_URL}&stopPointId=${entry.stopId}${entry.lineId ? '&lineId=' + entry.lineId : ''}&number=${entry?.numberOfResults ?? DEFAULT_RESULT_PER_LINE}`
	);
	const data = await res.json();
	return data;
};

// Transform the raw response from Tisseo API to a more usable format
const formatNextDepartures = (data: TisseoNextDepartureResponse): Departure[] => {
	const stop: Departure['stop'] = {
		id: data.departures.stop.id,
		name: data.departures.stop.name
	};

	return data.departures.departure.map((departure) => {
		const line: Departure['line'] = {
			bgXmlColor: departure.line.bgXmlColor,
			fgXmlColor: departure.line.fgXmlColor,
			id: departure.line.id,
			shortName: departure.line.shortName
		};
		const dateTime: Departure['dateTime'] = new Date(departure.dateTime);
		const destination: Departure['destination'] = departure.destination[0].name;
		return { dateTime, destination, line, stop };
	});
};

// Sort departures by date
const orderByDate = (a: Departure, b: Departure) => {
	return a.dateTime.getTime() - b.dateTime.getTime();
};

export const GET: RequestHandler = async ({ fetch, url }) => {
	try {
		const toExclude =
			url.searchParams
				.get('toExclude')
				?.split(',')
				?.filter((e) => e !== '') ?? [];
		let expirationDate = new Date();
		const departures: Departure[] = [];
		const config = await getConfig(fetch);

		const filterLines = (e: LineConfig) => {
			// Filter out lines to exclude
			if (e?.lineId && toExclude.includes(e.lineId)) return false;
			// Filter out stops to exclude
			if (toExclude.includes(e.stopId)) return false;
			// If no mathc is found, keep the entry
			return true;
		};

		// Fetch next departures for each line, format them and store them in the departures array
		const toFetch = config.toTrack.filter(filterLines);
		for (const track of toFetch) {
			const data = await getNextDeparturesAtStop(track);
			expirationDate = new Date(data.expirationDate);
			departures.push(...formatNextDepartures(data));
		}

		departures.sort(orderByDate);

		const headers: Record<string, string> = {};

		if (env.NODE_ENV !== 'production') {
			headers['Cache-Control'] = 'max-age=60';
		}

		const response: Departures = {
			departures,
			expirationDate
		};

		await new Promise((resolve) => setTimeout(resolve, 1000));

		return json(response, { headers });
	} catch (error) {
		let message = 'Unknown Error';
		if (error instanceof Error) message = error.message;
		Logger.error(`Error while fetching next departures: ${message}`);
		return new Response(message, { statusText: message, status: 500 });
	}
};
