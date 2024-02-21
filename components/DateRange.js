import { DateTime } from "luxon";

// Function to get the start date of the current bi-weekly payroll period
export const getStartDate = () => {
	// Get the current date
	const currentDate = DateTime.now();

	// Define the start date of the payroll period for the current year
	const payrollStartDate = DateTime.fromISO("2022-01-09");
	// Find the nearest Sunday on or after the current date
	let sunday = currentDate.startOf("week");
	if (sunday < payrollStartDate) {
		sunday = sunday.plus({ weeks: 1 });
	}

	// Calculate the weeks since the start of the payroll period
	const weeksSinceStart = Math.floor(
		sunday.diff(payrollStartDate, "weeks").weeks
	);

	// Adjust the start date based on the number of weeks since the start of the payroll period
	const startDate = payrollStartDate.plus({ weeks: weeksSinceStart });

	return startDate.toISODate();
};

// Function to get the end date of the current bi-weekly payroll period
export const getEndDate = (startDate) => {
	// Parse the start date string
	const parsedStartDate = DateTime.fromISO(startDate);

	// Calculate the end date as two weeks after the start date
	const endDate = parsedStartDate.plus({ weeks: 2 }).minus({ days: 1 });

	return endDate.toISODate();
};

// Usage example
const startDate = getStartDate();
const endDate = getEndDate(startDate);

console.log("Start Date:", startDate);
console.log("End Date:", endDate);
