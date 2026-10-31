import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "./mongodb";

// Caps how many times one IP address can do something per hour. Counts live
// in MongoDB (not memory) because each Vercel function instance has its own
// memory. Everyone on the venue's wifi shares one IP, so limits are set well
// above normal use.
const WINDOW_SECONDS = 60 * 60;

type RateLimitCount = { _id: string; count: number; expiresAt: Date };

let indexReady: Promise<string> | undefined;

const clientIp = (req: NextApiRequest) =>
	String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
	req.socket?.remoteAddress ||
	"unknown";

// Logged-out add, edit and delete of shift breakdowns. Managers aren't limited.
export function tooManyShiftWrites(req: NextApiRequest, res: NextApiResponse, errorKey = "error") {
	return tooManyRequests(req, res, { bucket: "shift-writes", limit: 60, errorKey });
}

// Returns true (and sends a 429) when this request is over the limit.
// Fails open: a database hiccup here must not stop staff closing out a shift.
export async function tooManyRequests(
	req: NextApiRequest,
	res: NextApiResponse,
	{ bucket, limit, errorKey = "error" }: { bucket: string; limit: number; errorKey?: string }
) {
	try {
		const db = (await clientPromise).db("TeragramBallroom");
		const counts = db.collection<RateLimitCount>("rateLimits");
		// Old windows delete themselves.
		indexReady ??= counts
			.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
			.catch((error) => {
				indexReady = undefined; // try again next request
				throw error;
			});
		await indexReady;

		const now = Date.now();
		const windowStart = now - (now % (WINDOW_SECONDS * 1000));
		// An upsert that returns the document after the update always finds one.
		const { count } = (await counts.findOneAndUpdate(
			{ _id: `${bucket}:${clientIp(req)}:${windowStart}` },
			{
				$inc: { count: 1 },
				$setOnInsert: { expiresAt: new Date(windowStart + WINDOW_SECONDS * 1000) },
			},
			{ upsert: true, returnDocument: "after" }
		))!;
		if (count <= limit) return false;

		const retryAfter = Math.ceil((windowStart + WINDOW_SECONDS * 1000 - now) / 1000);
		res.setHeader("Retry-After", String(retryAfter));
		const minutes = Math.ceil(retryAfter / 60);
		res.status(429).json({
			[errorKey]: `Too many tries from this network. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}, or sign in.`,
		});
		return true;
	} catch (error) {
		console.error("Rate limit check failed:", error);
		return false;
	}
}
