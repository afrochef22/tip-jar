// MongoDB projections for tip breakdowns sent to the browser through
// getServerSideProps. Each breakdown embeds a full copy of every worker it
// paid, so loading whole documents for list pages sends far more than they show.

// Enough to detect duplicates and label spreadsheet columns.
export const BREAKDOWN_SUMMARY_FIELDS = { show: 1, date: 1, totalTips: 1 };

// What the breakdown cards display: totals plus each worker's name and payout.
export const BREAKDOWN_CARD_FIELDS = {
	show: 1,
	date: 1,
	totalTips: 1,
	totalBarSales: 1,
	"cookTips.id": 1,
	"cookTips.label": 1,
	"cookTips.tipOut": 1,
	"barBackTips.id": 1,
	"barBackTips.label": 1,
	"barBackTips.tipOut": 1,
	"BartenderTips.id": 1,
	"BartenderTips.label": 1,
	"BartenderTips.tipOut": 1,
};
