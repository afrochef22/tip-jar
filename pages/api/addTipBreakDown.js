import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import { getApiSession } from "../../lib/auth";
import { ShiftDate } from "../../lib/shiftDate";
import { cleanShowName, isSameShow, showKey } from "../../lib/showKey";

const toIdList = (list) => (Array.isArray(list) ? list : []);

export default async (req, res) => {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const {
		show: rawShow,
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

	if (typeof rawShow !== "string" || !rawShow.trim() || typeof date !== "string") {
		return res.status(400).json({ message: "Show and date are required" });
	}
	const show = cleanShowName(rawShow);

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

		// Compare in code rather than by exact match so differences in spacing,
		// capitalization or punctuation still count as the same show. The unique
		// index on { date, showKey } backs this up when two phones submit at once.
		const sameDate = await db
			.collection("tipBreakdown")
			.find({ date }, { projection: { show: 1 } })
			.toArray();
		const duplicate = sameDate.find((b) => isSameShow(b.show, show));
		if (duplicate) {
			return res.status(409).json({
				message: `A tip breakdown for "${duplicate.show}" on ${date} already exists.`,
				tipBreakdownId: duplicate._id,
			});
		}

		const tipBreakdownResult = await db.collection("tipBreakdown").insertOne({
			show,
			showKey: showKey(show),
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
							amount: Number(employee.tipOut) || 0,
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
		if (error?.code === 11000) {
			// Lost a race with an identical submission from another device.
			return res.status(409).json({
				message: "A tip breakdown for this show and date was just submitted.",
			});
		}
		console.error(error);
		res.status(500).json({ message: "Internal server error" });
	}
};
