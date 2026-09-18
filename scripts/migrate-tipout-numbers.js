// One-off migration: convert tip amounts that were stored as strings into
// numbers, so every reader can rely on a consistent type.
//
//   node scripts/migrate-tipout-numbers.js            # dry run, prints counts
//   node scripts/migrate-tipout-numbers.js --apply    # writes changes
//
// Touches:
//   tipBreakdown.{cookTips,barBackTips,BartenderTips}[].tipOut
//   employees.tipsCollected[].amount
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
const toNumber = (v) => {
	if (typeof v === "number") return v;
	const n = Number(v);
	return Number.isFinite(n) ? n : 0;
};

async function main() {
	const client = new MongoClient(process.env.MONGODB_URI);
	await client.connect();
	const db = client.db("TeragramBallroom");

	let breakdownDocs = 0;
	let breakdownFields = 0;
	for (const doc of await db.collection("tipBreakdown").find({}).toArray()) {
		const $set = {};
		for (const key of ["cookTips", "barBackTips", "BartenderTips"]) {
			const list = doc[key];
			if (!Array.isArray(list)) continue;
			if (list.some((e) => e && typeof e.tipOut !== "number")) {
				$set[key] = list.map((e) =>
					e && e.tipOut !== undefined ? { ...e, tipOut: toNumber(e.tipOut) } : e
				);
				breakdownFields += list.filter((e) => e && typeof e.tipOut !== "number").length;
			}
		}
		if (Object.keys($set).length) {
			breakdownDocs++;
			if (apply) await db.collection("tipBreakdown").updateOne({ _id: doc._id }, { $set });
		}
	}

	let employeeDocs = 0;
	let employeeFields = 0;
	for (const doc of await db.collection("employees").find({}).toArray()) {
		const list = doc.tipsCollected;
		if (!Array.isArray(list)) continue;
		const bad = list.filter((t) => t && t.amount !== undefined && typeof t.amount !== "number");
		if (!bad.length) continue;
		employeeDocs++;
		employeeFields += bad.length;
		if (apply) {
			const fixed = list.map((t) =>
				t && t.amount !== undefined ? { ...t, amount: toNumber(t.amount) } : t
			);
			await db.collection("employees").updateOne({ _id: doc._id }, { $set: { tipsCollected: fixed } });
		}
	}

	console.log(apply ? "APPLIED" : "DRY RUN");
	console.log(`tipBreakdown: ${breakdownDocs} docs, ${breakdownFields} tipOut values`);
	console.log(`employees:    ${employeeDocs} docs, ${employeeFields} amount values`);
	await client.close();
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
