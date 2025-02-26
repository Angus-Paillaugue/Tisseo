import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { BASE_API_URL } from '$lib/constants';
import { getConfig } from '$lib/config';
import type { TisseoNetworkMessagesResponse } from '$lib/types';

export const GET: RequestHandler = async ({ fetch }) => {
	const endpoint = `${BASE_API_URL}/messages.json?key=${env.TISSEO_API_KEY}&contentFormat=html`;
	const res = await fetch(endpoint);
	const data: TisseoNetworkMessagesResponse = (await res.json()).messages;
	const trackedStops = await getConfig(fetch);

	const messagesRelatedToMyLines = data.filter((message) => {
		return (
			trackedStops.some((line) => message?.lines?.map((l) => l.id)?.includes(line.lineId)) ||
			!message?.lines
		);
	});

	const headers: Record<string, string> = {};

	if (env.NODE_ENV !== 'production') {
		headers['Cache-Control'] = 'max-age=60';
	}

	return json(messagesRelatedToMyLines, { headers });
};
