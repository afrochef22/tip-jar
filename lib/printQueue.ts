import clientPromise from "./mongodb";
import type { SlipLine } from "./receipt.ts";

// Slips waiting for the Star printer. The printer calls /api/cloudprnt/<key>
// every few seconds, takes the oldest queued slip, and confirms when it prints.
//   printJobs      one document per slip (deleted by MongoDB after a day)
//   printerStatus  one document remembering when the printer last checked in
export type PrintJob = { _id: string; lines: SlipLine[]; state: "queued" | "sent" | "done" | "failed"; createdAt: Date };
type PrinterStatus = { _id: "main"; lastSeen: Date; mac: string; status: string };

let indexReady: Promise<string> | undefined;

async function collections() {
	const db = (await clientPromise).db("TeragramBallroom");
	const jobs = db.collection<PrintJob>("printJobs");
	indexReady ??= jobs.createIndex({ createdAt: 1 }, { expireAfterSeconds: 24 * 60 * 60 }).catch((error) => {
		indexReady = undefined;
		throw error;
	});
	await indexReady;
	return { jobs, printer: db.collection<PrinterStatus>("printerStatus") };
}

export async function enqueueJob(id: string, lines: SlipLine[]) {
	await (await collections()).jobs.insertOne({ _id: id, lines, state: "queued", createdAt: new Date() });
}

// The oldest slip nobody has picked up, marked sent so it isn't handed out twice.
export async function claimNextJob(): Promise<PrintJob | null> {
	const { jobs } = await collections();
	const next = await jobs.findOneAndUpdate(
		{ state: "queued" },
		{ $set: { state: "sent" } },
		{ sort: { createdAt: 1 }, returnDocument: "after" }
	);
	return next ?? null;
}

export async function findJob(id: string) {
	return (await collections()).jobs.findOne({ _id: id });
}

export async function finishJob(id: string, ok: boolean) {
	await (await collections()).jobs.updateOne({ _id: id }, { $set: { state: ok ? "done" : "failed" } });
}

export async function touchPrinter(mac: string, status: string) {
	await (await collections()).printer.replaceOne({ _id: "main" }, { lastSeen: new Date(), mac, status }, { upsert: true });
}

export async function printerState() {
	const { jobs, printer } = await collections();
	const [seen, queued] = await Promise.all([printer.findOne({ _id: "main" }), jobs.countDocuments({ state: "queued" })]);
	return { lastSeen: seen?.lastSeen?.toISOString() ?? null, queued };
}
