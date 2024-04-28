import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

export default async (req, res) => {
	const id = req.query.id;
	console.log(req.query);
	const data = req.body; // Assuming data is sent in the request body
	console.log("password", data.password);
	const saltRounds = 10; // Number of salt rounds for hashing

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

			// Hash the password if provided
			if (data.password) {
				const hashedPassword = await bcrypt.hash(data.password, saltRounds);
				updateDocument.$set = { password: hashedPassword };
			}
			console.log("Up date document", updateDocument);
			// Update name, position, and active status
			if (
				data.firstName ||
				data.lastName ||
				Array.isArray(data.position) ||
				data.active !== undefined ||
				data.username ||
				data.email
			) {
				// If updateDocument.$set does not exist, create it
				if (!updateDocument.$set) {
					updateDocument.$set = {};
				}
				// Add properties to updateDocument.$set based on conditions
				if (data.firstName) updateDocument.$set.firstName = data.firstName;
				if (data.lastName) updateDocument.$set.lastName = data.lastName;
				if (Array.isArray(data.position))
					updateDocument.$set.position = data.position;
				if (data.active !== undefined) updateDocument.$set.active = data.active;
				if (data.username) updateDocument.$set.username = data.username;
				if (data.email) updateDocument.$set.email = data.email;
			}
			console.log("Up date document 2", updateDocument);

			const result = await employeeCollection.updateOne(filter, updateDocument);

			console.log(
				`${result.matchedCount} document(s) matched the filter criteria.`
			);
			console.log(`${result.modifiedCount} document(s) were modified.`);
			console.log(result);
			res.status(200).json({ message: "Employee updated successfully" });
		} catch (error) {
			console.error("Error updating data:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	} else {
		res.status(405).json({ message: "Method Not Allowed" });
	}
};
