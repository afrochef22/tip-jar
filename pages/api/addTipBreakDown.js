import clientPromise from "../../lib/mongodb";

export default async (req, res) => {
	if (req.method === "POST") {
		try {
			const {
				show,
				date,
				totalTips,
				foodSales,
				barBackPercentage,
				cookTips,
				barBackTips,
				BartenderTips,
			} = req.body;
			const client = await clientPromise;
			const db = client.db("TeragramBallroom");

			await db.collection("tipBreakdown").insertOne({
				show,
				date,
				totalTips,
				foodSales,
				barBackPercentage,
				cookTips,
				barBackTips,
				BartenderTips,

				createdat: new Date(),
			});

			res.status(201).json({ message: "Tip Break Down added successfully" });
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	} else {
		res.status(405).json({ message: "Method not allowed" });
	}
};
