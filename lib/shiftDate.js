// Pure date helpers for the venue's shift calendar. A shift that runs past
// midnight still belongs to the previous calendar day until 6 AM Pacific.
// This module has no React or CSS imports so it is safe to use in API routes.
import { DateTime } from "luxon";

export const VENUE_TIME_ZONE = "America/Los_Angeles";
const SHIFT_ROLLOVER_HOUR = 6;

const DAY_ABBREVIATIONS = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
	"",
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

// The calendar day the current shift belongs to, in venue time.
export function shiftDateTime() {
	const now = DateTime.now().setZone(VENUE_TIME_ZONE);
	return now.hour < SHIFT_ROLLOVER_HOUR ? now.minus({ days: 1 }) : now;
}

// "MM/d/yyyy" with a zero-padded month and unpadded day. This exact shape is
// stored on every breakdown and tipsCollected entry, so keep it stable.
export function ShiftDate() {
	const d = shiftDateTime();
	return `${d.toFormat("MM")}/${d.day}/${d.year}`;
}

// The shape the venue website prints event dates in, e.g. "Wed September 17".
export function ShowDateComparer() {
	const d = shiftDateTime();
	return `${DAY_ABBREVIATIONS[d.weekday]} ${MONTH_NAMES[d.month]} ${d.day}`;
}
