import React from "react";
import clientPromise from "../lib/mongodb";
import { PUBLIC_EMPLOYEE_TIP_FIELDS } from "../lib/employeeFields";
import { BREAKDOWN_CARD_FIELDS } from "../lib/breakdownFields";
import AllTipBreakDowns from "../components/AllTipBreakDowns";
import TipsTotalsSpreadSheet from "../components/TipsTotalsSpreadSheet";

export default function Dashboard({ employees, allTipBreakdowns }) {
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

export async function getServerSideProps() {
	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		const allTipBreakdowns = await db
			.collection("tipBreakdown")
			.find({}, { projection: BREAKDOWN_CARD_FIELDS })

			.toArray();

		const employees = await db
			.collection("employees")
			.find({}, { projection: PUBLIC_EMPLOYEE_TIP_FIELDS })

			.toArray();

		return {
			props: {
				allTipBreakdowns: JSON.parse(JSON.stringify(allTipBreakdowns)),
				employees: JSON.parse(JSON.stringify(employees)),
			},
		};
	} catch (err) {
		console.error(err);
		return { props: { allTipBreakdowns: [], employees: [] } };
	}
}
