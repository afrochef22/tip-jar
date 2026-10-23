import { sendMail } from "./mailer";
import clientPromise from "./mongodb";

// Logs a server error and emails it to ALERT_EMAIL (set in Vercel), so
// failures during a shift don't go unnoticed in the logs. Each `where` sends
// at most one email per hour, so a bad night doesn't flood the inbox.
// Never throws: reporting an error must not cause a new one.
const QUIET_MINUTES = 60;

// Used when the database itself is what's failing.
const sentInMemory = new Map();

// Returns true if this `where` hasn't been emailed within the quiet period.
async function claimAlert(where) {
	const expiresAt = new Date(Date.now() + QUIET_MINUTES * 60 * 1000);
	try {
		// Give up quickly if the database is down, so the alert doesn't hold up
		// the error page staff are waiting on.
		await Promise.race([
			(async () => {
				const alerts = (await clientPromise).db("TeragramBallroom").collection("alerts");
				await alerts.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
				await alerts.insertOne({ _id: where, expiresAt });
			})(),
			new Promise((_, reject) => setTimeout(() => reject(new Error("timed out")), 3000)),
		]);
		return true;
	} catch (error) {
		if (error?.code === 11000) return false; // already emailed this hour
		const last = sentInMemory.get(where);
		if (last && last > Date.now()) return false;
		sentInMemory.set(where, expiresAt.getTime());
		return true;
	}
}

export async function reportError(where, error, details = "") {
	console.error(`${where}:`, error);
	const to = process.env.ALERT_EMAIL;
	if (!to) return;
	try {
		if (!(await claimAlert(where))) return;
		const time = new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" });
		const stack = String(error?.stack || error).split("\n").slice(0, 8).join("\n");
		await sendMail({
			to,
			subject: `TipJar error: ${where}`,
			text: [
				`Something failed in TipJar at ${time} (Pacific).`,
				``,
				`Where: ${where}`,
				...(details ? [`Details: ${details}`] : []),
				`Error: ${error?.message || error}`,
				``,
				stack,
				``,
				`Full details are in the Vercel logs. You'll get at most one email an hour about this.`,
			].join("\n"),
		});
	} catch (alertError) {
		console.error("Couldn't send error alert email:", alertError);
	}
}
