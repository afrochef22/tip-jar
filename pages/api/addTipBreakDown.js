import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";

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
				tipsPerCook,
				tipsPerBarBack,
				tipsPerBartender,
			} = req.body;
			const client = await clientPromise;
			const db = client.db("TeragramBallroom");
			console.log(req.body);

			const tipBreakdownResult = await db.collection("tipBreakdown").insertOne({
				show,
				date,
				totalTips,
				foodSales,
				barBackPercentage,
				cookTips,
				barBackTips,
				BartenderTips,
				tipsPerCook,
				tipsPerBarBack,
				tipsPerBartender,

				createdat: new Date(),
			});

			const tipBreakdownId = tipBreakdownResult.insertedId;

			// Update employees' tip information
			const updateEmployeeTip = async (employeeId, tipOut, workingPosition) => {
				await db.collection("employees").updateOne(
					{ _id: employeeId },
					{
						$addToSet: {
							tipsCollected: {
								date,
								amount: tipOut,
								workingPosition,
								show,
								tipBreakdownId: tipBreakdownId.toString(), // Convert ObjectId to string
							},
						},
					}
				);
			};

			// Update tip information for cooks
			for (const cook of cookTips) {
				const objectId = new ObjectId(cook.id);

				console.log(objectId, cook.tipOut, cook.workingPosition);
				await updateEmployeeTip(
					objectId,
					cook.tipOut,
					cook.workingPosition,
					tipBreakdownId
				);
			}

			// Update tip information for bar backs
			for (const barBack of barBackTips) {
				const objectId = new ObjectId(barBack.id);

				console.log(barBack.id, barBack.tipOut, barBack.workingPosition);
				await updateEmployeeTip(
					objectId,
					barBack.tipOut,
					barBack.workingPosition,
					tipBreakdownId
				);
			}

			// Update tip information for bartenders
			for (const bartender of BartenderTips) {
				const objectId = new ObjectId(bartender.id);

				console.log(
					"BArtender",
					bartender.id,
					bartender.tipOut,
					bartender.workingPosition
				);
				await updateEmployeeTip(
					objectId,
					bartender.tipOut,
					bartender.workingPosition,
					tipBreakdownId
				);
			}

			res
				.status(201)
				.json({
					message: "Tip Break Down added successfully",
					tipBreakdownId: tipBreakdownId,
				});
		} catch (error) {
			console.error(error);
			res.status(500).json({ message: "Internal server error" });
		}
	} else {
		res.status(405).json({ message: "Method not allowed" });
	}
};
