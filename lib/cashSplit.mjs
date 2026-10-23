// Cash tip split for the cash calculator (CashTipBreakDown). Pure so it can be
// tested:
//   node --test tests/
//
// Cash is paid in whole dollars, no coins. Bar backs' share is
// barBackPercentage of the tips; bartenders split the rest, rounded down to
// whole dollars (evenly, or by hours when anyone has hours), so bartenders on
// an even split always get the same amount. Everything left over, dollars and
// cents, goes to the bar backs. With no bar back working, the leftover is
// returned as `leftover` for the manager to hand out.
//
// All math is done in cents to avoid floating point drift.

const toCents = (n) => Math.round((Number(n) || 0) * 100);
const hoursOf = (p) => parseFloat(p.hours) || 0;
const sum = (list) => list.reduce((acc, n) => acc + n, 0);

// Splits `cents` across people in whole dollars: evenly, or by hours when the
// group has hours. Returns each person's cents, rounded down to the dollar.
const wholeDollars = (cents, people) => {
	const totalHours = sum(people.map(hoursOf));
	return people.map((p) => {
		const share = totalHours === 0 ? cents / people.length : (cents * hoursOf(p)) / totalHours;
		return Math.floor(share / 100 + 1e-9) * 100;
	});
};

export function splitCashTips({ tipsCollected, barBackPercentage, bartenders, barBacks }) {
	const tips = toCents(tipsCollected);
	const barBackPool = barBacks.length === 0 ? 0 : Math.round((tips * barBackPercentage) / 100);
	const bartenderPool = tips - barBackPool;

	const bartenderCents = bartenders.length === 0 ? [] : wholeDollars(bartenderPool, bartenders);
	let left = tips - sum(bartenderCents);

	let barBackCents = [];
	if (barBacks.length > 0) {
		// Bar backs split everything that's left in whole dollars; the spare
		// dollars go one each to the bar backs with the most hours (or the first
		// listed), and any cents to the first of those.
		barBackCents = wholeDollars(left, barBacks);
		let spare = left - sum(barBackCents);
		const order = barBacks
			.map((p, i) => i)
			.sort((a, b) => hoursOf(barBacks[b]) - hoursOf(barBacks[a]));
		for (let k = 0; spare >= 100; k = (k + 1) % order.length) {
			barBackCents[order[k]] += 100;
			spare -= 100;
		}
		barBackCents[order[0]] += spare;
		left = 0;
	}

	const bartenderHours = sum(bartenders.map(hoursOf));
	const barBackHours = sum(barBacks.map(hoursOf));
	const dollars = (c) => c / 100;
	return {
		bartenders: bartenders.map((p, i) => ({ ...p, tipOut: dollars(bartenderCents[i]) })),
		barBacks: barBacks.map((p, i) => ({ ...p, tipOut: dollars(barBackCents[i]) })),
		// Shown as "Tips per hour" when splitting by hours.
		tipsPerBartender: bartenderHours === 0 ? 0 : dollars(bartenderPool) / bartenderHours,
		tipsPerBarBack: barBackHours === 0 ? 0 : dollars(tips - sum(bartenderCents)) / barBackHours,
		leftover: dollars(left),
	};
}
