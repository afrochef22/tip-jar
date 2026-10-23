import nodemailer from "nodemailer";

// Sends email through the app's Gmail account (EMAIL_SERVER_USER /
// EMAIL_SERVER_PASSWORD), from EMAIL_FROM. Timeouts keep a slow mail server
// from holding up the request.
export function sendMail({ to, subject, html, text }) {
	const transporter = nodemailer.createTransport({
		service: "Gmail",
		auth: {
			user: process.env.EMAIL_SERVER_USER,
			pass: process.env.EMAIL_SERVER_PASSWORD,
		},
		connectionTimeout: 5000,
		greetingTimeout: 5000,
		socketTimeout: 10000,
	});
	return transporter.sendMail({ from: process.env.EMAIL_FROM, to, subject, html, text });
}
