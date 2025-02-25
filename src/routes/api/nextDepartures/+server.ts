import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import type { Stop, Line, TisseoNextDepartureResponse, Departures, Departure } from '$lib/types';
import { env } from '$env/dynamic/private';
import { TISSEO_API_KEY } from '$env/static/private';
import { BASE_API_URL } from '$lib/constants';
import trackedStops from '@config/lines.json';

const STOP_SCHEDULE_URL = BASE_API_URL + `/stops_schedules.json?key=${TISSEO_API_KEY}`;
const RESULT_PER_LINE = 3;

// Fetch the next departures at a given stop for a given line
const getNextDeparturesAtStop = async (
	stopId: Stop['id'],
	lineId: Line['id']
): Promise<TisseoNextDepartureResponse> => {
	console.log('Sending a request to Tisseo API');
	const res = await fetch(
		`${STOP_SCHEDULE_URL}&stopPointId=${stopId}&lineId=${lineId}&number=${RESULT_PER_LINE}`
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

export const GET: RequestHandler = async () => {
	let expirationDate = new Date();
	const departures: Departure[] = [];

	// Fetch next departures for each line, format them and store them in the departures array
	for (const track of trackedStops) {
		const { stopId, lineId } = track;
		const data = await getNextDeparturesAtStop(stopId, lineId);
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

	return json(response, { headers });
};
