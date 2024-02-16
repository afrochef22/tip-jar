import React from "react";
import { useRouter } from "next/router";
import CreditTipCalculation from "../components/CreditTipCalculation";

export default function creditTipCalculationPage() {
	const router = useRouter();
	const { workingEmployees, selectedShow } = router.query;
	const parsedWorkingEmployees = workingEmployees
		? JSON.parse(workingEmployees)
		: [];
	const parseSelectedShow = selectedShow ? JSON.parse(selectedShow) : "";
	return (
		<CreditTipCalculation
			workingEmployees={parsedWorkingEmployees}
			selectedShow={parseSelectedShow}
		/>
	);
}
