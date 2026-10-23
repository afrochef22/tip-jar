import clientPromise from "./mongodb";

// Caps how many times one IP address can change shift data without signing
// in. Managers are never limited. Counts live in MongoDB (not memory) because
// each Vercel function instance has its own memory. Everyone on the venue's
// wifi shares one IP, so the limit is set well above a busy night's use.
const LIMIT = 60;
const WINDOW_SECONDS = 60 * 60;

let indexReady;

const clientIp = (req) =>
	String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() ||
	req.socket?.remoteAddress ||
	"unknown";

// Returns true (and sends a 429) when this request is over the limit.
// Fails open: a database hiccup here must not stop staff closing out a shift.
export async function tooManyShiftWrites(req, res, errorKey = "error") {
	try {
		const db = (await clientPromise).db("TeragramBallroom");
		const counts = db.collection("rateLimits");
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
		const { count } = await counts.findOneAndUpdate(
			{ _id: `shift-writes:${clientIp(req)}:${windowStart}` },
			{
				$inc: { count: 1 },
				$setOnInsert: { expiresAt: new Date(windowStart + WINDOW_SECONDS * 1000) },
			},
			{ upsert: true, returnDocument: "after" }
		);
		if (count <= LIMIT) return false;

		const retryAfter = Math.ceil((windowStart + WINDOW_SECONDS * 1000 - now) / 1000);
		res.setHeader("Retry-After", String(retryAfter));
		const minutes = Math.ceil(retryAfter / 60);
		res.status(429).json({
			[errorKey]: `Too many changes from this network. Try again in ${minutes} minute${minutes === 1 ? "" : "s"}, or sign in.`,
		});
		return true;
	} catch (error) {
		console.error("Rate limit check failed:", error);
		return false;
	}
}
