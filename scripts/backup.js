// Saves every collection in the TeragramBallroom database to
// backups/<date>/<collection>.json. The free MongoDB tier has no backups, so
// run this regularly and before any script that changes live data.
//
//   npm run backup
//
// Files are Extended JSON, so ObjectIds and dates come back exactly as they
// were. backups/ is gitignored: it holds password hashes and must never be
// committed.
const fs = require("fs");
const path = require("path");
const { MongoClient, BSON } = require("mongodb");

const envPath = path.join(__dirname, "..", ".env.local");
if (fs.existsSync(envPath)) {
	for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
		const m = line.match(/^([A-Z_]+)=(.*)$/);
		if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
	}
}

// Saves every collection in `db` to backups/<timestamp>/ and returns that
// folder. Also used by restore.js to save the current data before a restore.
async function backupDatabase(db) {
	const stamp = new Date().toISOString().slice(0, 19).replace(/:/g, "-");
	const dir = path.join(__dirname, "..", "backups", stamp);
	fs.mkdirSync(dir, { recursive: true, mode: 0o700 });

	const collections = await db.listCollections({}, { nameOnly: true }).toArray();
	for (const { name } of collections) {
		const docs = await db.collection(name).find({}).toArray();
		const indexes = await db.collection(name).indexes();
		fs.writeFileSync(
			path.join(dir, `${name}.json`),
			BSON.EJSON.stringify({ indexes, docs }, null, 1, { relaxed: false }),
			{ mode: 0o600 }
		);
		console.log(`${name}: ${docs.length} documents`);
	}
	return dir;
}

async function main() {
	const client = new MongoClient(process.env.MONGODB_URI);
	await client.connect();
	const dir = await backupDatabase(client.db("TeragramBallroom"));
	await client.close();
	console.log(`\nSaved to ${dir}`);
}

module.exports = { backupDatabase };

if (require.main === module) {
	main().catch((err) => {
		console.error(err);
		process.exit(1);
	});
}
