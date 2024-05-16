import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async (req, res) => {
	const { id } = req.query;
	console.log("removeEmployee: ", req.method);

	if (!ObjectId.isValid(id)) {
		return res.status(400).json({ error: "Invalid employee ID: ", id });
	}

	if (req.method === "DELETE") {
		try {
			const client = await clientPromise;
			const db = client.db("TeragramBallroom");
			const result = await db
				.collection("employees")
				.deleteOne({ _id: new ObjectId(id) });

			if (result.deletedCount === 0) {
				return res.status(404).json({ error: "Employee not found" });
			}

			res
				.status(200)
				.json({ message: "Employee deleted successfully" }, result);
		} catch (error) {
			console.error("Error fetching data:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	} else {
		// Return a 405 Method Not Allowed status for non-GET requests
		res.status(405).json({ message: "Method Not Allowed" });
	}
};
