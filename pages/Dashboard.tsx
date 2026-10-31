import React from "react";
import clientPromise from "../lib/mongodb";
import { PUBLIC_EMPLOYEE_TIP_FIELDS } from "../lib/employeeFields";
import { BREAKDOWN_CARD_FIELDS } from "../lib/breakdownFields";
import AllTipBreakDowns from "../components/AllTipBreakDowns";
import TipsTotalsSpreadSheet from "../components/TipsTotalsSpreadSheet";
import { reportError } from "../lib/alert";
import { toJson } from "../lib/json";
import type { GetServerSideProps } from "next";
import type {
	BreakdownCard,
	BreakdownCardDoc,
	EmployeeDoc,
	PublicEmployeeWithTips,
	PublicEmployeeWithTipsDoc,
	TipBreakdownDoc,
} from "../types/models";

type Props = { employees: PublicEmployeeWithTips[]; allTipBreakdowns: BreakdownCard[] };

export default function Dashboard({ employees, allTipBreakdowns }: Props) {
	return (
		<div>
			<AllTipBreakDowns allTipBreakdowns={allTipBreakdowns} />
			<TipsTotalsSpreadSheet
				allTipBreakdowns={allTipBreakdowns}
				employees={employees}
			/>
		</div>
	);
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		const allTipBreakdowns = await db
			.collection<TipBreakdownDoc>("tipBreakdown")
			.find<BreakdownCardDoc>({}, { projection: BREAKDOWN_CARD_FIELDS })

			.toArray();

		const employees = await db
			.collection<EmployeeDoc>("employees")
			.find<PublicEmployeeWithTipsDoc>({}, { projection: PUBLIC_EMPLOYEE_TIP_FIELDS })

			.toArray();

		return {
			props: {
				allTipBreakdowns: toJson(allTipBreakdowns),
				employees: toJson(employees),
			},
		};
	} catch (err) {
		await reportError("Dashboard page", err);
		return { props: { allTipBreakdowns: [], employees: [] } };
	}
};
