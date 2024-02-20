import { DateTime } from "luxon";

// Function to get the start date of the current bi-weekly payroll period
export const getStartDate = () => {
	// Get the current date
	const currentDate = DateTime.now();

	// Find the nearest Sunday before or equal to the current date
	const sunday = currentDate.startOf("week").plus({ days: 6 });

	// Check if the current date is on or after the start of the current payroll period
	const currentPayrollStart = DateTime.fromISO("2024-02-18"); // Assuming the current payroll starts on 2/18/2024
	const weeksSinceStart = Math.floor(
		sunday.diff(currentPayrollStart, "weeks").weeks
	);

	// Adjust the start date to align with the current payroll period
	const startDate = currentPayrollStart.plus({ weeks: weeksSinceStart * 2 });

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
