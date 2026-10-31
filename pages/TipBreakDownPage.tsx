import React from "react";
import clientPromise from "../lib/mongodb";

import { useRouter } from "next/router";
import TipBreakDown from "../components/TipBreakDown";
import { BREAKDOWN_SUMMARY_FIELDS } from "../lib/breakdownFields";
import { ShiftDate } from "../lib/shiftDate";
import { reportError } from "../lib/alert";
import { fromQuery, toJson } from "../lib/json";
import type { GetServerSideProps } from "next";
import type {
	BreakdownSummary,
	BreakdownSummaryDoc,
	TipBreakdownDoc,
	WorkerOption,
} from "../types/models";

type Props = { allTipBreakdowns: BreakdownSummary[] };

export default function TipBreakDownPage({ allTipBreakdowns }: Props) {
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


	const parsedBartenders = bartenders ? fromQuery<WorkerOption[]>(bartenders) : [];
	const parsedBarBacks = barBacks ? fromQuery<WorkerOption[]>(barBacks) : [];
	const parsedCooks = cooks ? fromQuery<WorkerOption[]>(cooks) : [];
	const parsedBarBackPercentage = Number(barBackPercentage) || 0;
	const parsedFoodSalesTotal = Number(foodSalesTotal) || 0;
	const parsedEmployeeHours = employeeHours ? fromQuery<Record<string, number>>(employeeHours) : [];
	const parsedEmployeeTipCollected = employeeTipCollected
		? fromQuery<Record<string, number>>(employeeTipCollected)
		: [];
	const parseSelectedShow = selectedShow ? fromQuery<string>(selectedShow) : "";
	const parseTotalTips = totalTips ? Number(fromQuery<unknown>(totalTips)) || 0 : 0;
	const parseTotalBarSales = totalBarSales ? Number(fromQuery<unknown>(totalBarSales)) || 0 : 0;
	const parseShiftNotes = shiftNotes ? fromQuery<string>(shiftNotes) : "";

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

export const getServerSideProps: GetServerSideProps<Props> = async () => {
	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		const allTipBreakdowns = await db
			.collection<TipBreakdownDoc>("tipBreakdown")
			.find<BreakdownSummaryDoc>({ date: ShiftDate() }, { projection: BREAKDOWN_SUMMARY_FIELDS })
			.toArray();
		return {
			props: { allTipBreakdowns: toJson(allTipBreakdowns) },
		};
	} catch (err) {
		await reportError("Tip breakdown review page", err);
		return { props: { allTipBreakdowns: [] } };
	}
};
