import clientPromise from "../../../lib/mongodb";
import { userRouter } from "next/router";
import { ObjectId } from "mongodb";

export default async (req, res) => {
	const id = req.query.getBartender;

	if (!ObjectId.isValid(id)) {
		return res.status(400).json({ error: "Invalid bartender ID: ", id });
	}

	if (req.method === "GET") {
		try {
			const client = await clientPromise;
			const db = client.db("test");
			const bartenderCollection = db.collection("bartenders");
			const bartender = await bartenderCollection.findOne({
				_id: new ObjectId(id),
			});

			if (!bartender) {
				return res.status(404).json({ error: "Bartender not found" });
			}

			res.status(200).json(bartender);
		} catch (error) {
			console.error("Error fetching data:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	} else {
		// Return a 405 Method Not Allowed status for non-GET requests
		res.status(405).json({ message: "Method Not Allowed" });
	}
};
