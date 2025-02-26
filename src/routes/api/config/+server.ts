import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { readFile, mkdir, writeFile, access } from 'fs/promises';
import { constants } from 'fs';

const CONFIG_FILE_PATH = 'config/lines.json';

const DEMO_CONFIG = [
	{
		stopId: 'stop_point:SP_1702',
		lineId: 'line:144',
		walkTime: 3
	},
	{
		stopId: 'stop_point:SP_3434',
		lineId: 'line:96',
		walkTime: 10
	},
	{
		stopId: 'stop_point:SP_2443',
		lineId: 'line:182',
		walkTime: 1
	},
	{
		stopId: 'stop_point:SP_2892',
		lineId: 'line:142',
		walkTime: 5
	}
];

function checkFileExists(file: string): Promise<boolean> {
	return access(file, constants.F_OK)
		.then(() => true)
		.catch(() => false);
}

export const GET: RequestHandler = async () => {
  // Creates config dir if it doesn't exist
  await mkdir(CONFIG_FILE_PATH.split('/').slice(0, -1).join('/'), { recursive: true });

  // Creates config file with exemple config if it doesn't exist
  const fileExists = await checkFileExists(CONFIG_FILE_PATH);
  if (!fileExists) {
		await writeFile(CONFIG_FILE_PATH, JSON.stringify(DEMO_CONFIG, null, 2), 'utf-8');
  }
  // Reads config file
  const data = await readFile(CONFIG_FILE_PATH, 'utf-8');

	const cachingDuration = 60 * 60; // 1 hour

	const headers: Record<string, string> = {};
	headers['Cache-Control'] = `max-age=${cachingDuration}`;

	return json(JSON.parse(data), { headers });
};
