import { timingSafeEqual } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";
import { reportError } from "../../../lib/alert";
import { claimNextJob, finishJob, findJob, touchPrinter } from "../../../lib/printQueue";
import { PLAIN_TEXT, STARPRNT, toPlain, toStarPrnt } from "../../../lib/starPrnt";

// Star CloudPRNT endpoint. In the printer's web settings the CloudPRNT server
// URL is https://<site>/api/cloudprnt/<CLOUDPRNT_KEY>. The printer then:
//   POST    asks "any job?" every few seconds; we answer jobReady and a jobToken
//   GET     fetches the job (?token=...&type=...)
//   DELETE  confirms the result (?token=...&code=...)
// The key in the path is the only secret.
const sameKey = (given: string, wanted: string) => {
	const a = Buffer.from(given);
	const b = Buffer.from(wanted);
	return a.length === b.length && timingSafeEqual(a, b);
};

const one = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
	const wanted = process.env.CLOUDPRNT_KEY || "";
	// Same answer for "not set up" and "wrong key".
	if (!wanted || !sameKey(one(req.query.key), wanted)) return res.status(404).json({ error: "Not found" });
	try {
		if (req.method === "POST") {
			const body = typeof req.body === "object" && req.body ? req.body : {};
			await touchPrinter(String(body.printerMAC ?? "").slice(0, 40), String(body.status ?? "").slice(0, 100));
			const job = await claimNextJob();
			return res.status(200).json(job ? { jobReady: true, mediaTypes: [STARPRNT, PLAIN_TEXT], jobToken: job._id } : { jobReady: false });
		}
		if (req.method === "GET") {
			const job = await findJob(one(req.query.token));
			if (!job) return res.status(404).json({ error: "No such job" });
			if (one(req.query.type) === PLAIN_TEXT) {
				res.setHeader("Content-Type", PLAIN_TEXT);
				return res.status(200).send(toPlain(job.lines));
			}
			res.setHeader("Content-Type", STARPRNT);
			return res.status(200).send(toStarPrnt(job.lines));
		}
		if (req.method === "DELETE") {
			const token = one(req.query.token);
			if (await findJob(token)) await finishJob(token, one(req.query.code).startsWith("2"));
			return res.status(200).json({ ok: true });
		}
		return res.status(405).json({ error: "Method not allowed" });
	} catch (error) {
		await reportError("Star printer check-in", error);
		return res.status(500).json({ error: "Database error" });
	}
}
