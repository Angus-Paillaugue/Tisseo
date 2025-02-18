import jsdom from 'jsdom';
import { writeFile, readFile } from 'fs/promises';

const TISSEO_URL_BASE = 'https://www.tisseo.fr';
const stopsFileName = 'stops.json';
const linesFileName = 'lines.json';

const listLines = async () => {
	const baseUrl = TISSEO_URL_BASE + '/prochains-passages';
	const res = await fetch(baseUrl);
	const html = await res.text();
	const doc = new jsdom.JSDOM(html);
	const select = (q, src = doc.window.document) => src.querySelectorAll(q);

	const lines = select('table.table tr td > a');
	const linesWithDuplicates = Array.from(lines)
		.map((line) => line.getAttribute('href'))
		.filter((url) => url.startsWith('/'))
		.map((url) => TISSEO_URL_BASE + url);

  return Array.from(new Set(linesWithDuplicates));
};

const listStops = async (lineUrl) => {
	const res = await fetch(lineUrl);
	const html = await res.text();
	const doc = new jsdom.JSDOM(html);
	const select = (q, src = doc.window.document) => src.querySelectorAll(q);

	const stops = select('table.table tr td > a');
	return Array.from(stops)
		.map((stop) => stop.getAttribute('href'))
		.filter((url) => url.startsWith('/'))
		.map((url) => TISSEO_URL_BASE + url);
};

const getDirectionsStops = async (stopUrl) => {
	const res = await fetch(stopUrl);
	const html = await res.text();
	const doc = new jsdom.JSDOM(html);
	const select = (q, src = doc.window.document) => src.querySelectorAll(q);

	const directions = select('table.table tr td > a');
  return Array.from(directions)
    .filter((direction) => direction.getAttribute('href').startsWith('/'))
    .map((direction) => {
      return {
        url: TISSEO_URL_BASE + direction.getAttribute('href'),
        direction: direction.textContent.trim().replace(/\s*\([^)]*\)/g, '').trim(),
      };
    });
};

const getStopInfos = async ({ url, direction }) => {
	const res = await fetch(url);
	const html = await res.text();
	const doc = new jsdom.JSDOM(html);
	const select = (q, src = doc.window.document) => src.querySelectorAll(q);

	url = new URL(url);
	const stopId = select("div.col-md-9 > div:nth-child(2) > strong:nth-child(1)")[0].textContent.trim();
	const stopLabel = select('div.col-md-9 > div:nth-child(3) > strong:nth-child(1)')[0].textContent.trim();
	const lineId = url.searchParams.get('line_id');

	return {
		stopId,
		stopLabel,
		lineId,
		direction
	};
};
	
// Check if stop is a terminus (i.e., no direction links)
const isTerminusStop = async (stopUrl) => {
	const res = await fetch(stopUrl);
	const html = await res.text();
	const doc = new jsdom.JSDOM(html);
	const select = (q, src = doc.window.document) => src.querySelectorAll(q);

	const directions = select('table.table tr td > a');
	return Array.from(directions).length <= 1;
};

async function extractStops() {
  let stopsFileContents = JSON.parse(await readFile(stopsFileName, 'utf-8') || '[]');
	const linesToNoScrape = [
		'line:61',
		'line:69',
		'line:68',
		'line:204',
		'line:99',
		'line:108',
		'line:223',
		'line:107'
	];
	const lines = await listLines();

	for (const line of lines) {
    const stops = await listStops(line);

    for (const stop of stops) {
			if(linesToNoScrape.includes(new URL(stop).searchParams.get('line_id'))) {
				continue;
			}
      // Use isTerminusStop to check if the stop is a terminus
      const isTerminus = await isTerminusStop(stop);

      if (isTerminus) {
        // This is a terminus, no need for a direction page, fetch stop directly
        const stopInfos = await getStopInfos({ url: stop, direction: null });
        stopsFileContents.push(stopInfos);
      } else {
        // This stop has directions, process each direction
        const directions = await getDirectionsStops(stop);
        for (const direction of directions) {
					const stopInfos = await getStopInfos(direction);
          stopsFileContents.push(stopInfos);
          // Write the stops data to file
          await writeFile(stopsFileName, JSON.stringify(stopsFileContents, null, 2));
        }
      }
    }
	}

}

async function extractLines() {
  let linesFileContents = [];
  const baseUrl = TISSEO_URL_BASE + '/prochains-passages';
	const res = await fetch(baseUrl);
	const html = await res.text();
	const doc = new jsdom.JSDOM(html);
	const select = (q, src = doc.window.document) => src.querySelectorAll(q);

	const lines = select('table.table > tbody > tr');
  for(const line of lines) {
    const lineUrl = TISSEO_URL_BASE + line.querySelector('td a').getAttribute('href');
    const lineId = new URL(lineUrl).searchParams.get('line_id');
    const lineColor = line.querySelector('.line-tag').style.backgroundColor;
    const lineLabel = line.querySelector('.line-tag').getAttribute('aria-label');
    const directions = line.querySelector('td:nth-child(2) a').textContent.trim().split(' / ');
    const lineInfos = {
			id: lineId,
			label: lineLabel,
			color: lineColor,
		};
    directions.forEach((direction) => {
      const newLineInfo = { ...lineInfos, direction };
      linesFileContents.push(newLineInfo);
    });
    await writeFile(linesFileName, JSON.stringify(linesFileContents, null, 2));
  }
}

(async () => {
	await extractStops();

  // await extractLines();
})();


// TODO: fix scaping fo lines like navette aeroport where there is no label
