import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { reportError } from "./alert";

// Returns the NextAuth session for an API request, or null.
export async function getApiSession(req, res) {
	try {
		return await getServerSession(req, res, authOptions);
	} catch (error) {
		await reportError("Reading sign-in session", error);
		return null;
	}
}

// Wraps an API handler so it only runs for signed-in managers.
export function requireSession(handler) {
	return async (req, res) => {
		const session = await getApiSession(req, res);
		if (!session) {
			return res.status(401).json({ error: "Sign in required" });
		}
		req.session = session;
		return handler(req, res);
	};
}
