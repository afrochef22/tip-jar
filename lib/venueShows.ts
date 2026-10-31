// Reads the show list off teragramballroom.com's home page. Pure so it can be
// tested:
//   node --test tests/
//
// The site has no API, so this depends on its CSS class names. The page
// always lists upcoming shows, so finding none at all means the site's layout
// changed and the lookup is broken, not that the venue is dark.
import { load } from "cheerio";

// "Fri, October 23" (sometimes with "@ 8pm" style extras stripped) -> "Fri October 23"
const DATE = /^[A-Z][a-z]{2} [A-Z][a-z]+ \d{1,2}$/;

export type VenueShow = { name: string; date: string };

export function parseVenueShows(html: string) {
	const $ = load(html);
	const shows: VenueShow[] = [];
	$(".twelve").each(function () {
		const name = $(this).find(".tw-name").text().trim();
		const date = $(this)
			.find(".tw-event-date")
			.text()
			.trim()
			.replace(",", "")
			.replace("@", "")
			.trim();
		if (name && DATE.test(date)) shows.push({ name, date });
	});
	return shows;
}

// `today` is ShowDateComparer()'s format, e.g. "Fri October 23".
export function showsOn(shows: VenueShow[], today: string) {
	return shows.filter((s) => s.date === today).map((s) => s.name);
}
