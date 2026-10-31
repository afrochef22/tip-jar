import React from "react";
import { useRouter } from "next/router";

import CashTipBreakDown from "../components/CashTipBreakDown";
import { fromQuery } from "../lib/json";
import type { CashWorker } from "../components/CashTipForm";

export default function CashTipBreakDownPage() {
	const router = useRouter();
	const {
		numberOfBarBacks,
		numberOfBartenders,
		tipsCollected,
		barBacks,
		bartenders,
		barBackPercentage,
		isBartenderHoursClicked,
		isBarBackHoursClicked,
	} = router.query;

	// router.query is empty on the very first client render before Next.js
	// has parsed the URL, which would otherwise seed CashTipBreakDown (and the
	// edit modal's initial state) with NaN/[] for one frame.
	if (!router.isReady) return null;

	const parsedBartenders = bartenders ? fromQuery<CashWorker[]>(bartenders) : [];
	const parsedBarBacks = barBacks ? fromQuery<CashWorker[]>(barBacks) : [];
	// parseFloat turns its argument into a string first; String() does that here.
	const parsedTipsCollected = parseFloat(String(tipsCollected));
	const parsedNumberOfBartenders = parseFloat(String(numberOfBartenders));
	const parsedNumberOfBarBacks = parseFloat(String(numberOfBarBacks));
	const parsedBarBackPercentage = parseFloat(String(barBackPercentage));

	return (
		<CashTipBreakDown
			numberOfBarBacks={parsedNumberOfBarBacks}
			numberOfBartenders={parsedNumberOfBartenders}
			tipsCollected={parsedTipsCollected}
			barBacks={parsedBarBacks}
			bartenders={parsedBartenders}
			barBackPercentage={parsedBarBackPercentage}
			isBartenderHoursClicked={isBartenderHoursClicked}
			isBarBackHoursClicked={isBarBackHoursClicked}
		/>
	);
}
