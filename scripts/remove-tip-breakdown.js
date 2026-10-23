// Removes ONE tip breakdown and the tipsCollected entries it added to
// employees, the same way the app's delete button does. Meant for cleaning up
// duplicates one at a time after a person has looked at each.
//
//   node scripts/remove-tip-breakdown.js <breakdownId>            # dry run: show what would go
//   node scripts/remove-tip-breakdown.js <breakdownId> --apply    # deletes it
const fs = require("fs");
const path = require("path");
const { MongoClient, ObjectId } = require("mongodb");

const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
	for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
		const m = line.match(/^([A-Z_]+)=(.*)$/);
		if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
	}
}

const apply = process.argv.includes("--apply");
const [, , idArg] = process.argv;

function fail(msg) {
	console.error(msg);
	process.exit(1);
}

if (!idArg || !ObjectId.isValid(idArg)) {
	fail("Usage: node scripts/remove-tip-breakdown.js <breakdownId> [--apply]");
}

async function main() {
	const client = new MongoClient(process.env.MONGODB_URI);
	await client.connect();
	const db = client.db("TeragramBallroom");
	const tipBreakdown = db.collection("tipBreakdown");
	const employees = db.collection("employees");

	const breakdown = await tipBreakdown.findOne({ _id: new ObjectId(idArg) });
	if (!breakdown) fail(`No tip breakdown found with id ${idArg}`);

	const affected = await employees
		.find(
			{ "tipsCollected.tipBreakdownId": idArg },
			{ projection: { firstName: 1, lastName: 1, tipsCollected: 1 } }
		)
		.toArray();

	console.log(`Breakdown ${idArg}`);
	console.log(`  Show:    ${JSON.stringify(breakdown.show)}`);
	console.log(`  Date:    ${breakdown.date}`);
	console.log(`  Total:   $${breakdown.totalTips}`);
	console.log(`  Created: ${breakdown.createdat?.toISOString?.() ?? "?"}`);
	console.log(`  Employee tip entries to remove (${affected.length}):`);
	for (const e of affected) {
		for (const t of e.tipsCollected.filter((t) => t.tipBreakdownId === idArg)) {
			console.log(`    ${e.firstName} ${e.lastName}  ${t.workingPosition}  $${t.amount}`);
		}
	}

	if (!apply) {
		console.log("\nDry run. Re-run with --apply to delete.");
	} else {
		await tipBreakdown.deleteOne({ _id: breakdown._id });
		const pulled = await employees.updateMany(
			{ "tipsCollected.tipBreakdownId": idArg },
			{ $pull: { tipsCollected: { tipBreakdownId: idArg } } }
		);
		console.log(`\nDeleted the breakdown and updated ${pulled.modifiedCount} employees.`);
	}

	await client.close();
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
