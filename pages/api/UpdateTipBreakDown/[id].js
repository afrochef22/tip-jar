import BarBacks from "../../../components/BarBacks";
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";

export default async (req, res) => {
	const id = req.query.id;
	console.log(req.query);
	const data = req.body; // Assuming data is sent in the request body

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

			if (data.cookTips && Array.isArray(data.cookTips)) {
				const updatedCookTips = data.cookTips.map((cookTip) => {
					if (cookTip.id === cookTip.id) {
						return { ...cookTip, tipOut: data.updatedTipOutValue };
					}
					return cookTip;
				});
				setValues.cookTips = updatedCookTips;
			}

			if (data.barBackTips && Array.isArray(data.barBackTips)) {
				const updatedBarBackTips = data.barBackTips.map((barBackTip) => {
					if (barBackTip.id === barBackTip.id) {
						return { ...barBackTip, tipOut: data.updatedTipOutValue };
					}
					return barBackTip;
				});
				setValues.barBackTips = updatedBarBackTips;
			}

			if (data.bartenderTips && Array.isArray(data.bartenderTips)) {
				const updatedBartenderTips = data.bartenderTips.map((bartenderTip) => {
					if (bartenderTip.id === bartenderTip.id) {
						return { ...bartenderTip, tipOut: data.updatedTipOutValue };
					}
					return bartenderTip;
				});
				setValues.bartenderTips = updatedBartenderTips;
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
