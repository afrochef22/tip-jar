import { ShowDateComparer } from "../../lib/shiftDate";
import { parseVenueShows, showsOn } from "../../lib/venueShows.mjs";
import { reportError } from "../../lib/alert";
// URL of the website with the list of bands and dates
const websiteUrl = "https://teragramballroom.com/";

// Function to fetch the HTML content of the website
async function fetchWebsiteData(url) {
	// Node 18+ has fetch built in, so no need for the node-fetch package.
	// Don't leave the shift screen waiting on a slow venue site.
	const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
	if (!response.ok) throw new Error(`Venue site returned ${response.status}`);
	return await response.text();
}

// Fetch website data and find the band performing today
export default async function handler(req, res) {
	try {
		const html = await fetchWebsiteData(websiteUrl);
		const shows = parseVenueShows(html);
		if (shows.length === 0) {
			// The site always lists upcoming shows, so none at all means its
			// layout changed. Tell the shift screen instead of "No show Today",
			// and only cache briefly so a fix shows up quickly.
			await reportError("Show lookup (venue site layout changed)", new Error("No shows found on teragramballroom.com; its layout may have changed"));
			res.setHeader("Cache-Control", "public, s-maxage=300");
			return res.status(200).json({ bandPerformingToday: [], lookupBroken: true });
		}
		// Let Vercel's CDN reuse the answer for an hour. The client includes the
		// shift date in the URL, so the cache rolls over with the shift.
		res.setHeader(
			"Cache-Control",
			"public, s-maxage=3600, stale-while-revalidate=600"
		);
		res.status(200).json({ bandPerformingToday: showsOn(shows, ShowDateComparer()) });
	} catch (error) {
		await reportError("Show lookup (venue site unreachable)", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
}
