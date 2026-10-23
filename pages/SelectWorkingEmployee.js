// pages/SelectWorkingEmployee.js
import React from "react";
import SelectEmployee from "../components/SelectEmployee";
import clientPromise from "../lib/mongodb";
import { PUBLIC_EMPLOYEE_FIELDS } from "../lib/employeeFields";
import { BREAKDOWN_SUMMARY_FIELDS } from "../lib/breakdownFields";
import { ShiftDate } from "../lib/shiftDate";

export default function SelectWorkingEmployee({ employees, allTipBreakdowns }) {
	return (
		<div className="background-color">
			<SelectEmployee
				employees={employees}
				allTipBreakdowns={allTipBreakdowns}
			/>
		</div>
	);
}

export async function getServerSideProps() {
	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		// you can use the cursor interface to iterate over the entire result set without specifying a limit. This approach is more efficient for handling large result sets because it doesn't load all documents into memory at once:

		const cursor = db
			.collection("employees")
			.find({}, { projection: PUBLIC_EMPLOYEE_FIELDS });
		const employees = await cursor.toArray();

		// Only today's breakdowns matter here (duplicate checks for this shift).
		const cursor2 = db
			.collection("tipBreakdown")
			.find({ date: ShiftDate() }, { projection: BREAKDOWN_SUMMARY_FIELDS });
		const allTipBreakdowns = await cursor2.toArray();

		return {
			props: {
				employees: JSON.parse(JSON.stringify(employees)),
				allTipBreakdowns: JSON.parse(JSON.stringify(allTipBreakdowns)),
			},
		};
	} catch (err) {
		console.error(err);
		return {
			props: { employees: [], allTipBreakdowns: [] },
		};
	}
}
