import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import { getApiSession } from "../../lib/auth";
import { ShiftDate } from "../../lib/shiftDate";

const toIdList = (list) => (Array.isArray(list) ? list : []);

export default async (req, res) => {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}

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
		totalBarSales,
		shiftNotes,
	} = req.body ?? {};

	if (typeof show !== "string" || !show.trim() || typeof date !== "string") {
		return res.status(400).json({ message: "Show and date are required" });
	}

	// Managers can submit any date. Logged-out staff may only submit the
	// current shift.
	const session = await getApiSession(req, res);
	if (!session && date !== ShiftDate()) {
		return res
			.status(401)
			.json({ message: "Sign in required to submit a past shift" });
	}

	const cooks = toIdList(cookTips);
	const barBacks = toIdList(barBackTips);
	const bartenders = toIdList(BartenderTips);
	const everyone = [...cooks, ...barBacks, ...bartenders];
	if (everyone.some((e) => !ObjectId.isValid(e?.id))) {
		return res.status(400).json({ message: "Invalid employee id in tips" });
	}

	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		const tipBreakdownResult = await db.collection("tipBreakdown").insertOne({
			show,
			date,
			totalTips,
			foodSales,
			barBackPercentage,
			cookTips: cooks,
			barBackTips: barBacks,
			BartenderTips: bartenders,
			tipsPerCook,
			tipsPerBarBack,
			tipsPerBartender,
			totalBarSales,
			shiftNotes,
			createdat: new Date(),
		});

		const tipBreakdownId = tipBreakdownResult.insertedId;

		for (const employee of everyone) {
			await db.collection("employees").updateOne(
				{ _id: new ObjectId(employee.id) },
				{
					$addToSet: {
						tipsCollected: {
							date,
							amount: employee.tipOut,
							workingPosition: employee.workingPosition,
							show,
							tipBreakdownId: tipBreakdownId.toString(),
						},
					},
				}
			);
		}

		res.status(201).json({
			message: "Tip Break Down added successfully",
			tipBreakdownId,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};
