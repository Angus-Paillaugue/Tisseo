import jsdom from "jsdom";

async function getPage(ligne) {
  const res = await fetch(`https://www.tisseo.fr/prochains-passages?line_id=${ligne.id}&stop_num=${ligne.stopId}`);
  const text = await res.text();

  return text;
}

async function extractNextDepartures(page) {
  const trimTime = (time) => time.replace(/\s+/g, " ").replace(/\*/g, "").trim();
  const isTimeString = (t) => t.match(/^\d{2}:\d{2}$/);
  const doc = new jsdom.JSDOM(page);
  const select = (q, src) => (src ? src : doc.window.document).querySelectorAll(q);
  const nextDepartures = select("table.table > tbody > tr");
  const departures = Array.from(nextDepartures).map((departure) => {
    const time = trimTime(select("td:first-child", departure)[0].textContent);
    if(!isTimeString(time)) {
      return null;
    }
    return time;
  }).filter((d) => d !== null);
  return departures;
}

function orderDepartures(departures) {
  const flattened = departures.flatMap(item =>
    item.departures.map(departure => ({
      line: item.label,
      departure: departure,
      minutes: departure.split(':').reduce((acc, time) => acc * 60 + parseInt(time, 10))
    }))
  );

  flattened.sort((a, b) => a.minutes - b.minutes);

  return flattened.map(({ line, departure }) => ({ line, departure }));
}

function translateToRelativeTime(departures) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const relativeDepartures = departures.map(({ line, departure }) => {
    const departureMinutes = departure.split(':').reduce((acc, time) => acc * 60 + parseInt(time, 10));
    const relativeMinutes = departureMinutes - nowMinutes;
    return {
      line,
      departure,
      relativeMinutes
    };
  });
  return relativeDepartures;
}

export async function getNextDepartures(linesIds) {
  const departures = await Promise.all(linesIds.map(async (line) => {
    const page = await getPage(line);
    const departures = await extractNextDepartures(page);
    return {
      label: line.label,
      departures
    }
  }));
  const orderedDepartures = orderDepartures(departures);
  const relativeDepartures = translateToRelativeTime(orderedDepartures);
  return relativeDepartures;
}
