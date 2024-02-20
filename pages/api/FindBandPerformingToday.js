import { load } from "cheerio";
import { ShowDateComparer } from "../../components/CurrentShift";
// URL of the website with the list of bands and dates
// const websiteUrl = "https://teragramballroom.com/";
const websiteUrl = "https://themoroccan.com/";

// Function to fetch the HTML content of the website
async function fetchWebsiteData(url) {
	const fetch = await import("node-fetch");
	const response = await fetch.default(url);
	return await response.text();
}

// Function to find the band performing today
function findBandPerformingToday(html) {
	const $ = load(html);
	const events = $(".eventinfo"); // Select all event info containers
	const today = ShowDateComparer();
	let bandPerformingToday = [];

	events.each(function () {
		const bandName = $(this).find(".tw-name a").text().trim(); // Find the band name
		const eventDate = $(this)
			.find(".tw-event-date")
			.text()
			.trim()
			.replace(",", "")
			.replace("@", "")
			.trim();

		console.log("Band Name:", bandName);
		console.log("Event Date:", eventDate);
		console.log("Today Date:", today);

		if (eventDate === today) {
			console.log(eventDate, today);
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
		res.status(200).json({ bandPerformingToday });
	} catch (error) {
		console.error("Error fetching website data:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
}
