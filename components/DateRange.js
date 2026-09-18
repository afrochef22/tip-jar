import { DateTime } from "luxon";

const VENUE_TIME_ZONE = "America/Los_Angeles";

// Function to get the start date of the current bi-weekly payroll period
export const getPayrollDates = () => {
	// Define the start date of the payroll period
	let payrollStartDate = DateTime.fromISO("2022-01-09", { zone: VENUE_TIME_ZONE });

	// Anchor "now" to the venue's timezone so the boundary between pay
	// periods doesn't shift depending on whether this runs on the server
	// (UTC) or in a browser in a different timezone.
	const currentDate = DateTime.now().setZone(VENUE_TIME_ZONE);

	// Calculate the end date of the current payroll period
	let payrollEndDate = payrollStartDate.plus({ weeks: 2 }).minus({ days: 1 });

	// Check if the current date is after the end of the current payroll period
	if (currentDate > payrollEndDate) {
		// Move the start date to the next payroll period
		const weeksSinceLastPayroll = Math.floor(
			currentDate.diff(payrollStartDate, "weeks").weeks
		);

		const weeksToAdd = Math.ceil((weeksSinceLastPayroll - 1) / 2) * 2; // Round up to the next even number of weeks
		payrollStartDate = payrollStartDate.plus({ weeks: weeksToAdd });
		payrollEndDate = payrollStartDate.plus({ weeks: 2 }).minus({ days: 1 });
	}

	return {
		startDate: payrollStartDate.toISODate(),
		endDate: payrollEndDate.toISODate(),
	};
};

