import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { getApiSession } from "../../../lib/auth";
import { ShiftDate } from "../../../lib/shiftDate";

export default async (req, res) => {
	const id = req.query.id;
	const data = req.body ?? {};
	if (!ObjectId.isValid(id)) {
		return res.status(400).json({ error: "Invalid Tip breakdown ID: ", id });
	}

	if (req.method === "PATCH") {
		try {
			const client = await clientPromise;
			const db = client.db("TeragramBallroom");
			const tipBreakDownCollection = db.collection("tipBreakdown");
			const employeeCollection = db.collection("employees");

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
			}

			// Copy only the fields that were sent. 0 and "" are valid values.
			const setValues = {};
			const copy = (key, transform = (v) => v) => {
				if (data[key] !== undefined) setValues[key] = transform(data[key]);
			};
			copy("show");
			copy("date");
			copy("shiftNotes");
			copy("totalTips", Number);
			copy("foodSales", Number);
			copy("barBackPercentage", Number);
			copy("totalBarSales", Number);
			copy("tipsPerCook", Number);
			copy("tipsPerBarBack", Number);
			copy("tipsPerBartender", Number);
			if (Array.isArray(data.cookTips)) setValues.cookTips = data.cookTips;
			if (Array.isArray(data.barBackTips)) setValues.barBackTips = data.barBackTips;
			if (Array.isArray(data.bartenderTips))
				setValues.BartenderTips = data.bartenderTips;
			setValues.updatedat = new Date();

			const updateDocument = { $set: setValues };

			const result = await tipBreakDownCollection.updateOne(
				filter,
				updateDocument
			);

			console.log(
				`${result.matchedCount} document(s) matched the filter criteria.`
			);
			console.log(`${result.modifiedCount} document(s) were modified.`);

			// Update employees if necessary
			// Fetch the employees who need to be updated based on the changes in the tip breakdown
			// Convert the provided ID to ObjectId type
			const tipBreakdownObjectId = new ObjectId(id);
			const relevantEmployees = await employeeCollection
				.find({ "tipsCollected.tipBreakdownId": id })
				.toArray();

			// console.log("relevantEmployees", relevantEmployees);

			// Update each relevant employee
			for (const employee of relevantEmployees) {
				// Apply the necessary updates to the employee document based on the changes in the tip breakdown
				if (employee && Array.isArray(employee.tipsCollected)) {
					// Map over the tipsCollected array and update the relevant tip
					const updatedTips = employee.tipsCollected.map((tip) => {
						// Find the corresponding tip from the tip breakdown data
						if (tip.tipBreakdownId === id) {
							// Initialize a variable to hold the updated tip amount
							let updatedTipAmount = tip.amount; // Default to existing amount
							let updatedDate = tip.date;
							let updatedWorkingPosition = tip.workingPosition;
							let updatedShow = tip.show;
							let updateTippedHours = tip.tippedHours ? tip.tippedHours : "";

							// Check if the tip belongs to cookTips, barBackTips, or bartenderTips
							if (tip.workingPosition === "Cook") {
								// Find the corresponding cook tip and update the tip amount
								const cook = (data.cookTips ?? []).find(
									(cook) => cook.id === employee._id.toString()
								);

								if (cook) {
									updatedTipAmount = Number(cook.tipOut);
									updatedDate = data.date ?? tip.date;
									updatedShow = data.show ?? tip.show;
									updatedWorkingPosition = cook.workingPosition;
									updateTippedHours = cook.tippedHours;
								}
							} else if (tip.workingPosition === "Bar Back") {
								// Find the corresponding bar back tip and update the tip amount
								const barBack = (data.barBackTips ?? []).find(
									(barBack) => barBack.id === employee._id.toString()
								);
								if (barBack) {
									updatedTipAmount = Number(barBack.tipOut);
									// console.log("Updated bar back tip amount:", updatedTipAmount);
									updatedDate = data.date ?? tip.date;
									updatedShow = data.show ?? tip.show;
									updatedWorkingPosition = barBack.workingPosition;
									updateTippedHours = barBack.tippedHours;
								}
							} else if (tip.workingPosition === "Bartender") {
								// Find the corresponding bartender tip and update the tip amount
								const bartender = (data.bartenderTips ?? []).find(
									(bartender) => bartender.id === employee._id.toString()
								);
								if (bartender) {
									updatedTipAmount = Number(bartender.tipOut);
									// console.log(
									// 	"Updated bartender tip amount:",
									// 	updatedTipAmount
									// );
									updatedDate = data.date ?? tip.date;
									updatedShow = data.show ?? tip.show;
									updatedWorkingPosition = bartender.workingPosition;
									updateTippedHours = bartender.tippedHours;
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

					// console.log("updatedTips", updatedTips);

					// Update the employee document with the updated tips
					await employeeCollection.updateOne(
						{ _id: employee._id },
						{ $set: { tipsCollected: updatedTips } }
					);
				}
			}

			res.status(200).json({ message: "Tip Breakdown updated successfully" });
		} catch (error) {
			console.error("Error updating data:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	} else {
		res.status(405).json({ message: "Method Not Allowed" });
	}
};
