import { parse } from "path";
import React from "react";

export default function TipBreakDown({
	bartenders,
	barBacks,
	cooks,
	barBackPercentage,
	foodSalesTotal,
	employeeHours,
	employeeTipCollected,
}) {
	const totalTipsCollected = Object.values(employeeTipCollected).reduce(
		(acc, tips) => acc + tips
	);
	const cooksTips = cooks.length === 0 ? 0 : (foodSalesTotal * 0.15).toFixed(2);

	const tipsPerCook = parseFloat(cooksTips / cooks.length).toFixed(2);

	const barbackTips =
		barBacks.length === 0
			? 0
			: (((totalTipsCollected - cooksTips) * barBackPercentage) / 100).toFixed(
					2
			  );

	const tipsPerBarBack = parseFloat(barbackTips / barBacks.length).toFixed(2);

	const bartenderTips = (totalTipsCollected - cooksTips - barbackTips).toFixed(
		2
	);

	const tipsPerBartender = (bartenderTips / bartenders.length).toFixed(2);

	console.log(barbackTips);
	return (
		<div className="front-page">
			<h1>total tips {totalTipsCollected}</h1>
			<h2>food sales {foodSalesTotal}</h2>
			<h3> bar back % {barBackPercentage}</h3>
			<h3>Tips Per Cook {tipsPerCook}</h3>
			{cooks.map((cook) => (
				<div>{cook.label}</div>
			))}
			<h3>Tips Per Bar Back {tipsPerBarBack}</h3>
			{barBacks.map((barBack) => (
				<div>{barBack.label}</div>
			))}
			<h3>bartender tips {tipsPerBartender}</h3>
			{bartenders.map((bartender) => (
				<div>{bartender.label}</div>
			))}
		</div>
	);
}
