import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { getApiSession } from "../../../lib/auth";
import { tooManyShiftWrites } from "../../../lib/rateLimit";
import { ShiftDate } from "../../../lib/shiftDate";
import { reportError } from "../../../lib/alert";

export default async (req, res) => {
	const { id } = req.query;

	if (!ObjectId.isValid(id)) {
		return res.status(400).json({ error: "Invalid Breakdown ID", id });
	}
	if (req.method !== "DELETE") {
		return res.status(405).json({ message: "Method Not Allowed" });
	}

	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");
		const tipBreakdownCollection = db.collection("tipBreakdown");
		const employeeCollection = db.collection("employees");

		const tipBreakdown = await tipBreakdownCollection.findOne({
			_id: new ObjectId(id),
		});
		if (!tipBreakdown) {
			return res.status(404).json({ error: "Breakdown not found" });
		}

		// Managers can delete any breakdown. Logged-out staff may only delete
		// the current shift's.
		const session = await getApiSession(req, res);
		if (!session && tipBreakdown.date !== ShiftDate()) {
			return res
				.status(401)
				.json({ error: "Sign in required to delete a past shift" });
		}
		if (!session && (await tooManyShiftWrites(req, res))) return;

		const employeeIds = []
			.concat(
				tipBreakdown.cookTips ?? [],
				tipBreakdown.barBackTips ?? [],
				tipBreakdown.BartenderTips ?? []
			)
			.map((employee) => employee?.id)
			.filter((eid) => ObjectId.isValid(eid))
			.map((eid) => new ObjectId(eid));

		await tipBreakdownCollection.deleteOne({ _id: tipBreakdown._id });

		await employeeCollection.updateMany(
			{ _id: { $in: employeeIds } },
			{ $pull: { tipsCollected: { tipBreakdownId: id } } }
		);

		res.status(200).json({ message: "Tip Breakdown deleted successfully" });
	} catch (error) {
		await reportError("removeTipBreakDown", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
