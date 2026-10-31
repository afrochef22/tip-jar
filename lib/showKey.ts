// Show names are typed by hand as often as they are picked, so the same show
// can arrive as " Deer Tick", "deer tick" or "Trump's" vs "Trump’s". These
// helpers make those compare equal for duplicate detection.
// scripts/backfill-show-keys.js keeps a copy of showKey; keep the two in sync.

// The name as stored and displayed: trimmed, single-spaced.
export function cleanShowName(show: unknown) {
	return String(show ?? "").trim().replace(/\s+/g, " ");
}

// The comparison key: cleaned, lowercased, with look-alike punctuation unified.
export function showKey(show: unknown) {
	return cleanShowName(show)
		.normalize("NFKC")
		.replace(/[‘’`´]/g, "'")
		.replace(/[“”]/g, '"')
		.replace(/[‐‑‒–—―]/g, "-")
		.toLowerCase();
}

export function isSameShow(a: unknown, b: unknown) {
	return showKey(a) === showKey(b);
}
