import clientPromise from "../../../lib/mongodb";
import { userRouter } from "next/router";
import { ObjectId } from "mongodb";

export default async (req, res) => {
	const id = req.query.id;
	console.log(req.query);

	if (!ObjectId.isValid(id)) {
		return res.status(400).json({ error: "Invalid Employee ID: ", id });
	}

	if (req.method === "GET") {
		try {
			const client = await clientPromise;
			const db = client.db("TeragramBallroom");
			const employeeCollection = db.collection("employees");
			const employee = await employeeCollection.findOne({
				_id: new ObjectId(id),
			});

			if (!employee) {
				return res.status(404).json({ error: "Employee not found" });
			}

			res.status(200).json(employee);
		} catch (error) {
			console.error("Error fetching data:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	} else {
		// Return a 405 Method Not Allowed status for non-GET requests
		res.status(405).json({ message: "Method Not Allowed" });
	}
};
