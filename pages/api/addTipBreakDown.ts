import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import { getApiSession } from "../../lib/auth";
import { tooManyShiftWrites } from "../../lib/rateLimit";
import { ShiftDate } from "../../lib/shiftDate";
import { cleanShowName, isSameShow, showKey } from "../../lib/showKey";
import { reportError } from "../../lib/alert";
import { field, prop } from "../../lib/field";
import { isObjectId } from "../../lib/objectId";
import { checkAmounts, checkNotes, isShiftDate, readWorkers, toAmount } from "../../lib/breakdownInput";
import type { TipBreakdownDoc } from "../../types/models";

// A worker line whose `id` is a valid employee id. readWorkers checks the rest.
const hasEmployeeId = (worker: unknown): worker is { id: Parameters<typeof ObjectId.isValid>[0] } =>
	isObjectId(field(worker, "id"));

export default async (req: NextApiRequest, res: NextApiResponse) => {
	if (req.method !== "POST") {
		return res.status(405).json({ message: "Method not allowed" });
	}

	const body: Record<string, unknown> = { ...req.body };
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
	} = body;

	if (typeof rawShow !== "string" || !rawShow.trim() || typeof date !== "string") {
		return res.status(400).json({ message: "Show and date are required" });
	}
	if (!isShiftDate(date)) {
		return res.status(400).json({ message: "Date must look like 10/31/2026" });
	}
	const cooks = readWorkers(cookTips ?? [], "cookTips");
	const barBacks = readWorkers(barBackTips ?? [], "barBackTips");
	const bartenders = readWorkers(BartenderTips ?? [], "BartenderTips");
	const problem =
		checkAmounts(body, ["totalTips"]) ||
		checkNotes(shiftNotes) ||
		cooks.error ||
		barBacks.error ||
		bartenders.error;
	if (problem) {
		return res.status(400).json({ message: problem });
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
	if (!session && (await tooManyShiftWrites(req, res, "message"))) return;

	const everyone = [...cooks.workers, ...barBacks.workers, ...bartenders.workers];
	if (!everyone.every(hasEmployeeId)) {
		return res.status(400).json({ message: "Invalid employee id in tips" });
	}

	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");
		// Untyped handles for the writes below: worker lines keep any extra
		// fields the browser sends (position, active, checked...).
		const unchecked = {
			tipBreakdown: db.collection("tipBreakdown"),
			employees: db.collection("employees"),
		};

		// Compare in code rather than by exact match so differences in spacing,
		// capitalization or punctuation still count as the same show. The unique
		// index on { date, showKey } backs this up when two phones submit at once.
		const sameDate = await db
			.collection<TipBreakdownDoc>("tipBreakdown")
			.find({ date }, { projection: { show: 1 } })
			.toArray();
		const duplicate = sameDate.find((b) => isSameShow(b.show, show));
		if (duplicate) {
			return res.status(409).json({
				message: `A tip breakdown for "${duplicate.show}" on ${date} already exists.`,
				tipBreakdownId: duplicate._id,
			});
		}

		const tipBreakdownResult = await unchecked.tipBreakdown.insertOne({
			show,
			showKey: showKey(show),
			date,
			totalTips: toAmount(totalTips),
			foodSales: toAmount(foodSales),
			barBackPercentage: toAmount(barBackPercentage),
			cookTips: cooks.workers,
			barBackTips: barBacks.workers,
			BartenderTips: bartenders.workers,
			tipsPerCook: toAmount(tipsPerCook),
			tipsPerBarBack: toAmount(tipsPerBarBack),
			tipsPerBartender: toAmount(tipsPerBartender),
			totalBarSales: toAmount(totalBarSales),
			shiftNotes,
			createdat: new Date(),
		});

		const tipBreakdownId: ObjectId = tipBreakdownResult.insertedId;

		for (const employee of everyone) {
			await unchecked.employees.updateOne(
				{ _id: new ObjectId(employee.id) },
				{
					$addToSet: {
						tipsCollected: {
							date,
							amount: Number(prop(employee, "tipOut")) || 0,
							workingPosition: prop(employee, "workingPosition"),
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
		if (field(error, "code") === 11000) {
			// Lost a race with an identical submission from another device.
			return res.status(409).json({
				message: "A tip breakdown for this show and date was just submitted.",
			});
		}
		await reportError("addTipBreakDown (saving a shift)", error);
		res.status(500).json({ message: "Internal server error" });
	}
};
