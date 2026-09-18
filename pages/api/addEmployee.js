import clientPromise from "../../lib/mongodb";
import { getApiSession } from "../../lib/auth";

const POSITIONS = ["Bartender", "Bar Back", "Cook", "No Position"];

export default async (req, res) => {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const { firstName, lastName, position, active } = req.body ?? {};

	if (
		typeof firstName !== "string" ||
		typeof lastName !== "string" ||
		!firstName.trim() ||
		!lastName.trim()
	) {
		return res.status(400).json({ message: "First and last name are required" });
	}
	if (
		!Array.isArray(position) ||
		!position.every((p) => POSITIONS.includes(p))
	) {
		return res.status(400).json({ message: "Invalid position" });
	}

	// Managers can create any employee. Logged-out staff may only register a
	// fill-in for the current shift, which is always inactive.
	const session = await getApiSession(req, res);
	if (!session && active !== false) {
		return res.status(401).json({ message: "Sign in required" });
	}

	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		const result = await db.collection("employees").insertOne({
			firstName: firstName.trim(),
			lastName: lastName.trim(),
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
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};
