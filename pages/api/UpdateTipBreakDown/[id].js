import BarBacks from "../../../components/BarBacks";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async (req, res) => {
	const id = req.query.id;
	console.log(req.query);
	const data = req.body; // Assuming data is sent in the request body
	console.log("Bartender Tips", data.bartenderTips);
	if (!ObjectId.isValid(id)) {
		return res.status(400).json({ error: "Invalid Tip breakdown ID: ", id });
	}

	if (req.method === "PATCH") {
		console.log("Received PATCH request with data:", data);

		try {
			const client = await clientPromise;
			const db = client.db("TeragramBallroom");
			const tipBreakDownCollection = db.collection("tipBreakdown");
			const employeeCollection = db.collection("employees");

			const objectId = new ObjectId(id);
			const filter = { _id: objectId };

			let updateDocument = {};
			let setValues = {}; // Accumulate changes here

			if (
				data.show ||
				data.date ||
				data.totalTips ||
				data.foodSales ||
				data.barBackPercentage ||
				data.totalBarSales ||
				data.shiftNotes !== undefined // Check for undefined instead of falsy value
			) {
				console.log("data matches");
				setValues = {
					...(data.show && { show: data.show }),
					...(data.date && { date: data.date }),
					...(data.totalTips && { totalTips: data.totalTips }),
					...(data.foodSales && { foodSales: data.foodSales }),
					...(data.totalBarSales && { totalBarSales: data.totalBarSales }),
					...(data.shiftNotes !== undefined && { shiftNotes: data.shiftNotes }), // Explicitly handle empty string
					...(data.barBackPercentage && {
						barBackPercentage: data.barBackPercentage,
					}),
				};
			}

			// Accumulate changes for cook tips
			if (data.cookTips && Array.isArray(data.cookTips)) {
				const updatedCookTips = data.cookTips.map((cookTip) => {
					if (cookTip.id === data.cookTips.id) {
						console.log("cook matches");

						return { ...cookTip, tipOut: cookTip.tipOut };
					}
					return cookTip;
				});
				setValues.cookTips = updatedCookTips;
			}

			// Accumulate changes for bar back tips
			if (data.barBackTips && Array.isArray(data.barBackTips)) {
				const updatedBarBackTips = data.barBackTips.map((barBackTip) => {
					if (data.barBackTips.includes(barBackTip.id)) {
						console.log("bar back matches");

						return { ...barBackTip, tipOut: barBackTip.tipOut };
					}
					return barBackTip;
				});
				setValues.barBackTips = updatedBarBackTips;
			}

			// // / Accumulate changes for bartender tips
			if (data.bartenderTips && Array.isArray(data.bartenderTips)) {
				// Construct an array to hold the updated bartender tips
				const updatedBartenderTips = [];

				// Iterate over the existing bartender tips
				for (const bartenderTip of data.bartenderTips) {
					// Find the bartender tip that matches the criteria for update
					const existingTip = data.bartenderTips.find(
						(tip) => tip.id === bartenderTip.id
					);
					if (existingTip) {
						console.log("bartender matches");

						// If the tip exists, update only the desired property (tipOut) and keep the rest unchanged
						const updatedBartenderTip = {
							...existingTip,
							tipOut: bartenderTip.tipOut,
						};
						// Add the updated bartender tip to the array
						updatedBartenderTips.push(updatedBartenderTip);
					} else {
						// If the tip does not exist, add it as is to the updated array
						updatedBartenderTips.push(bartenderTip);
					}
				}

				// Set the updated bartender tips in the updateDocument
				setValues.BartenderTips = updatedBartenderTips;
			}

			setValues.updatedat = new Date();

			updateDocument.$set = setValues; // Merge accumulated changes into updateDocument

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
								const cook = data.cookTips.find(
									(cook) => cook.id === employee._id.toString()
								);

								if (cook) {
									updatedTipAmount = cook.tipOut;
									updatedDate = data.date;
									updatedShow = data.show;
									updatedWorkingPosition = cook.workingPosition;
									updateTippedHours = cook.tippedHours;
								}
							} else if (tip.workingPosition === "Bar Back") {
								// Find the corresponding bar back tip and update the tip amount
								const barBack = data.barBackTips.find(
									(barBack) => barBack.id === employee._id.toString()
								);
								if (barBack) {
									updatedTipAmount = barBack.tipOut;
									// console.log("Updated bar back tip amount:", updatedTipAmount);
									updatedDate = data.date;
									updatedShow = data.show;
									updatedWorkingPosition = barBack.workingPosition;
									updateTippedHours = barBack.tippedHours;
								}
							} else if (tip.workingPosition === "Bartender") {
								// Find the corresponding bartender tip and update the tip amount
								const bartender = data.bartenderTips.find(
									(bartender) => bartender.id === employee._id.toString()
								);
								if (bartender) {
									updatedTipAmount = bartender.tipOut;
									// console.log(
									// 	"Updated bartender tip amount:",
									// 	updatedTipAmount
									// );
									updatedDate = data.date;
									updatedShow = data.show;
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
