import clientPromise from "../../lib/mongodb";
import { reportError } from "../../lib/alert";
import { sendMail } from "../../lib/mailer";
import { tooManyRequests } from "../../lib/rateLimit";
import { RESET_TTL_MINUTES, hashResetToken, newResetToken } from "../../lib/passwordReset";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const escapeHtml = (s) =>
	String(s ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

// Emails a password reset link to a registered employee, found by username or
// email. Always answers the same way so it can't be used to find out who has
// an account.
export default async (req, res) => {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}
	const login = typeof req.body?.login === "string" ? req.body.login.trim() : "";
	if (!login) {
		return res.status(400).json({ error: "Enter your username or email." });
	}
	if (await tooManyRequests(req, res, { bucket: "password-reset", limit: 5 })) return;

	try {
		const employees = (await clientPromise).db("TeragramBallroom").collection("employees");
		const employee = await employees.findOne(
			login.includes("@")
				? { email: { $regex: `^${escapeRegex(login)}$`, $options: "i" } }
				: { username: login }
		);

		// Only people who finished registering, are active and have an email.
		if (employee?.username && employee.email && employee.active !== false) {
			const token = newResetToken();
			await employees.updateOne(
				{ _id: employee._id },
				{
					$set: {
						resetTokenHash: hashResetToken(token),
						resetTokenExpiration: new Date(Date.now() + RESET_TTL_MINUTES * 60 * 1000),
					},
				}
			);
			const baseUrl = (process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
			const link = `${baseUrl}/reset-password/${employee._id}?token=${token}`;
			await sendMail({
				to: employee.email,
				subject: "Reset your TipJar password",
				html: `
    <h1>Reset your TipJar password</h1>
    <p>Hi ${escapeHtml(employee.firstName)}, someone asked to reset the password for TipJar username <b>${escapeHtml(employee.username)}</b>.</p>
    <p><a href="${link}">Choose a new password</a></p>
    <p>This link works once and expires in ${RESET_TTL_MINUTES} minutes. If you didn't ask for this, you can ignore this email; your password hasn't changed.</p>
`,
			});
		}
		res.status(200).json({ ok: true });
	} catch (error) {
		await reportError("Forgot password", error);
		res.status(500).json({ error: "Couldn't send the email. Please try again." });
	}
};
