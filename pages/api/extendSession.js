// api/extend-session.js
import { getSession } from "next-auth/react";

export default async function handler(req, res) {
	const session = await getSession({ req });

	if (session) {
		// Update the session expiration time
		req.session.expires = Date.now() + 30 * 60 * 1000; // Extend session by 30 minutes
		await req.session.save();
		res.status(200).end();
	} else {
		res.status(401).end();
	}
}
