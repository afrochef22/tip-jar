import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";
import { reportError } from "../../lib/alert";
import { tooManyRequests } from "../../lib/rateLimit";
import { MIN_PASSWORD_LENGTH, hashResetToken } from "../../lib/passwordReset";
import { isObjectId } from "../../lib/objectId";
import type { EmployeeDoc } from "../../types/models";

// Sets a new password from an emailed reset link. The link works once.
export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== "POST") {
		return res.status(405).json({ error: "Method not allowed" });
	}
	const body: Record<string, unknown> = { ...req.body };
	const { id, token, password } = body;
	if (!isObjectId(id) || typeof token !== "string") {
		return res.status(400).json({ error: "This reset link isn't valid." });
	}
	if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
		return res
			.status(400)
			.json({ error: `Use at least ${MIN_PASSWORD_LENGTH} characters.` });
	}
	if (await tooManyRequests(req, res, { bucket: "password-reset-submit", limit: 20 })) return;

	try {
		const employees = (await clientPromise).db("TeragramBallroom").collection<EmployeeDoc>("employees");
		// Checking the link and using it up happen in one step, so the same link
		// can't be used twice even if submitted twice at once.
		const employee = await employees.findOneAndUpdate(
			{
				_id: new ObjectId(id),
				resetTokenHash: hashResetToken(token),
				resetTokenExpiration: { $gt: new Date() },
			},
			{
				$set: { password: await bcrypt.hash(password, 10) },
				$unset: { resetTokenHash: "", resetTokenExpiration: "" },
			}
		);
		if (!employee) {
			return res.status(401).json({
				error: "This reset link has expired or was already used. Request a new one.",
			});
		}
		res.status(200).json({ ok: true, username: employee.username });
	} catch (error) {
		await reportError("Reset password", error);
		res.status(500).json({ error: "Couldn't change the password. Please try again." });
	}
};
