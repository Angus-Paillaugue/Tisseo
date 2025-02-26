import type { LineConfig } from '$lib/types';

export const getConfig = async (fetchFN?: typeof fetch): Promise<LineConfig[]> => {
	// Solution 1: vite iport
	// Issue : bundled so no updates on file change
	// const fileContents = await import('./lines.json') as { default: LineConfig[] };
	// return fileContents.default;

	// Solution 2: fetch a route that fs.readFile the lines config file
	// WORKS BOTH IN DEV AND PROD!!!
	const res = await (fetchFN ?? fetch)('/api/config');
	const data = await res.json();

	return data;
};
