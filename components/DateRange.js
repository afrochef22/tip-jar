import { DateTime } from "luxon";

// Function to get the start date of the current bi-weekly payroll period
export const getStartDate = () => {
	// Get the current date
	const currentDate = DateTime.now();

	// Define the start date of the payroll period for the current year
	const payrollStartDate = DateTime.fromISO("2022-01-09");

	// Calculate the difference in weeks between the current date and the payroll start date
	const weeksSinceStart = Math.floor(
		currentDate.diff(payrollStartDate, "weeks").weeks
	);

	// Calculate the current payroll start date based on the difference in weeks
	const currentPayrollStartDate = payrollStartDate.plus({
		weeks: weeksSinceStart,
	});

	console.log(
		"current Payroll start date: ",
		currentPayrollStartDate.toISODate()
	);

	// Find the nearest Sunday on or after the current date
	let sunday = currentDate.startOf("week");
	console.log("intial: ", sunday.toISODate());

	console.log("payroll start date: ", payrollStartDate.toISODate());
	if (sunday > currentPayrollStartDate) {
		sunday = sunday.minus({ weeks: 1 });
	}

	// Calculate the weeks since the start of the current payroll period
	const weeksSincePayrollStart = Math.floor(
		sunday.diff(currentPayrollStartDate, "weeks").weeks
	);

	// Adjust the start date based on the number of weeks since the start of the current payroll period
	const startDate = currentPayrollStartDate.plus({
		weeks: weeksSincePayrollStart,
	});

	return currentPayrollStartDate.toISODate();
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
