// Puts the database back the way it was in a backup made by `npm run backup`.
//
//   npm run restore -- 2026-10-23T08-10-13            preview only, changes nothing
//   npm run restore -- 2026-10-23T08-10-13 --yes      restore every collection
//   npm run restore -- 2026-10-23T08-10-13 --only tipBreakdown --yes
//
// The backup can be given as a folder name inside backups/ or as a path.
// With --yes it first saves a fresh backup of the current data, so a restore
// can always be undone by restoring that one. Each collection is loaded into a
// temporary copy and only swapped in once it's complete, so a failure halfway
// never leaves a collection half-restored. Collections not in the backup (or
// not named with --only) are left alone.
//
// --db <name> restores into a different database (for testing the script)
// instead of TeragramBallroom.
const fs = require("fs");
const path = require("path");
const { MongoClient, BSON } = require("mongodb");
const { backupDatabase } = require("./backup");

const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
	for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
		const m = line.match(/^([A-Z_]+)=(.*)$/);
		if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
	}
}

const args = process.argv.slice(2);
const flag = (name) => {
	const i = args.indexOf(name);
	return i === -1 ? undefined : args.splice(i, 2)[1];
};
const yes = args.includes("--yes");
if (yes) args.splice(args.indexOf("--yes"), 1);
const only = flag("--only")?.split(",");
const dbName = flag("--db") || "TeragramBallroom";
const [backupArg] = args;

function loadBackup() {
	if (!backupArg) {
		const root = path.join(__dirname, "..", "backups");
		const found = fs.existsSync(root) ? fs.readdirSync(root).sort().reverse() : [];
		console.log("Which backup? Pass one of these folder names:\n");
		console.log(found.length ? found.map((f) => `  ${f}`).join("\n") : "  (none yet; run npm run backup)");
		process.exit(1);
	}
	const dir = fs.existsSync(backupArg)
		? backupArg
		: path.join(__dirname, "..", "backups", backupArg);
	if (!fs.existsSync(dir)) throw new Error(`No backup folder at ${dir}`);

	const collections = fs
		.readdirSync(dir)
		.filter((f) => f.endsWith(".json"))
		.map((f) => {
			const { indexes, docs } = BSON.EJSON.parse(fs.readFileSync(path.join(dir, f), "utf8"), {
				relaxed: false,
			});
			if (!Array.isArray(docs)) throw new Error(`${f} doesn't look like a backup file`);
			return { name: f.slice(0, -".json".length), indexes: indexes || [], docs };
		})
		.filter((c) => !only || only.includes(c.name));
	if (only) {
		const missing = only.filter((n) => !collections.some((c) => c.name === n));
		if (missing.length) throw new Error(`Not in this backup: ${missing.join(", ")}`);
	}
	if (!collections.length) throw new Error(`No collections found in ${dir}`);
	return { dir, collections };
}

async function restoreCollection(db, { name, indexes, docs }) {
	const tmpName = `${name}__restoring`;
	await db.collection(tmpName).drop().catch(() => {}); // left over from a failed run
	const tmp = db.collection(tmpName);
	for (let i = 0; i < docs.length; i += 500) {
		await tmp.insertMany(docs.slice(i, i + 500), { ordered: true });
	}
	if (docs.length === 0) await db.createCollection(tmpName);
	for (const { key, name: indexName, v, ns, ...options } of indexes) {
		if (indexName === "_id_") continue;
		await tmp.createIndex(key, { name: indexName, ...options });
	}
	const count = await tmp.countDocuments();
	if (count !== docs.length) {
		throw new Error(`${name}: loaded ${count} of ${docs.length} documents, stopped before swapping in`);
	}
	await tmp.rename(name, { dropTarget: true });
}

async function main() {
	const { dir, collections } = loadBackup();
	const client = new MongoClient(process.env.MONGODB_URI);
	await client.connect();
	try {
		const db = client.db(dbName);
		console.log(`Backup:   ${dir}\nDatabase: ${dbName}\n`);
		console.log("collection".padEnd(20), "in backup".padStart(10), "in database now".padStart(16));
		for (const c of collections) {
			const now = await db.collection(c.name).countDocuments();
			console.log(c.name.padEnd(20), String(c.docs.length).padStart(10), String(now).padStart(16));
		}

		if (!yes) {
			console.log(
				"\nNothing changed. Each collection above will be replaced with the backup's copy." +
					"\nRun again with --yes to restore."
			);
			return;
		}

		console.log("\nSaving the current data first...");
		const safety = await backupDatabase(db);
		console.log(`Saved to ${safety}\n`);

		for (const c of collections) {
			await restoreCollection(db, c);
			console.log(`${c.name}: restored ${c.docs.length} documents`);
		}
		console.log(
			`\nDone. To undo, restore the copy saved just now:\n  npm run restore -- ${path.basename(safety)}` +
				(dbName === "TeragramBallroom" ? "" : ` --db ${dbName}`) +
				" --yes"
		);
	} finally {
		await client.close();
	}
}

main().catch((err) => {
	console.error(`\nRestore stopped: ${err.message}`);
	process.exit(1);
});
