import React from "react";
import { useRouter } from "next/router";
import CreditTipCalculation from "../components/CreditTipCalculation";
import { fromQuery } from "../lib/json";
import type { WorkerOption } from "../types/models";

export default function creditTipCalculationPage() {
	const router = useRouter();
	const { workingEmployees, selectedShow } = router.query;
	const parsedWorkingEmployees = workingEmployees
		? fromQuery<WorkerOption[]>(workingEmployees)
		: [];
	const parseSelectedShow = selectedShow ? fromQuery<string>(selectedShow) : "";
	return (
		<CreditTipCalculation
			workingEmployees={parsedWorkingEmployees}
			selectedShow={parseSelectedShow}
		/>
	);
}
