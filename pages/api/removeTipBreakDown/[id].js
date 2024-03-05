import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async (req, res) => {
	let { id } = req.query; // Change const to let

	// If id is not present in the query string, try accessing it from the request body
	if (!id && req.method === "DELETE") {
		const { id: bodyId } = req.body;
		if (!ObjectId.isValid(bodyId)) {
			return res
				.status(400)
				.json({ error: "Invalid Breakdown ID: ", id: bodyId });
		}
		id = bodyId;
	}

	if (!ObjectId.isValid(id)) {
		return res.status(400).json({ error: "Invalid Breakdown ID: ", id });
	}

	if (req.method === "DELETE") {
		try {
			const client = await clientPromise;
			const db = client.db("TeragramBallroom");
			const tipBreakdownCollection = db.collection("tipBreakdown");
			const employeeCollection = db.collection("employees");

			// Find the tip breakdown document and extract associated employee IDs
			const tipBreakdown = await tipBreakdownCollection.findOne({
				_id: new ObjectId(id),
			});
			if (!tipBreakdown) {
				return res.status(404).json({ error: "Breakdown not found" });
			}

			const employeeIds = tipBreakdown.cookTips
				.concat(tipBreakdown.barBackTips, tipBreakdown.BartenderTips)
				.map((employee) => new ObjectId(employee.id));

			// Delete the tip breakdown
			await tipBreakdownCollection.deleteOne({ _id: new ObjectId(id) });

			// Remove tip collected data from each associated employee
			await employeeCollection.updateMany(
				{ _id: { $in: employeeIds } },
				{ $pull: { tipsCollected: { tipBreakdownId: id } } }
			);

			res.status(200).json({ message: "Tip Breakdown deleted successfully" });
		} catch (error) {
			console.error("Error deleting tip breakdown:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	} else {
		// Return a 405 Method Not Allowed status for non-DELETE requests
		res.status(405).json({ message: "Method Not Allowed" });
	}
};
