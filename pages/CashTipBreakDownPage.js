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
