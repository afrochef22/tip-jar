import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { requireSession } from "../../../lib/auth";

export default requireSession(async (req, res) => {
	const { id } = req.query;

	if (!ObjectId.isValid(id)) {
		return res.status(400).json({ error: "Invalid employee ID", id });
	}

	if (req.method !== "DELETE") {
		return res.status(405).json({ message: "Method Not Allowed" });
	}

	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");
		const result = await db
			.collection("employees")
			.deleteOne({ _id: new ObjectId(id) });

		if (result.deletedCount === 0) {
			return res.status(404).json({ error: "Employee not found" });
		}

		res.status(200).json({ message: "Employee deleted successfully" });
	} catch (error) {
		console.error("Error deleting employee:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});
