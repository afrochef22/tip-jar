import clientPromise from "../lib/mongodb";
import { PUBLIC_EMPLOYEE_TIP_FIELDS } from "../lib/employeeFields";
import { BREAKDOWN_SUMMARY_FIELDS } from "../lib/breakdownFields";
import TipsTotalsSpreadSheet from "../components/TipsTotalsSpreadSheet";
import { reportError } from "../lib/alert";

export default function CCTipsTotals({ employees, allTipBreakdowns }) {
	return (
		<TipsTotalsSpreadSheet
			employees={employees}
			allTipBreakdowns={allTipBreakdowns}
			variant="page"
		/>
	);
}

export async function getServerSideProps() {
	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		const allTipBreakdowns = await db
			.collection("tipBreakdown")
			.find({}, { projection: BREAKDOWN_SUMMARY_FIELDS })
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
		await reportError("CCTipsTotals page", err);
		return { props: { allTipBreakdowns: [], employees: [] } };
	}
}
