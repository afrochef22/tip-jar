// pages/SelectWorkingEmployee.js
import React from "react";
import SelectEmployee from "../components/SelectEmployee";
import clientPromise from "../lib/mongodb";
import { PUBLIC_EMPLOYEE_FIELDS } from "../lib/employeeFields";
import { BREAKDOWN_SUMMARY_FIELDS } from "../lib/breakdownFields";
import { ShiftDate } from "../lib/shiftDate";
import { reportError } from "../lib/alert";
import { toJson } from "../lib/json";
import type { GetServerSideProps } from "next";
import type {
	BreakdownSummary,
	BreakdownSummaryDoc,
	EmployeeDoc,
	PublicEmployee,
	PublicEmployeeDoc,
	TipBreakdownDoc,
} from "../types/models";

type Props = { employees: PublicEmployee[]; allTipBreakdowns: BreakdownSummary[] };

export default function SelectWorkingEmployee({ employees, allTipBreakdowns }: Props) {
	return (
		<div className="background-color">
			<SelectEmployee
				employees={employees}
				allTipBreakdowns={allTipBreakdowns}
			/>
		</div>
	);
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		// you can use the cursor interface to iterate over the entire result set without specifying a limit. This approach is more efficient for handling large result sets because it doesn't load all documents into memory at once:

		const cursor = db
			.collection<EmployeeDoc>("employees")
			.find<PublicEmployeeDoc>({}, { projection: PUBLIC_EMPLOYEE_FIELDS });
		const employees = await cursor.toArray();

		// Only today's breakdowns matter here (duplicate checks for this shift).
		const cursor2 = db
			.collection<TipBreakdownDoc>("tipBreakdown")
			.find<BreakdownSummaryDoc>({ date: ShiftDate() }, { projection: BREAKDOWN_SUMMARY_FIELDS });
		const allTipBreakdowns = await cursor2.toArray();

		return {
			props: {
				employees: toJson(employees),
				allTipBreakdowns: toJson(allTipBreakdowns),
			},
		};
	} catch (err) {
		await reportError("Shift screen (SelectWorkingEmployee)", err);
		return {
			props: { employees: [], allTipBreakdowns: [] },
		};
	}
};
