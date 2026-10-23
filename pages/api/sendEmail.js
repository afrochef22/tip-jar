import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";
import clientPromise from "../../lib/mongodb";
import { requireSession } from "../../lib/auth";
import { reportError } from "../../lib/alert";
import { sendMail } from "../../lib/mailer";
import { siteUrl } from "../../lib/siteUrl";

const LINK_TTL_DAYS = 7;

// Generates a fresh single-use registration token for an employee, stores it,
// and emails them the registration link. Managers only.
export default requireSession(async (req, res) => {
	if (req.method !== "POST") {
		return res.status(405).json({ success: false, error: "Method not allowed" });
	}

	const { employeeId } = req.body ?? {};
	if (!ObjectId.isValid(employeeId)) {
		return res.status(400).json({ success: false, error: "Invalid employee id" });
	}

	try {
		const client = await clientPromise;
		const employees = client.db("TeragramBallroom").collection("employees");
		const employee = await employees.findOne({ _id: new ObjectId(employeeId) });

		if (!employee) {
			return res.status(404).json({ success: false, error: "Employee not found" });
		}
		if (!employee.email) {
			return res
				.status(400)
				.json({ success: false, error: "Employee has no email address" });
		}

		const token = randomUUID();
		const tokenExpiration = new Date();
		tokenExpiration.setDate(tokenExpiration.getDate() + LINK_TTL_DAYS);
		await employees.updateOne(
			{ _id: employee._id },
			{ $set: { token, tokenExpiration } }
		);

		const baseUrl = siteUrl(req);
		const registrationLink = `${baseUrl}/RegisterPage/${employee._id}?token=${token}`;

		await sendMail({
			to: employee.email,
			subject: "Registration Link",
			html: `
    <h1>Welcome to TipJar!</h1>
    <p>Please use the following link to set up your login:</p>
    <a href="${registrationLink}">TipJar Register link</a>
    <p>This link expires in ${LINK_TTL_DAYS} days.</p>
`,
		});

		res.status(200).json({ success: true, tokenExpiration });
	} catch (error) {
		await reportError("sendEmail (registration link)", error);
		res.status(500).json({ success: false, error: "Failed to send email" });
	}
});
