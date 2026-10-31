import { test } from "node:test";
import assert from "node:assert/strict";
import { parseVenueShows, showsOn } from "../lib/venueShows.ts";

// Trimmed copy of the venue home page's markup (2026-10-23), including the
// empty .twelve blocks the real page has between shows.
const event = (name, date) =>
	`<div class="twelve"><div class="tw-name"><a>${name}</a></div><span class="tw-event-date">${date}</span></div>`;
const page = (...events) => `<html><body>${events.join('<div class="twelve"></div>')}</body></html>`;

test("reads shows and dates off the venue page", () => {
	const shows = parseVenueShows(page(event("Justin Nozuka", "Fri, October 23"), event("Cheekface", "Sat, October 24")));
	assert.deepEqual(shows, [
		{ name: "Justin Nozuka", date: "Fri October 23" },
		{ name: "Cheekface", date: "Sat October 24" },
	]);
});

test("picks tonight's shows, including two on one night", () => {
	const shows = parseVenueShows(
		page(event("Early Show", "Fri, October 23"), event("Late Show", "Fri, October 23"), event("Cheekface", "Sat, October 24"))
	);
	assert.deepEqual(showsOn(shows, "Fri October 23"), ["Early Show", "Late Show"]);
});

test("a dark night still finds upcoming shows, so it isn't broken", () => {
	const shows = parseVenueShows(page(event("Cheekface", "Sat, October 24")));
	assert.equal(shows.length, 1);
	assert.deepEqual(showsOn(shows, "Fri October 23"), []);
});

test("a redesigned page finds no shows at all", () => {
	assert.deepEqual(parseVenueShows(`<div class="event-card"><h3>Cheekface</h3><time>Oct 24</time></div>`), []);
	assert.deepEqual(parseVenueShows(page(event("Cheekface", "2026-10-24"))), []);
	assert.deepEqual(parseVenueShows(""), []);
});
