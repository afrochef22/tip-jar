import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async (req, res) => {
	const { id } = req.query;
	console.log(req.method);

	if (!ObjectId.isValid(id)) {
		return res.status(400).json({ error: "Invalid bartender ID: ", id });
	}

	if (req.method === "DELETE") {
		try {
			const client = await clientPromise;
			const db = client.db("test");
			const bartenderCollection = db.collection("bartenders");
			const bartender = await bartenderCollection.findOneAndDelete({
				_id: new ObjectId(id),
			});

			if (!bartender.value) {
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
