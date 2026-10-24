// Formats a dollar amount for display: 6601.5 -> "6,601.50". The "$" is added
// by the caller. Bad or missing values show as 0.00.
export const money = (value) =>
	(Number(value) || 0).toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

// Tips as a percent of bar sales: 1200, 6000 -> "20.0%". Null when there are
// no bar sales to divide by, so callers can leave the line out.
export const tipPercent = (tips, barSales) => {
	const sales = Number(barSales);
	if (!(sales > 0)) return null;
	return `${(((Number(tips) || 0) / sales) * 100).toFixed(1)}%`;
};
