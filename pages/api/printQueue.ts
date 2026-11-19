import { randomBytes } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { reportError } from "../../lib/alert";
import { enqueueJob, printerState } from "../../lib/printQueue";
import { tooManyRequests } from "../../lib/rateLimit";
import { cleanSlipLines } from "../../lib/starPrnt";

// Queues a slip for the Star printer (it prints within a few seconds), and says
// whether the printer has been checking in. Staff pages are public, so this is
// too; it only accepts well-formed slips and is limited per network.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	try {
		if (req.method === "GET") return res.status(200).json(await printerState());
		if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
		if (await tooManyRequests(req, res, { bucket: "print", limit: 120 })) return;
		const lines = cleanSlipLines(req.body?.lines);
		if (!lines) return res.status(400).json({ error: "That slip isn't valid." });
		await enqueueJob(randomBytes(12).toString("hex"), lines);
		return res.status(200).json({ ok: true });
	} catch (error) {
		await reportError("Queueing a slip for the printer", error);
		return res.status(500).json({ error: "Couldn't reach the database." });
	}
}
