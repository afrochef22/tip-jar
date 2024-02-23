import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async (req, res) => {
	const id = req.query.id;
	console.log(req.query);
	const data = req.body; // Assuming data is sent in the request body

	if (!ObjectId.isValid(id)) {
		return res.status(400).json({ error: "Invalid Employee ID: ", id });
	}

	if (req.method === "PATCH") {
		console.log("Received PATCH request with data:", data);

		try {
			const client = await clientPromise;
			const db = client.db("TeragramBallroom");
			const employeeCollection = db.collection("employees");

			const objectId = new ObjectId(id);
			const filter = { _id: objectId };

			let updateDocument = {};

			// Update name, position, and active status
			if (
				data.firstName ||
				data.lastName ||
				Array.isArray(data.position) ||
				data.active !== undefined
			) {
				updateDocument.$set = {
					...(data.firstName && { firstName: data.firstName }),
					...(data.lastName && { lastName: data.lastName }),
					...(Array.isArray(data.position) && { position: data.position }),
					...(data.active !== undefined && { active: data.active }),
				};
			}

			const result = await employeeCollection.updateOne(filter, updateDocument);

			console.log(
				`${result.matchedCount} document(s) matched the filter criteria.`
			);
			console.log(`${result.modifiedCount} document(s) were modified.`);

			res.status(200).json({ message: "Employee updated successfully" });
		} catch (error) {
			console.error("Error updating data:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	} else {
		res.status(405).json({ message: "Method Not Allowed" });
	}
};
