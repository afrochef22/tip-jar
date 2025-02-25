import React from "react";
import clientPromise from "../lib/mongodb";

import { useRouter } from "next/router";
import TipBreakDown from "../components/TipBreakDown";

export default function creditTipCalculationPage(allTipBreakdowns) {
	const router = useRouter();
	const {
		bartenders,
		barBacks,
		cooks,
		barBackPercentage,
		foodSalesTotal,
		employeeHours,
		employeeTipCollected,
		selectedShow,
		totalTips,
		totalBarSales,
		shiftNotes,
	} = router.query;

	console.log("allTipBreakdowns", allTipBreakdowns);

	console.log("bartenders", bartenders);
	console.log("barBacks", barBacks);
	console.log("cooks", cooks);
	console.log("barBackPercentage", barBackPercentage);
	console.log("foodSalesTotal", foodSalesTotal);
	console.log("employeeHours", employeeHours);
	console.log("employeeTipCollected", employeeTipCollected);
	console.log("selectedShow", selectedShow);
	console.log("totalTips", totalTips);
	console.log("totalBarSales", totalBarSales);
	console.log("shiftNotes", shiftNotes);

	const parsedBartenders = bartenders ? JSON.parse(bartenders) : [];
	const parsedBarBacks = barBacks ? JSON.parse(barBacks) : [];
	const parsedCooks = cooks ? JSON.parse(cooks) : [];
	const parsedBarBackPercentage = parseFloat(barBackPercentage);
	const parsedFoodSalesTotal = parseFloat(foodSalesTotal);
	const parsedEmployeeHours = employeeHours ? JSON.parse(employeeHours) : [];
	const parsedEmployeeTipCollected = employeeTipCollected
		? JSON.parse(employeeTipCollected)
		: [];
	const parseSelectedShow = selectedShow ? JSON.parse(selectedShow) : "";
	const parseTotalTips = totalTips ? JSON.parse(totalTips) : "";
	const parseTotalBarSales = totalBarSales ? JSON.parse(totalBarSales) : "";
	const parseShiftNotes = shiftNotes ? JSON.parse(shiftNotes) : "";

	return (
		<TipBreakDown
			bartenders={parsedBartenders}
			barBacks={parsedBarBacks}
			cooks={parsedCooks}
			barBackPercentage={parsedBarBackPercentage}
			foodSalesTotal={parsedFoodSalesTotal}
			employeeHours={parsedEmployeeHours}
			employeeTipCollected={parsedEmployeeTipCollected}
			selectedShow={parseSelectedShow}
			allTipBreakdowns={allTipBreakdowns}
			totalTips={totalTips}
			totalBarSales={parseTotalBarSales}
			shiftNotes={parseShiftNotes}
		/>
	);
}

export async function getServerSideProps() {
	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		const allTipBreakdowns = await db
			.collection("tipBreakdown")
			.find({})
			.sort()
			.limit(20)
			.toArray();
		console.log(allTipBreakdowns);
		return {
			props: { allTipBreakdowns: JSON.parse(JSON.stringify(allTipBreakdowns)) },
		};
	} catch (err) {
		console.error(err);
	}
}
