import React from "react";
import { useRouter } from "next/router";
import CreditTipCalculation from "../components/CreditTipCalculation";

export default function creditTipCalculationPage() {
	const router = useRouter();
	const { workingEmployees } = router.query;
	const parsedWorkingEmployees = workingEmployees
		? JSON.parse(workingEmployees)
		: [];

	return <CreditTipCalculation workingEmployees={parsedWorkingEmployees} />;
}
