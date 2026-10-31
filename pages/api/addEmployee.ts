import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";
import { getApiSession } from "../../lib/auth";
import { reportError } from "../../lib/alert";
import { isList } from "../../lib/field";
import { isPosition } from "../../lib/positions";
import type { EmployeeDoc } from "../../types/models";

// Escapes a string for safe use inside a RegExp, so a name containing
// characters like "." or "+" is matched literally.
const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const body: Record<string, unknown> = { ...req.body };
	const { firstName, lastName, position, active } = body;

	if (
		typeof firstName !== "string" ||
		typeof lastName !== "string" ||
		!firstName.trim() ||
		!lastName.trim()
	) {
		return res.status(400).json({ message: "First and last name are required" });
	}
	if (
		!isList(position) ||
		!position.every(isPosition)
	) {
		return res.status(400).json({ message: "Invalid position" });
	}

	// Managers can create any employee. Logged-out staff may only register a
	// fill-in for the current shift, which is always inactive.
	const session = await getApiSession(req, res);
	if (!session && active !== false) {
		return res.status(401).json({ message: "Sign in required" });
	}

	const trimmedFirstName = firstName.trim();
	const trimmedLastName = lastName.trim();

	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");
		const employees = db.collection<EmployeeDoc>("employees");

		// Same person, different capitalization/spacing should still count
		// as a duplicate (this is how "Adrian Sandoval" ended up as two
		// separate records for the same real employee).
		const existing = await employees.findOne({
			firstName: { $regex: `^${escapeRegExp(trimmedFirstName)}$`, $options: "i" },
			lastName: { $regex: `^${escapeRegExp(trimmedLastName)}$`, $options: "i" },
		});
		if (existing) {
			return res.status(409).json({
				message: `${trimmedFirstName} ${trimmedLastName} is already in the system.`,
				existingEmployeeId: existing._id,
			});
		}

		const result = await employees.insertOne({
			firstName: trimmedFirstName,
			lastName: trimmedLastName,
			position,
			active: Boolean(active),
			tipsCollected: [],
			createdat: new Date(),
		});

		res.status(201).json({
			message: "Employee added successfully",
			insertedEmployeeId: result.insertedId,
		});
	} catch (error) {
		await reportError("addEmployee", error);
		res.status(500).json({ message: "Internal server error" });
	}
};
