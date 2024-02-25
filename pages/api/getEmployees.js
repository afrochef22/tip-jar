import clientPromise from "../../lib/mongodb";

export default async (req, res) => {
	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		const employees = await db
			.collection("employees")
			.find({})
			.limit(1000000)
			.toArray();
		console.log(employees);
		res.json(employees);
	} catch (err) {
		console.error(err);
	}
};
