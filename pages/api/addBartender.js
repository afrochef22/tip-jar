import clientPromise from "../../lib/mongodb";

export default async (req, res) => {
	if (req.method === "POST") {
		try {
			const { firstName, lastName } = req.body;

			const client = await clientPromise;
			const db = client.db("test");

			await db.collection("bartenders").insertOne({
				firstName,
				lastName,
				createdat: new Date(),
			});

			res.status(201).json({ message: "Bartender added successfully" });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	} else {
		res.status(405).json({ message: "Method not allowed" });
	}
};
