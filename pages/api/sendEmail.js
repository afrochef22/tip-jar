import nodemailer from "nodemailer";

export default async (req, res) => {
	const { employee, to, registrationToken } = req.body; // Destructure the employee data and recipient email from the request body
	// Create a transporter

	const transporter = nodemailer.createTransport({
		service: "Gmail",
		auth: {
			user: process.env.EMAIL_SERVER_USER,
			pass: process.env.EMAIL_SERVER_PASSWORD,
		},
	});
	const registrationLink = `https://tip-jar-delta.vercel.app/RegisterPage/${employee._id}?token=${registrationToken}`;

	const registrationLink2 = `localhost:3000/RegisterPage/${employee._id}?token=${registrationToken}`;
	// Define email options
	const mailOptions = {
		from: process.env.EMAIL_FROM,
		to: to,
		subject: "Registration Link",
		html: `
    <h1>Welcome to TipJar!</h1>
    <p>Please use the following link to set up your login:</p>
    <a href="${registrationLink2}">TipJar Register link</a>
    <p>We're excited to have you on board!</p>
`,
	};

	// Send email
	try {
		// Send email
		await transporter.sendMail(mailOptions);
		res.status(200).json({ success: true });
	} catch (error) {
		console.error("Error sending email:", error);
		res.status(500).json({ success: false, error: "Failed to send email" });
	}
};
