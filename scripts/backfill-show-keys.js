// Gives every tip breakdown a normalized `showKey` and adds a unique index on
// { date, showKey }, so the database itself rejects a second breakdown for
// the same show on the same shift (e.g. two phones submitting at once).
//
//   node scripts/backfill-show-keys.js            # dry run: report only
//   node scripts/backfill-show-keys.js --apply    # writes showKey + creates index
//
// Refuses to apply while duplicates exist, because the unique index cannot be
// built over them. Remove those first (scripts/remove-tip-breakdown.js).
const fs = require("fs");
const path = require("path");
const { MongoClient } = require("mongodb");

const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
	for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
		const m = line.match(/^([A-Z_]+)=(.*)$/);
		if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
	}
}

const apply = process.argv.includes("--apply");

// Copy of showKey in lib/showKey.js (that file is an ES module); keep in sync.
function showKey(show) {
	return String(show ?? "")
		.trim()
		.replace(/\s+/g, " ")
		.normalize("NFKC")
		.replace(/[‘’`´]/g, "'")
		.replace(/[“”]/g, '"')
		.replace(/[‐‑‒–—―]/g, "-")
		.toLowerCase();
}

async function main() {
	const client = new MongoClient(process.env.MONGODB_URI);
	await client.connect();
	const tipBreakdown = client.db("TeragramBallroom").collection("tipBreakdown");

	const all = await tipBreakdown
		.find({}, { projection: { show: 1, date: 1, showKey: 1, totalTips: 1, createdat: 1 } })
		.toArray();

	const groups = new Map();
	for (const b of all) {
		const key = `${b.date}|${showKey(b.show)}`;
		if (!groups.has(key)) groups.set(key, []);
		groups.get(key).push(b);
	}
	const duplicates = [...groups.values()].filter((g) => g.length > 1);
	const needsKey = all.filter((b) => b.showKey !== showKey(b.show));

	console.log(`Breakdowns: ${all.length}`);
	console.log(`Missing or stale showKey: ${needsKey.length}`);
	console.log(`Duplicate groups: ${duplicates.length}`);
	for (const group of duplicates) {
		console.log("");
		for (const b of group) {
			console.log(
				`  ${b._id}  ${b.date}  ${JSON.stringify(b.show)}  $${b.totalTips}  created ${b.createdat?.toISOString?.() ?? "?"}`
			);
		}
	}

	if (!apply) {
		console.log("\nDry run. Re-run with --apply to write.");
	} else if (duplicates.length) {
		console.error("\nRefusing to apply: remove the duplicates above first.");
		process.exitCode = 1;
	} else {
		if (needsKey.length) {
			await tipBreakdown.bulkWrite(
				needsKey.map((b) => ({
					updateOne: { filter: { _id: b._id }, update: { $set: { showKey: showKey(b.show) } } },
				}))
			);
		}
		// Partial so breakdowns saved without a showKey (by code that predates
		// it) are not all treated as the same show.
		await tipBreakdown.createIndex(
			{ date: 1, showKey: 1 },
			{
				unique: true,
				name: "unique_show_per_date",
				partialFilterExpression: { showKey: { $type: "string" } },
			}
		);
		console.log(`\nSet showKey on ${needsKey.length} breakdowns and created index unique_show_per_date.`);
	}

	await client.close();
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
