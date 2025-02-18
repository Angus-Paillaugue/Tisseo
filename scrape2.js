import jsdom from 'jsdom';
import { writeFile } from 'fs/promises';

const TISSEO_URL_BASE = 'https://www.tisseo.fr';
const stopsFileName = 'stops.json';
const linesFileName = 'lines.json';

const fetchHtml = async (url) => {
	const res = await fetch(url);
	return new jsdom.JSDOM(await res.text());
};

const listLines = async () => {
	const doc = await fetchHtml(TISSEO_URL_BASE + '/prochains-passages');
	const lines = doc.window.document.querySelectorAll('table.table > tbody > tr');
	let linesData = [];

	for (const line of lines) {
		const lineUrl = TISSEO_URL_BASE + line.querySelector('td a').getAttribute('href');
		const lineId = new URL(lineUrl).searchParams.get('line_id');
		const lineColor = line.querySelector('.line-tag').style.backgroundColor;
		const lineLabel = line.querySelector('.line-tag').getAttribute('aria-label');
		const directions = line.querySelector('td:nth-child(2) a').textContent.trim().split(' / ');

		directions.forEach((direction) => {
			linesData.push({ id: lineId, label: lineLabel, color: lineColor, direction });
		});
	}
	await writeFile(linesFileName, JSON.stringify(linesData, null, 2));
	return linesData;
};

const listStops = async (line) => {
	const doc = await fetchHtml(`${TISSEO_URL_BASE}/prochains-passages?line_id=${line.id}`);
	const stops = doc.window.document.querySelectorAll('table.table tr td > a');

	return Array.from(stops).map((stop) => {
		const url = new URL(TISSEO_URL_BASE + stop.getAttribute('href'));
		return { id: url.searchParams.get('stop_area_id'), name: stop.textContent.trim() };
	});
};

const extractStops = async (lines) => {
	let stopsData = [];

	for (const line of lines) {
		const stops = await listStops(line);
		stops.forEach(async (stop) => {
			let existingStop = stopsData.find((s) => s.id === stop.id);
			if (!existingStop) {
				existingStop = { id: stop.id, name: stop.name, lines: [] };
				stopsData.push(existingStop);
			}
			existingStop.lines.push({ lineId: line.id, direction: line.direction });
      await writeFile(stopsFileName, JSON.stringify(stopsData, null, 2));
		});
	}
};

const getStopInfos = async ({ url, direction }) => {
	const res = await fetch(url);
	const html = await res.text();
	const doc = new jsdom.JSDOM(html);
	const select = (q, src = doc.window.document) => src.querySelector(q);

	url = new URL(url);
	const stopIdElement = select("div.col-md-9 > div:nth-child(2) > strong:nth-child(1)");
	const stopLabelElement = select("div.col-md-9 > div:nth-child(3) > strong:nth-child(1)");

	const stopId = stopIdElement ? stopIdElement.textContent.trim() : null;
	const stopLabel = stopLabelElement ? stopLabelElement.textContent.trim() : null;
	const lineId = url.searchParams.get('line_id');

	return {
		id: stopId,
		label: stopLabel,
		lineId,
		direction
	};
};

(async () => {
	const lines = await listLines();
	await extractStops(lines);
})();
