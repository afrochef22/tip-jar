import type { NextApiRequest, NextApiResponse } from "next";
import type { Session } from "next-auth";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../pages/api/auth/[...nextauth]";
import { reportError } from "./alert";

export type SessionRequest = NextApiRequest & { session: Session };

// Returns the NextAuth session for an API request, or null.
export async function getApiSession(req: NextApiRequest, res: NextApiResponse): Promise<Session | null> {
	try {
		return await getServerSession(req, res, authOptions);
	} catch (error) {
		await reportError("Reading sign-in session", error);
		return null;
	}
}

// Wraps an API handler so it only runs for signed-in managers.
export function requireSession(handler: (req: SessionRequest, res: NextApiResponse) => unknown) {
	return async (req: NextApiRequest, res: NextApiResponse) => {
		const session = await getApiSession(req, res);
		if (!session) {
			return res.status(401).json({ error: "Sign in required" });
		}
		return handler(Object.assign(req, { session }), res);
	};
}
