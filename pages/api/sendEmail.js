import nodemailer from "nodemailer";
import { ObjectId } from "mongodb";
import { randomUUID } from "crypto";
import clientPromise from "../../lib/mongodb";
import { requireSession } from "../../lib/auth";

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

		const baseUrl = (process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
		const registrationLink = `${baseUrl}/RegisterPage/${employee._id}?token=${token}`;

		const transporter = nodemailer.createTransport({
			service: "Gmail",
			auth: {
				user: process.env.EMAIL_SERVER_USER,
				pass: process.env.EMAIL_SERVER_PASSWORD,
			},
		});

		await transporter.sendMail({
			from: process.env.EMAIL_FROM,
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
		console.error("Error sending email:", error);
		res.status(500).json({ success: false, error: "Failed to send email" });
	}
});
