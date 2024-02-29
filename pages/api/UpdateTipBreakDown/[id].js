import BarBacks from "../../../components/BarBacks";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async (req, res) => {
	const id = req.query.id;
	console.log(req.query);
	const data = req.body; // Assuming data is sent in the request body
	console.log(data.BartenderTips);
	if (!ObjectId.isValid(id)) {
		return res.status(400).json({ error: "Invalid Tip breakdown ID: ", id });
	}

	if (req.method === "PATCH") {
		console.log("Received PATCH request with data:", data);

		try {
			const client = await clientPromise;
			const db = client.db("TeragramBallroom");
			const employeeCollection = db.collection("tipBreakdown");

			const objectId = new ObjectId(id);
			const filter = { _id: objectId };

			let updateDocument = {};
			let setValues = {}; // Accumulate changes here

			if (
				data.show ||
				data.date ||
				data.totalTips ||
				data.foodSales ||
				data.barBackPercentage
			) {
				setValues = {
					...(data.show && { show: data.show }),
					...(data.date && { date: data.date }),
					...(data.totalTips && { totalTips: data.totalTips }),
					...(data.foodSales && { foodSales: data.foodSales }),
					...(data.barBackPercentage && {
						barBackPercentage: data.barBackPercentage,
					}),
				};
			}

			// Accumulate changes for cook tips
			if (data.cookTips && Array.isArray(data.cookTips)) {
				const updatedCookTips = data.cookTips.map((cookTip) => {
					if (cookTip.id === data.cookTips.id) {
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
						return { ...barBackTip, tipOut: barBackTip.tipOut };
					}
					return barBackTip;
				});
				setValues.barBackTips = updatedBarBackTips;
			}

			// / Accumulate changes for bartender tips
			if (data.BartenderTips && Array.isArray(data.BartenderTips)) {
				// Construct an array to hold the updated bartender tips
				const updatedBartenderTips = [];

				// Iterate over the existing bartender tips
				for (const bartenderTip of data.BartenderTips) {
					// Find the bartender tip that matches the criteria for update
					const existingTip = data.BartenderTips.find(
						(tip) => tip.id === bartenderTip.id
					);
					if (existingTip) {
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

			updateDocument.$set = setValues; // Merge accumulated changes into updateDocument

			const result = await employeeCollection.updateOne(filter, updateDocument);

			console.log(
				`${result.matchedCount} document(s) matched the filter criteria.`
			);
			console.log(`${result.modifiedCount} document(s) were modified.`);

			res.status(200).json({ message: "Tip Breakdown updated successfully" });
		} catch (error) {
			console.error("Error updating data:", error);
			res.status(500).json({ error: "Internal Server Error" });
		}
	} else {
		res.status(405).json({ message: "Method Not Allowed" });
	}
};
