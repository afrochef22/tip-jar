import { load } from "cheerio";
import { ShowDateComparer } from "../../lib/shiftDate";
// URL of the website with the list of bands and dates
const websiteUrl = "https://teragramballroom.com/";
// const websiteUrl = "https://themoroccan.com/";

// Function to fetch the HTML content of the website
async function fetchWebsiteData(url) {
	// Node 18+ has fetch built in, so no need for the node-fetch package.
	// Don't leave the shift screen waiting on a slow venue site.
	const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
	if (!response.ok) throw new Error(`Venue site returned ${response.status}`);
	return await response.text();
}

// Function to find the band performing today
function findBandPerformingToday(html) {
	const $ = load(html);
	const events = $(".twelve"); // Select all event info containers
	const today = ShowDateComparer();
	let bandPerformingToday = [];

	events.each(function () {
		const bandName = $(this).find(".tw-name").text().trim(); // Find the band name
		const eventDate = $(this)
			.find(".tw-event-date")
			.text()
			.trim()
			.replace(",", "")
			.replace("@", "")
			.trim();

		if (eventDate === today) {
			bandPerformingToday.push(bandName);
			// return false;
			// Exit the loop early once we find the band performing today
		}
	});

	return bandPerformingToday;
}

// Fetch website data and find the band performing today
export default async function handler(req, res) {
	try {
		const html = await fetchWebsiteData(websiteUrl);
		const bandPerformingToday = findBandPerformingToday(html);
		// Let Vercel's CDN reuse the answer for an hour. The client includes the
		// shift date in the URL, so the cache rolls over with the shift.
		res.setHeader(
			"Cache-Control",
			"public, s-maxage=3600, stale-while-revalidate=600"
		);
		res.status(200).json({ bandPerformingToday });
	} catch (error) {
		console.error("Error fetching website data:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
}
