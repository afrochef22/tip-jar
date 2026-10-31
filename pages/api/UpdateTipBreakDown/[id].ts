import type { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import type { WithId } from "mongodb";
import { getApiSession } from "../../../lib/auth";
import { tooManyShiftWrites } from "../../../lib/rateLimit";
import { ShiftDate } from "../../../lib/shiftDate";
import { cleanShowName, isSameShow, showKey } from "../../../lib/showKey";
import { reportError } from "../../../lib/alert";
import { field, isList, prop } from "../../../lib/field";
import { isObjectId } from "../../../lib/objectId";
import type { EmployeeDoc, TipBreakdownDoc } from "../../../types/models";

// `(data.cookTips ?? []).find(...)` threw a TypeError when the field wasn't a
// list, which the catch below turns into a 500. This keeps that.
const asList = (value: unknown): unknown[] => {
	if (!isList(value)) throw new TypeError("Expected a list of workers");
	return value;
};

export default async (req: NextApiRequest, res: NextApiResponse) => {
	const id = req.query.id;
	const data: Record<string, unknown> = { ...req.body };
	if (!isObjectId(id)) {
		return res.status(400).json({ error: "Invalid Tip breakdown ID: ", id });
	}

	if (req.method === "PATCH") {
		try {
			const client = await clientPromise;
			const db = client.db("TeragramBallroom");
			const tipBreakDownCollection = db.collection<TipBreakdownDoc>("tipBreakdown");
			const employeeCollection = db.collection<EmployeeDoc>("employees");
			// Untyped handles for the queries and writes below that use values as
			// the browser sent them (see BUGS_FOUND.md).
			const unchecked = {
				tipBreakdown: db.collection("tipBreakdown"),
				employees: db.collection("employees"),
			};

			const objectId = new ObjectId(id);
			const filter = { _id: objectId };

			const existing = await tipBreakDownCollection.findOne(filter);
			if (!existing) {
				return res.status(404).json({ error: "Breakdown not found" });
			}

			// Managers can edit any breakdown. Logged-out staff may only edit the
			// current shift, and may not move it to another date.
			const session = await getApiSession(req, res);
			if (!session) {
				const today = ShiftDate();
				const movingDate = data.date !== undefined && data.date !== today;
				if (existing.date !== today || movingDate) {
					return res
						.status(401)
						.json({ error: "Sign in required to edit a past shift" });
				}
				if (await tooManyShiftWrites(req, res)) return;
			}

			if (data.show !== undefined) {
				if (typeof data.show !== "string" || !data.show.trim()) {
					return res.status(400).json({ error: "Show name is required" });
				}
				data.show = cleanShowName(data.show);
			}

			// Renaming or moving a breakdown must not collide with another one.
			const newShow = data.show ?? existing.show;
			const newDate = data.date ?? existing.date;
			if (!isSameShow(newShow, existing.show) || newDate !== existing.date) {
				const sameDate = await unchecked.tipBreakdown
					.find<WithId<Pick<TipBreakdownDoc, "show">>>(
						{ date: newDate, _id: { $ne: objectId } },
						{ projection: { show: 1 } }
					)
					.toArray();
				const clash = sameDate.find((b) => isSameShow(b.show, newShow));
				if (clash) {
					return res.status(409).json({
						error: `A tip breakdown for "${clash.show}" on ${newDate} already exists.`,
						tipBreakdownId: clash._id,
					});
				}
			}

			// Copy only the fields that were sent. 0 and "" are valid values.
			const setValues: Record<string, unknown> = {};
			const copy = (key: string, transform: (v: unknown) => unknown = (v) => v) => {
				if (data[key] !== undefined) setValues[key] = transform(data[key]);
			};
			copy("show");
			if (data.show !== undefined) setValues.showKey = showKey(data.show);
			copy("date");
			copy("shiftNotes");
			copy("totalTips", Number);
			copy("foodSales", Number);
			copy("barBackPercentage", Number);
			copy("totalBarSales", Number);
			copy("tipsPerCook", Number);
			copy("tipsPerBarBack", Number);
			copy("tipsPerBartender", Number);
			if (isList(data.cookTips)) setValues.cookTips = data.cookTips;
			if (isList(data.barBackTips)) setValues.barBackTips = data.barBackTips;
			if (isList(data.bartenderTips))
				setValues.BartenderTips = data.bartenderTips;
			setValues.updatedat = new Date();

			const updateDocument = { $set: setValues };

			const result = await unchecked.tipBreakdown.updateOne(
				filter,
				updateDocument
			);

			// Update employees if necessary
			// Fetch the employees who need to be updated based on the changes in the tip breakdown
			// Convert the provided ID to ObjectId type
			const tipBreakdownObjectId = new ObjectId(id);
			const relevantEmployees = await employeeCollection
				.find({ "tipsCollected.tipBreakdownId": id })
				.toArray();

			// Update each relevant employee
			for (const employee of relevantEmployees) {
				// Apply the necessary updates to the employee document based on the changes in the tip breakdown
				if (employee && Array.isArray(employee.tipsCollected)) {
					// Map over the tipsCollected array and update the relevant tip
					const updatedTips = employee.tipsCollected.map((tip) => {
						// Find the corresponding tip from the tip breakdown data
						if (tip.tipBreakdownId === id) {
							// Initialize a variable to hold the updated tip amount
							let updatedTipAmount: unknown = tip.amount; // Default to existing amount
							let updatedDate: unknown = tip.date;
							let updatedWorkingPosition: unknown = tip.workingPosition;
							let updatedShow: unknown = tip.show;
							let updateTippedHours: unknown = tip.tippedHours ? tip.tippedHours : "";

							// Check if the tip belongs to cookTips, barBackTips, or bartenderTips
							if (tip.workingPosition === "Cook") {
								// Find the corresponding cook tip and update the tip amount
								const cook = asList(data.cookTips ?? []).find(
									(cook) => prop(cook, "id") === employee._id.toString()
								);

								if (cook) {
									updatedTipAmount = Number(prop(cook, "tipOut"));
									updatedDate = data.date ?? tip.date;
									updatedShow = data.show ?? tip.show;
									updatedWorkingPosition = prop(cook, "workingPosition");
									updateTippedHours = prop(cook, "tippedHours");
								}
							} else if (tip.workingPosition === "Bar Back") {
								// Find the corresponding bar back tip and update the tip amount
								const barBack = asList(data.barBackTips ?? []).find(
									(barBack) => prop(barBack, "id") === employee._id.toString()
								);
								if (barBack) {
									updatedTipAmount = Number(prop(barBack, "tipOut"));
									updatedDate = data.date ?? tip.date;
									updatedShow = data.show ?? tip.show;
									updatedWorkingPosition = prop(barBack, "workingPosition");
									updateTippedHours = prop(barBack, "tippedHours");
								}
							} else if (tip.workingPosition === "Bartender") {
								// Find the corresponding bartender tip and update the tip amount
								const bartender = asList(data.bartenderTips ?? []).find(
									(bartender) => prop(bartender, "id") === employee._id.toString()
								);
								if (bartender) {
									updatedTipAmount = Number(prop(bartender, "tipOut"));
									updatedDate = data.date ?? tip.date;
									updatedShow = data.show ?? tip.show;
									updatedWorkingPosition = prop(bartender, "workingPosition");
									updateTippedHours = prop(bartender, "tippedHours");
								}
							}

							// Merge the existing tip data with the updated tip amount
							return {
								...tip,
								amount: updatedTipAmount,
								date: updatedDate,
								workingPosition: updatedWorkingPosition,
								show: updatedShow,
								tippedHours: updateTippedHours,
								updatedat: new Date(),
							};
						}
						return tip; // Return unchanged tip if tipBreakdownId doesn't match
					});

					// Update the employee document with the updated tips
					await unchecked.employees.updateOne(
						{ _id: employee._id },
						{ $set: { tipsCollected: updatedTips } }
					);
				}
			}

			res.status(200).json({ message: "Tip Breakdown updated successfully" });
		} catch (error) {
			if (field(error, "code") === 11000) {
				return res.status(409).json({
					error: "A tip breakdown for this show and date already exists.",
				});
			}
			await reportError("UpdateTipBreakDown (editing a shift)", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	} else {
		res.status(405).json({ message: "Method Not Allowed" });
	}
};
