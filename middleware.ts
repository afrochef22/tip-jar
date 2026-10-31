import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
	const token = await getToken({ req: request });

	if (!token) {
		const signInUrl = new URL("/signin", request.url);
		signInUrl.searchParams.set("callbackUrl", request.url);
		return NextResponse.redirect(signInUrl);
	}

	return NextResponse.next();
}

// Manager-only pages. Breakdown and spreadsheet pages stay public for staff.
export const config = {
	matcher: ["/employees", "/Dashboard", "/getEmployee/:path*"],
};
