import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { getApiSession } from "../../../lib/auth";
import { tooManyShiftWrites } from "../../../lib/rateLimit";
import { ShiftDate } from "../../../lib/shiftDate";
import { reportError } from "../../../lib/alert";
import { isObjectId } from "../../../lib/objectId";
import type { EmployeeDoc, ShiftWorker, TipBreakdownDoc } from "../../../types/models";

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const { id } = req.query;

	if (!isObjectId(id)) {
		return res.status(400).json({ error: "Invalid Breakdown ID", id });
	}
	if (req.method !== "DELETE") {
		return res.status(405).json({ message: "Method Not Allowed" });
	}

	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");
		const tipBreakdownCollection = db.collection<TipBreakdownDoc>("tipBreakdown");
		const employeeCollection = db.collection<EmployeeDoc>("employees");

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

		const noWorkers: ShiftWorker[] = [];
		const employeeIds = noWorkers
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
