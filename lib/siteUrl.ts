// The site's address for links in emails, e.g. "https://tip-jar-delta.vercel.app".
// NEXTAUTH_URL when set (local dev sets it), otherwise the production address
// Vercel provides. The request's Host header is only a last resort, since a
// link built from it could point somewhere else.
import type { NextApiRequest } from "next";

export function siteUrl(req: NextApiRequest) {
	if (process.env.NEXTAUTH_URL) return process.env.NEXTAUTH_URL.replace(/\/$/, "");
	if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
		return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
	}
	return `https://${req.headers.host}`;
}
