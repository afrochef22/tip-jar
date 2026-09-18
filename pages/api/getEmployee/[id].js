import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { requireSession } from "../../../lib/auth";

export default requireSession(async (req, res) => {
	const id = req.query.id;

	if (!ObjectId.isValid(id)) {
		return res.status(400).json({ error: "Invalid Employee ID", id });
	}

	if (req.method !== "GET") {
		return res.status(405).json({ message: "Method Not Allowed" });
	}

	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");
		const employee = await db
			.collection("employees")
			.findOne(
				{ _id: new ObjectId(id) },
				{ projection: { password: 0, token: 0 } }
			);

		if (!employee) {
			return res.status(404).json({ error: "Employee not found" });
		}

		res.status(200).json(employee);
	} catch (error) {
		console.error("Error fetching data:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});
