import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';
import { TISSEO_API_KEY } from '$env/static/private';
import { BASE_API_URL } from '$lib/constants';

export const GET: RequestHandler = async ({ url }) => {
	const area = url.searchParams.get('area');
	const endpoint = `${BASE_API_URL}/stop_points.json?key=${TISSEO_API_KEY}&stopAreaId=${area}`;
	const res = await fetch(endpoint);
	const data = await res.json();

	return json(data.physicalStops);
};
