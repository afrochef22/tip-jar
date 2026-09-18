import React from "react";
import { useRouter } from "next/router";

import CashTipBreakDown from "../components/CashTipBreakDown";

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
	console.log(
		"CashTipBreakDownPage barBackHoursClicked",
		isBarBackHoursClicked,
		"CashTipBreakDownPage barBackHoursClicked",
		isBarBackHoursClicked
	);

	// router.query is empty on the very first client render before Next.js
	// has parsed the URL, which would otherwise seed CashTipBreakDown (and the
	// edit modal's initial state) with NaN/[] for one frame.
	if (!router.isReady) return null;

	const parsedBartenders = bartenders ? JSON.parse(bartenders) : [];
	const parsedBarBacks = barBacks ? JSON.parse(barBacks) : [];
	const parsedTipsCollected = parseFloat(tipsCollected);
	const parsedNumberOfBartenders = parseFloat(numberOfBartenders);
	const parsedNumberOfBarBacks = parseFloat(numberOfBarBacks);
	const parsedBarBackPercentage = parseFloat(barBackPercentage);

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
