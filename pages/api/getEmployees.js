import clientPromise from "../../lib/mongodb";
import { requireSession } from "../../lib/auth";
import { reportError } from "../../lib/alert";

export default requireSession(async (req, res) => {
	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		const employees = await db
			.collection("employees")
			.find({}, { projection: { password: 0, token: 0 } })
			.toArray();
		res.json(employees);
	} catch (err) {
		await reportError("getEmployees", err);
		res.status(500).json({ error: "Internal Server Error" });
	}
});
