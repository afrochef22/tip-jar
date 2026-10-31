import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { requireSession } from "../../../lib/auth";
import { reportError } from "../../../lib/alert";
import { isObjectId } from "../../../lib/objectId";
import type { EmployeeDoc } from "../../../types/models";

export default requireSession(async (req, res) => {
	const { id } = req.query;

	if (!isObjectId(id)) {
		return res.status(400).json({ error: "Invalid employee ID", id });
	}

	if (req.method !== "DELETE") {
		return res.status(405).json({ message: "Method Not Allowed" });
	}

	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");
		const employees = db.collection<EmployeeDoc>("employees");

		// Payroll totals are built from each employee's tipsCollected, so
		// deleting someone who has been paid would erase them from past pay
		// periods. Only allow deleting records with no tip history (mistakes);
		// everyone else gets deactivated instead.
		const employee = await employees.findOne(
			{ _id: new ObjectId(id) },
			{ projection: { tipsCollected: 1 } }
		);
		if (!employee) {
			return res.status(404).json({ error: "Employee not found" });
		}
		if (Array.isArray(employee.tipsCollected) && employee.tipsCollected.length > 0) {
			return res.status(409).json({
				error:
					"This employee has tip history, so deleting them would remove them from past payroll totals. Edit them and uncheck Active instead.",
			});
		}

		const result = await employees.deleteOne({ _id: new ObjectId(id) });

		if (result.deletedCount === 0) {
			return res.status(404).json({ error: "Employee not found" });
		}

		res.status(200).json({ message: "Employee deleted successfully" });
	} catch (error) {
		await reportError("removeEmployee", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});
