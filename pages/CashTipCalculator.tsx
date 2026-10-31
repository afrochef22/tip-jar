import React from "react";
import { useRouter } from "next/router";
import CashTipForm, { showCashBreakdown } from "../components/CashTipForm";
import form from "../components/CreditTipForm.module.css";

export default function CashTipCalculator() {
	const router = useRouter();

	return (
		<div className={form.page}>
			<h1 className={form.pageTitle}>Cash Tip Calculator</h1>
			<CashTipForm
				submitLabel="Calculate →"
				onSubmit={(values) => showCashBreakdown(router, values)}
			/>
		</div>
	);
}
