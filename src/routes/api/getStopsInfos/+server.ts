import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { BASE_API_URL } from '$lib/constants';
import type { Line, Stop } from '$lib/types';

async function getStoInfos(stopId: Stop['id'], lineId: Line['id']): Promise<{ stop: Stop; line: Line }> {
	const endpoint = `${BASE_API_URL}/stops_schedules.json?key=${env.TISSEO_API_KEY}&stopPointId=${stopId}&lineId=${lineId}`;
	const res = await fetch(endpoint);
	const data = await res.json();

	const stop = data.departures.stop;
	const line = data.departures.departure[0].line;

	return { stop, line };
}

export const POST: RequestHandler = async ({ request }) => {
	const { stops } = await request.json();

	if (!stops) {
		return json({ error: 'Missing stops' }, { status: 400 });
	}

	const responseData: { stop: Stop; line: Line }[] = [];

	for (const stop of stops) {
		const { stopId, lineId } = stop;
		const data = await getStoInfos(stopId, lineId);
		responseData.push(data);
	}

	const headers: Record<string, string> = {};

	if(env.NODE_ENV !== 'production') {
		headers['Cache-Control'] = 'max-age=60'
	}

	return json(responseData, { headers });
};
