import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { BASE_API_URL } from '$lib/constants';

export const GET: RequestHandler = async ({ url }) => {
	const query = url.searchParams.get('query');
	const endpoint = `${BASE_API_URL}/places.json?key=${env.TISSEO_API_KEY}&displayOnlyStopAreas=1&term=${query}`;
	const res = await fetch(endpoint);
	const data = await res.json();

	const headers: Record<string, string> = {};

	if (env.NODE_ENV !== 'production') {
		headers['Cache-Control'] = 'max-age=60';
	}

	return json(data.placesList.place, { headers });
};
