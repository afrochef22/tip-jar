// Formats a dollar amount for display: 6601.5 -> "6,601.50". The "$" is added
// by the caller. Bad or missing values show as 0.00.
export const money = (value) =>
	(Number(value) || 0).toLocaleString("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});
