import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import jsdom from 'jsdom';
import { linesToTrack } from '@config/lines.config';
import type { Line, Stop } from '$lib/types';
import { getLineWithStopAndLabel, getLineStop } from '$lib/lines';
import { env } from '$env/dynamic/private';

let refreshedAt = new Date();

interface IncomingDeparture {
	line: Line;
	departures: Date[];
	stop: ReturnType<typeof getLineStop>;
}

interface FlattenedDeparture {
	line: Line;
	date: Date;
	stop: ReturnType<typeof getLineStop>;
}

async function getPage(lineId: Line['id'], stopId: Stop['id']): Promise<string> {
	const res = await fetch(
		`https://www.tisseo.fr/prochains-passages?line_id=${lineId}&stop_num=${stopId}`
	);
	refreshedAt = new Date();
	return res.text();
}

async function extractNextDepartures(page: string): Promise<Date[]> {
	const trimTime = (time: string): string => time.replace(/\s+/g, ' ').replace(/\*/g, '').trim();
	const isTimeString = (t: string): boolean => t.match(/^\d{2}:\d{2}$/) !== null;
	const doc = new jsdom.JSDOM(page);
	const select = (q: string, src: Element | Document = doc.window.document): NodeListOf<Element> =>
		(src as Element | Document).querySelectorAll(q);
	const nextDepartures = select('table.table > tbody > tr');
	const departures = Array.from(nextDepartures)
		.map((departure) => {
			const time = trimTime(select('td:first-child', departure)[0]?.textContent || '');
			if (!isTimeString(time)) return null;
			const dateTime = new Date();
			const [hours, minutes] = time.split(':').map((t) => parseInt(t, 10));
			dateTime.setHours(hours);
			dateTime.setMinutes(minutes);
			dateTime.setSeconds(0);
			dateTime.setMilliseconds(0);
			// Take into account busses that go past midnight
			if (dateTime < new Date()) {
				dateTime.setHours(hours + 24);
			}
			return dateTime;
		})
		.filter((d): d is Date => d !== null);
	return departures;
}

function orderDepartures(departures: IncomingDeparture[]): FlattenedDeparture[] {
	const flattened: FlattenedDeparture[] = departures.flatMap((item) =>
		item.departures.map((date) => ({
			date: date,
			...item
		}))
	);
	flattened.sort((a, b) => a.date.getTime() - b.date.getTime());

	return flattened.map(({ line, date, stop }) => ({ line, date, stop }));
}

export const GET: RequestHandler = async () => {
	const departures: IncomingDeparture[] = await Promise.all(
		linesToTrack.map(async (configEntry) => {
			const line = getLineWithStopAndLabel(configEntry.lineLabel, configEntry.stopId);
			if(!line) {
				throw new Error(`Line with label ${configEntry.lineLabel} and Stop id ${configEntry.stopId} not found`);
			}
			const page = await getPage(line.id, configEntry.stopId);
			const departures = await extractNextDepartures(page);
			const stop = getLineStop(line, configEntry.stopId);
			return {
				line,
				departures,
				stop
			};
		})
	);
	const orderedDepartures = orderDepartures(departures);
	const headers: Record<string, string> = {};
	if (env.NODE_ENV !== 'production') { // Cache for 1 minute in dev
		headers['Cache-Control'] = 'max-age=60';
	}

	return json(
		{ departures: orderedDepartures, refreshedAt },
		{ headers }
	);
};
