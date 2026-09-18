// Merges two employee records that turned out to be the same person into
// one, combining positions and tip history, and repoints every tip
// breakdown that referenced the retired record's id at the surviving one.
//
//   node scripts/merge-duplicate-employee.js <keepId> <retireId>            # dry run
//   node scripts/merge-duplicate-employee.js <keepId> <retireId> --apply    # writes changes
//
// Refuses to run if both records have conflicting login info (username,
// password, email, googleId) — that needs a human decision, not a script.
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
const [, , keepIdArg, retireIdArg] = process.argv;

function fail(msg) {
	console.error(msg);
	process.exit(1);
}

if (!keepIdArg || !retireIdArg) {
	fail("Usage: node scripts/merge-duplicate-employee.js <keepId> <retireId> [--apply]");
}
if (!ObjectId.isValid(keepIdArg) || !ObjectId.isValid(retireIdArg)) {
	fail("Both ids must be valid Mongo ObjectIds.");
}
if (keepIdArg === retireIdArg) {
	fail("keepId and retireId must be different.");
}

// Rough M/d/yyyy sort, matching the format the app stores dates in.
function parseAppDate(s) {
	const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s || "");
	if (!m) return null;
	return new Date(Number(m[3]), Number(m[1]) - 1, Number(m[2]));
}

async function main() {
	const client = new MongoClient(process.env.MONGODB_URI);
	await client.connect();
	const db = client.db("TeragramBallroom");
	const employees = db.collection("employees");
	const tipBreakdown = db.collection("tipBreakdown");

	const keepId = new ObjectId(keepIdArg);
	const retireId = new ObjectId(retireIdArg);

	const keep = await employees.findOne({ _id: keepId });
	const retire = await employees.findOne({ _id: retireId });
	if (!keep) fail(`No employee found with id ${keepIdArg}`);
	if (!retire) fail(`No employee found with id ${retireIdArg}`);

	console.log(
		`Keep:   ${keep.firstName} ${keep.lastName} (${keepIdArg}) — ${(keep.position || []).join(", ")}${keep.active ? "" : " [inactive]"}`
	);
	console.log(
		`Retire: ${retire.firstName} ${retire.lastName} (${retireIdArg}) — ${(retire.position || []).join(", ")}${retire.active ? "" : " [inactive]"}`
	);

	// Refuse to guess if both sides have login info that disagrees.
	const loginFields = ["username", "email", "googleId"];
	for (const field of loginFields) {
		if (keep[field] && retire[field] && keep[field] !== retire[field]) {
			fail(
				`Both records have a different ${field} set (keep: ${keep[field]}, retire: ${retire[field]}). Resolve which one is correct by hand before merging.`
			);
		}
	}
	if (keep.password && retire.password && keep.password !== retire.password) {
		fail("Both records have a password set. Resolve which login should survive by hand before merging.");
	}

	const mergedPosition = [
		...new Set([...(keep.position || []), ...(retire.position || [])]),
	];
	const mergedTips = [...(keep.tipsCollected || []), ...(retire.tipsCollected || [])]
		.sort((a, b) => (parseAppDate(a.date) || 0) - (parseAppDate(b.date) || 0));

	const $set = {
		position: mergedPosition,
		tipsCollected: mergedTips,
		active: keep.active || retire.active,
	};
	for (const field of [...loginFields, "password", "token", "tokenExpiration", "firstSignInDate"]) {
		if (!keep[field] && retire[field]) $set[field] = retire[field];
	}

	const affectedBreakdowns = await tipBreakdown
		.find({
			$or: [
				{ "cookTips.id": retireIdArg },
				{ "barBackTips.id": retireIdArg },
				{ "BartenderTips.id": retireIdArg },
			],
		})
		.project({ _id: 1, date: 1, show: 1 })
		.toArray();

	console.log(`\nMerged position:      ${mergedPosition.join(", ")}`);
	console.log(`Merged active:        ${$set.active}`);
	console.log(`Merged tipsCollected: ${mergedTips.length} entries (was ${(keep.tipsCollected || []).length} + ${(retire.tipsCollected || []).length})`);
	console.log(`\nTip breakdowns to repoint from retired id to kept id (${affectedBreakdowns.length}):`);
	for (const b of affectedBreakdowns) console.log(`  ${b.date}  ${b.show}  (${b._id})`);

	if (!apply) {
		console.log("\nDRY RUN — nothing written. Re-run with --apply to commit.");
		await client.close();
		return;
	}

	for (const arrayField of ["cookTips", "barBackTips", "BartenderTips"]) {
		await tipBreakdown.updateMany(
			{ [`${arrayField}.id`]: retireIdArg },
			{
				$set: {
					[`${arrayField}.$[entry].id`]: keepIdArg,
					[`${arrayField}.$[entry].active`]: $set.active,
				},
			},
			{ arrayFilters: [{ "entry.id": retireIdArg }] }
		);
	}

	await employees.updateOne({ _id: keepId }, { $set });
	await employees.deleteOne({ _id: retireId });

	console.log(`\nAPPLIED. Repointed ${affectedBreakdowns.length} tip breakdown(s) and deleted the retired employee record.`);
	await client.close();
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
