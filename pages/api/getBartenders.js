import clientPromise from "../../lib/mongodb";

export default async (req, res) => {
	try {
		const client = await clientPromise;
		const db = client.db("test");

		const bartenders = await db
			.collection("bartenders")
			.find({})
			.sort()
			.limit(20)
			.toArray();

		res.json(bartenders);
	} catch (err) {
		console.error(err);
	}
};
