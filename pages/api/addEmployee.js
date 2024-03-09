import clientPromise from "../../lib/mongodb";
// import cors from "cors";

// const corsMiddleware = cors({ origin: true });

export default async (req, res) => {
	// await corsMiddleware(req, res);

	if (req.method === "POST") {
		try {
			const { firstName, lastName, position, active } = req.body;
			const client = await clientPromise;
			const db = client.db("TeragramBallroom");

			const result = await db.collection("employees").insertOne({
				firstName,
				lastName,
				position: position,
				active,
				tipsCollected: [],
				createdat: new Date(),
			});

			const insertedEmployeeId = result.insertedId; // Get the _id of the inserted document
			console.log("Inserted Employee Id:", insertedEmployeeId);

			res
				.status(201)
				.json({ message: "Employee added successfully", insertedEmployeeId });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	} else {
		res.status(405).json({ message: "Method not allowed" });
	}
};
