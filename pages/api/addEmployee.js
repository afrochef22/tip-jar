import clientPromise from "../../lib/mongodb";
// import cors from "cors";

// const corsMiddleware = cors({ origin: true });

export default async (req, res) => {
	// await corsMiddleware(req, res);

	if (req.method === "POST") {
		try {
			const { firstName, lastName, position } = req.body;
			const client = await clientPromise;
			const db = client.db("TeragramBallroom");

			await db.collection("employees").insertOne({
				firstName,
				lastName,
				position: position,
				tipsCollected: [
					// {
					// 	date: Date,
					// 	amount: Number,
					// 	workingPosition: String,
					// 	show: String,
					// 	createdat: new Date(),
					// },
				],
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
