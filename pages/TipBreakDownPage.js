import React from "react";
import { useRouter } from "next/router";
import TipBreakDown from "../components/TipBreakDown";

export default function creditTipCalculationPage() {
	const router = useRouter();
	const {
		bartenders,
		barBacks,
		cooks,
		barBackPercentage,
		foodSalesTotal,
		employeeHours,
		employeeTipCollected,
	} = router.query;
	console.log(barBackPercentage, foodSalesTotal, employeeTipCollected);
	const parsedBartenders = bartenders ? JSON.parse(bartenders) : [];
	const parsedBarBacks = barBacks ? JSON.parse(barBacks) : [];
	const parsedCooks = cooks ? JSON.parse(cooks) : [];
	const parsedBarBackPercentage = parseFloat(barBackPercentage);
	const parsedFoodSalesTotal = parseFloat(foodSalesTotal);
	const parsedEmployeeHours = employeeHours ? JSON.parse(employeeHours) : [];
	const parsedEmployeeTipCollected = employeeTipCollected
		? JSON.parse(employeeTipCollected)
		: [];

	console.log("Parsed Values:", {
		parsedBartenders,
		parsedBarBacks,
		parsedCooks,
		parsedBarBackPercentage,
		parsedFoodSalesTotal,
		parsedEmployeeHours,
		parsedEmployeeTipCollected,
	});

	return (
		<TipBreakDown
			bartenders={parsedBartenders}
			barBacks={parsedBarBacks}
			cooks={parsedCooks}
			barBackPercentage={parsedBarBackPercentage}
			foodSalesTotal={parsedFoodSalesTotal}
			employeeHours={parsedEmployeeHours}
			employeeTipCollected={parsedEmployeeTipCollected}
		/>
	);
}
