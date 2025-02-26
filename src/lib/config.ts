import type { ConfigFile, Config } from '$lib/types';

const DEFAULT_CONFIG: Config = {
	$schema: '',
	pollInterval: 60,
	toTrack: []
};

const mergeConfig = (config: ConfigFile): Config => {
	return {
		...DEFAULT_CONFIG,
		...config
	};
};

export const getConfig = async (fetchFN?: typeof fetch): Promise<Config> => {
	// Solution 1: vite iport
	// Issue : bundled so no updates on file change
	// const fileContents = await import('./lines.json') as { default: LineConfig[] };
	// return fileContents.default;

	// Solution 2: fetch a route that fs.readFile the lines config file
	// WORKS BOTH IN DEV AND PROD!!!
	const res = await (fetchFN ?? fetch)('/api/config');
	const data = await res.json();

	return mergeConfig(data);
};
