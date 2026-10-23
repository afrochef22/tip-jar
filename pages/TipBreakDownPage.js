import React from "react";
import clientPromise from "../lib/mongodb";

import { useRouter } from "next/router";
import TipBreakDown from "../components/TipBreakDown";
import { BREAKDOWN_SUMMARY_FIELDS } from "../lib/breakdownFields";
import { ShiftDate } from "../lib/shiftDate";
import { reportError } from "../lib/alert";

export default function TipBreakDownPage({ allTipBreakdowns }) {
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


	const parsedBartenders = bartenders ? JSON.parse(bartenders) : [];
	const parsedBarBacks = barBacks ? JSON.parse(barBacks) : [];
	const parsedCooks = cooks ? JSON.parse(cooks) : [];
	const parsedBarBackPercentage = Number(barBackPercentage) || 0;
	const parsedFoodSalesTotal = Number(foodSalesTotal) || 0;
	const parsedEmployeeHours = employeeHours ? JSON.parse(employeeHours) : [];
	const parsedEmployeeTipCollected = employeeTipCollected
		? JSON.parse(employeeTipCollected)
		: [];
	const parseSelectedShow = selectedShow ? JSON.parse(selectedShow) : "";
	const parseTotalTips = totalTips ? Number(JSON.parse(totalTips)) || 0 : 0;
	const parseTotalBarSales = totalBarSales ? Number(JSON.parse(totalBarSales)) || 0 : 0;
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
			totalTips={parseTotalTips}
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
			.find({ date: ShiftDate() }, { projection: BREAKDOWN_SUMMARY_FIELDS })
			.toArray();
		return {
			props: { allTipBreakdowns: JSON.parse(JSON.stringify(allTipBreakdowns)) },
		};
	} catch (err) {
		await reportError("Tip breakdown review page", err);
		return { props: { allTipBreakdowns: [] } };
	}
}
