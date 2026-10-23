import { requireSession } from "../../lib/auth";
import { reportError } from "../../lib/alert";

// Sends a test alert email so a manager can check alerts work on the live site.
// Open /api/testAlert while signed in. Like real alerts, at most one an hour.
export default requireSession(async (req, res) => {
	if (!process.env.ALERT_EMAIL) {
		return res.status(200).json({ sent: false, message: "ALERT_EMAIL isn't set in Vercel yet." });
	}
	const sent = await reportError(
		"Test alert",
		new Error(`Test sent by ${req.session.user?.name || "a manager"}`)
	);
	res.status(200).json({
		sent,
		message: sent
			? `Test alert sent to ${process.env.ALERT_EMAIL}. Check spam if it doesn't arrive.`
			: "Not sent: a test alert already went out in the last hour (or sending failed; see the Vercel logs).",
	});
});
