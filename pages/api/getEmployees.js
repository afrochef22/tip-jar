import clientPromise from "../../lib/mongodb";
import { requireSession } from "../../lib/auth";

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
		console.error(err);
		res.status(500).json({ error: "Internal Server Error" });
	}
});
