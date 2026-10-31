import clientPromise from "../lib/mongodb";
import { PUBLIC_EMPLOYEE_TIP_FIELDS } from "../lib/employeeFields";
import { BREAKDOWN_SUMMARY_FIELDS } from "../lib/breakdownFields";
import TipsTotalsSpreadSheet from "../components/TipsTotalsSpreadSheet";
import { reportError } from "../lib/alert";
import { toJson } from "../lib/json";
import type { GetServerSideProps } from "next";
import type {
	BreakdownSummary,
	BreakdownSummaryDoc,
	EmployeeDoc,
	PublicEmployeeWithTips,
	PublicEmployeeWithTipsDoc,
	TipBreakdownDoc,
} from "../types/models";

type Props = { employees: PublicEmployeeWithTips[]; allTipBreakdowns: BreakdownSummary[] };

export default function CCTipsTotals({ employees, allTipBreakdowns }: Props) {
	return (
		<TipsTotalsSpreadSheet
			employees={employees}
			allTipBreakdowns={allTipBreakdowns}
			variant="page"
		/>
	);
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		const allTipBreakdowns = await db
			.collection<TipBreakdownDoc>("tipBreakdown")
			.find<BreakdownSummaryDoc>({}, { projection: BREAKDOWN_SUMMARY_FIELDS })
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
		await reportError("CCTipsTotals page", err);
		return { props: { allTipBreakdowns: [], employees: [] } };
	}
};
