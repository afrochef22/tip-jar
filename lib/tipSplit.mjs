// Credit card tip split, shared by the new-breakdown page (TipBreakDown) and
// the edit modal (UpdateTipBreakDownModal). Pure so it can be tested:
//   node --test tests/
//
// Cooks get 15% of food sales. Bar backs get barBackPercentage of what's
// left. Bartenders get the rest. Within a role, tips are split evenly, or by
// tippedHours when anyone in that role has hours. Rounding leftovers go to
// bartenders. `random` picks which bartenders get the odd cents.
import { Decimal } from "decimal.js";

const COOK_SHARE = 0.15;

// Default odd-cent picker: varies from shift to shift but is the same for the
// same shift, so the server and browser render the same amounts (a fresh
// Math.random() on each side caused React hydration errors) and the numbers
// don't reshuffle on re-render.
const stableRandom = (key) => {
	let seed = 0;
	for (const ch of key) seed = (seed * 31 + ch.charCodeAt(0)) % 2147483647;
	seed = seed || 1;
	return () => (seed = (seed * 16807) % 2147483647) / 2147483647;
};

const sumHours = (people) =>
	people.map((p) => p.tippedHours || 0).reduce((acc, h) => acc + h, 0);

const perUnit = (pool, hours, count) => {
	const n = new Decimal(pool).div(hours === 0 ? count : hours).toNumber();
	return Number.isFinite(n) ? n : 0; // 0/0 when a group is empty
};

export function splitCreditTips(
	{ totalTips, foodSalesTotal, barBackPercentage, bartenders, barBacks, cooks },
	random = stableRandom(
		JSON.stringify([
			totalTips,
			bartenders.map((b) => [b.id, b.tippedHours || 0]),
		])
	)
) {
	const bartenderHours = sumHours(bartenders);
	const barBackHours = sumHours(barBacks);
	const cookHours = sumHours(cooks);

	const cooksTips = cooks.length === 0 ? 0 : foodSalesTotal * COOK_SHARE;
	const tipsPerCook = perUnit(cooksTips, cookHours, cooks.length);

	const barbackTips =
		barBacks.length === 0
			? 0
			: ((totalTips - cooksTips) * barBackPercentage) / 100;
	const tipsPerBarBack = perUnit(barbackTips, barBackHours, barBacks.length);

	const bartenderTips = totalTips - cooksTips - barbackTips;
	const tipsPerBartender = perUnit(
		bartenderTips,
		bartenderHours,
		bartenders.length
	);

	const bartendersWithTipOut = bartenders.map((bartender) => ({
		...bartender,
		tipOut:
			bartenderHours === 0
				? tipsPerBartender
				: tipsPerBartender * bartender.tippedHours,
	}));
	const barBacksWithTipOut = barBacks.map((barBack) => ({
		...barBack,
		tipOut: Number(
			(barBackHours === 0
				? tipsPerBarBack
				: tipsPerBarBack * barBack.tippedHours
			).toFixed(2)
		),
	}));
	const cooksWithTipOut = cooks.map((cook) => ({
		...cook,
		tipOut: Number(
			(cookHours === 0 ? tipsPerCook : tipsPerCook * cook.tippedHours).toFixed(2)
		),
	}));

	const total = (people) => people.reduce((acc, p) => acc + p.tipOut, 0);
	const totalTipOutBartenders = Number(total(bartendersWithTipOut).toFixed(2));
	const totalTipOutBarBacks = Number(total(barBacksWithTipOut).toFixed(2));
	const totalTipOutCooks = Number(total(cooksWithTipOut).toFixed(2));

	const totalTipOut =
		totalTipOutBartenders + totalTipOutBarBacks + totalTipOutCooks;
	const roundingDifference = Number((totalTips - totalTipOut).toFixed(2));
	const newTotalTipOutBartenders = totalTipOutBartenders + roundingDifference;

	const adjustmentAmountPerBartender = Number(
		(roundingDifference / bartendersWithTipOut.length).toFixed(2)
	);
	const adjustedBartenders = bartendersWithTipOut.map((bartender) => ({
		...bartender,
		tipOut: Number(
			(bartender.tipOut + adjustmentAmountPerBartender).toFixed(2)
		),
	}));

	// Hand out any cents still left over, one each to randomly chosen bartenders.
	const adjustedTotal = total(adjustedBartenders);
	if (adjustedTotal !== newTotalTipOutBartenders) {
		const remainingDifference = newTotalTipOutBartenders - adjustedTotal;
		if (remainingDifference <= 0.09 && remainingDifference >= -0.09) {
			const adjustedDifference = Number(remainingDifference.toFixed(2));
			const shuffledIndexes = adjustedBartenders.map((_, i) => i);
			for (let i = shuffledIndexes.length - 1; i > 0; i--) {
				const j = Math.floor(random() * (i + 1));
				[shuffledIndexes[i], shuffledIndexes[j]] = [
					shuffledIndexes[j],
					shuffledIndexes[i],
				];
			}
			const count = Math.floor(Math.abs(adjustedDifference) / 0.01);
			if (count > 0) {
				const adjustment = adjustedDifference > 0 ? 0.01 : -0.01;
				const done = new Set();
				for (let i = 0; i < count; i++) {
					const index = shuffledIndexes[i % shuffledIndexes.length];
					if (!done.has(index)) {
						adjustedBartenders[index].tipOut += adjustment;
						done.add(index);
					}
				}
			}
		}
	}
	adjustedBartenders.forEach((b) => {
		b.tipOut = Number(Number(b.tipOut).toFixed(2));
	});

	return {
		bartenders: adjustedBartenders,
		barBacks: barBacksWithTipOut,
		cooks: cooksWithTipOut,
		tipsPerBartender,
		tipsPerBarBack,
		tipsPerCook,
		totalTipOutBartenders: total(adjustedBartenders),
		// Set when the cooks' share is more than the credit tips, which leaves
		// the bartenders with a negative payout.
		warning:
			cooksTips > totalTips
				? `The cooks' 15% of food sales ($${cooksTips.toFixed(2)}) is more than the credit card tips ($${Number(totalTips).toFixed(2)}), so the bartenders come out negative. Check the tips and food sales before saving.`
				: null,
	};
}
