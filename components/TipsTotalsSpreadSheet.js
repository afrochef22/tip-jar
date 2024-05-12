import React, { useState, useEffect } from "react";
import {
	FormGroup,
	Label,
	Input,
	Row,
	Col,
	Container,
	Table,
	Button,
} from "reactstrap";
import { DateTime } from "luxon";
import {
	getStartDate,
	getEndDate,
	getPayrollDates,
} from "../components/DateRange";
import Link from "next/link";
import { useRouter } from "next/router";
import TipBreakDown from "../components/TipBreakDown";

export default function TipsTotalsSpreadSheet({ employees, allTipBreakdowns }) {
	const router = useRouter();
	// Define the start and end dates for the date range (replace these with your actual start and end dates)

	const { startDate: start, endDate: end } = getPayrollDates();
	const [startDate, setStartDate] = useState(DateTime.fromISO(start));
	const [endDate, setEndDate] = useState(DateTime.fromISO(end));

	// Define state variables to track the start and end dates of the pay period range
	const [payPeriodStartDate, setPayPeriodStartDate] = useState(startDate);
	const [payPeriodEndDate, setPayPeriodEndDate] = useState(endDate);

	// Function to handle previous pay period
	const handlePreviousPayPeriod = () => {
		const previousStartDate = payPeriodStartDate.minus({ weeks: 2 });
		const previousEndDate = payPeriodEndDate.minus({ weeks: 2 });
		setStartDate(previousStartDate);
		setEndDate(previousEndDate);
		setPayPeriodStartDate(previousStartDate);
		setPayPeriodEndDate(previousEndDate);
	};

	// Function to handle next pay period
	const handleNextPayPeriod = () => {
		const nextStartDate = payPeriodStartDate.plus({ weeks: 2 });
		const nextEndDate = payPeriodEndDate.plus({ weeks: 2 });
		setStartDate(nextStartDate);
		setEndDate(nextEndDate);
		setPayPeriodStartDate(nextStartDate);
		setPayPeriodEndDate(nextEndDate);
	};

	const formatDateStringWithDayOfWeek = (dateString) => {
		const date = new Date(dateString);
		const options = { weekday: "long" }; // Specify the format for the day of the week
		return (
			<>
				{date.toLocaleDateString(undefined, options)}
				<br />
				{date.toLocaleDateString()}
			</>
		);
	};

	function parseDateWithFormats(dateString, formats) {
		for (const format of formats) {
			const parsed = DateTime.fromFormat(dateString, format);
			if (parsed.isValid) {
				return parsed;
			}
		}
		return null; // Return null if none of the formats match
	}
	const dateFormats = ["M/d/yyyy", "MM/dd/yyyy", "MM/d/yyyy"];

	const uniqueDates = [
		...new Set(allTipBreakdowns.map((tip) => tip.date)),
	].filter((date) => {
		// Check if the date is not null before parsing it
		if (!date) return false; // Skip null dates
		const currentDate = parseDateWithFormats(date, dateFormats);
		return (
			currentDate >= startDate.startOf("day") &&
			currentDate <= endDate.endOf("day")
		);
	});

	uniqueDates.sort((a, b) => {
		const dateA = parseDateWithFormats(a, dateFormats);
		const dateB = parseDateWithFormats(b, dateFormats);
		return dateA - dateB;
	});

	// Filter employees with tips within the date range
	const employeesWithTipsInRange = employees.filter((employee) => {
		return (
			employee.tipsCollected &&
			employee.tipsCollected.some((tip) => {
				// Parse the tip date string into a Luxon DateTime object
				const tipDate = parseDateWithFormats(tip.date, dateFormats);

				// Ensure that tipDate is valid before comparison
				if (!tipDate.isValid) return false;

				// Ensure startDate and endDate are valid before using them
				if (!startDate || !endDate) return false;

				// Compare the parsed tip date with the start and end dates
				return (
					tipDate >= startDate.startOf("day") && tipDate <= endDate.endOf("day")
				);
			})
		);
	});

	employeesWithTipsInRange.forEach((obj) => {
		if (Array.isArray(obj.tipsCollected)) {
			obj.tipsCollected.forEach((nestedObj) => {
				if ("amount" in nestedObj) {
					nestedObj.amount = Number(nestedObj.amount);
				}
			});
		}
	});
	let sortedEmployees = employeesWithTipsInRange.sort((a, b) => {
		const firstNameA = a.lastName;
		const firstNameB = b.lastName;

		return firstNameA.localeCompare(firstNameB);
	});

	const calculateTotalTips = (employee) => {
		return employee.tipsCollected.reduce((total, tip) => {
			const tipDate = parseDateWithFormats(tip.date, dateFormats);
			if (
				tipDate >= startDate.startOf("day") &&
				tipDate <= endDate.endOf("day")
			) {
				return total + Number(tip.amount);
			}
			return Number(total);
		}, 0);
	};
	const scrollAllTipBreakDowns = () => {
		const tipsSpreadsheet = document.getElementById("allTipBreakDowns");
		tipsSpreadsheet.scrollIntoView({ behavior: "smooth" });
	};
	return (
		<div
			id="tipsSpreadsheet"
			className=" employeeTipsPage employeeTipsBackGroundColor "
		>
			<Container>
				<Row className="date-input-row mt-5 mb-4 ">
					<h2 className="payPeriodContainer">Pay Period Spreadsheet</h2>
					<h5>Click on a band name to see more detail or edit</h5>

					<div className="d-flex justify-content-between align-items-center mt-3">
						<Button size="sm" onClick={handlePreviousPayPeriod}>
							Previous Pay Period
						</Button>
						<h5 className="m-2">
							{startDate.toLocaleString({
								month: "2-digit",
								day: "2-digit",
								year: "numeric",
							})}
							{"  "}-{"  "}
							{endDate.toLocaleString({
								month: "2-digit",
								day: "2-digit",
								year: "numeric",
							})}
						</h5>
						<Button size="sm" onClick={handleNextPayPeriod}>
							Next Pay Period
						</Button>
					</div>
				</Row>
			</Container>

			<Container className=" table-scroll mt-4 border-box ">
				<table className="table ">
					<thead className="sticky-header">
						<tr>
							<th className="employee-column sticky-row text-color">Date</th>
							{uniqueDates.map((date) => {
								// Get unique shows for the current date
								const uniqueShows = [
									...new Set(
										allTipBreakdowns
											.filter((tip) => tip.date === date)
											.map((tip) => ({ id: tip.id, show: tip.show })) // Include both id and show in the array
											.map((tip) => tip.show) // Extract only the show name
									),
								];
								return (
									<>
										<th
											className="band-date"
											key={`date-${date}`}
											colSpan={uniqueShows.length}
										>
											{formatDateStringWithDayOfWeek(date)}
										</th>
									</>
								);
							})}
							<th className="employeeTipsCol" colSpan={2} rowSpan={2}>
								Employee Total Tips
							</th>
						</tr>
						<tr>
							<th className="employee-column">Name</th>
							{uniqueDates.map((date) => {
								// Get unique shows for the current date
								const uniqueShows = [
									...new Set(
										allTipBreakdowns
											.filter((tip) => tip.date === date)
											.map((tip) => ({ id: tip._id, show: tip.show })) // Include both id and show in the array
											.map((tip) => tip.show) // Extract only the show name
									),
								];
								// Create an object to map each show name to its corresponding ID
								let showIdMap = {};
								allTipBreakdowns
									.filter((tip) => uniqueShows.includes(tip.show))
									.forEach((tip) => {
										showIdMap[tip.show] = tip._id;
									});

								return uniqueShows.map((show, index) => (
									<th
										className="lastBand table-hover"
										key={`show-${date}-${index}`}
									>
										{}
										<Link
											// onClick={handleLink(showIdMap[show])}
											className="noDecoration band-name"
											href={{
												pathname: `/getSelectedTipBreakDown/${showIdMap[show]}`,
											}}
										>
											{show.length > 10 ? show.substring(0, 8) + "..." : show}
										</Link>
									</th>
								));
							})}
						</tr>
					</thead>
					<tbody className="scorllableContainer">
						{sortedEmployees.map((employee) => {
							return (
								<tr key={employee._id}>
									<td className="employee-column">{`${employee.firstName} ${employee.lastName}`}</td>
									{uniqueDates.map((date) => {
										// Get unique shows for the current date
										const uniqueShows = [
											...new Set(
												allTipBreakdowns
													.filter((tip) => tip.date === date)
													.map((tip) => tip.show)
											),
										];
										return uniqueShows.map((show, index) => {
											const tipForDateAndShow = employee.tipsCollected.find(
												(tip) => tip.date === date && tip.show === show
											);
											return (
												<td key={`${date}-${show}-${index}`}>
													{tipForDateAndShow
														? tipForDateAndShow.amount.toFixed(2)
														: ""}
												</td>
											);
										});
									})}
									<td className=" bold-text">
										${calculateTotalTips(employee).toFixed(2)}
									</td>
								</tr>
							);
						})}
					</tbody>
					<tfoot>
						<tr>
							<td className="employee-column bold-text">Total Tips</td>
							{uniqueDates.map((date) => {
								const total = employeesWithTipsInRange.reduce(
									(acc, employee) => {
										const tipsForDate = employee.tipsCollected.filter(
											(tip) => tip.date === date
										);
										const totalAmountForDate = tipsForDate.reduce(
											(total, tip) => total + Number(tip.amount.toFixed(2)),
											0
										);
										return acc + totalAmountForDate;
									},
									0
								);
								// Get the number of unique shows for the current date
								const uniqueShowsCount = new Set(
									allTipBreakdowns
										.filter((tip) => tip.date === date)
										.map((tip) => tip.show)
								).size;
								return (
									<td
										className="totals bold-text"
										key={`total-${date}`}
										colSpan={uniqueShowsCount}
									>
										${total.toFixed(2)}
									</td>
								);
							})}
							<td className=" bold-text">
								{/* Total for the "Total Tips" column */}$
								{employeesWithTipsInRange
									.reduce(
										(acc, employee) =>
											Number(acc) +
											Number(calculateTotalTips(employee).toFixed(2)),
										0
									)
									.toFixed(2)}
							</td>
						</tr>
					</tfoot>
				</table>
			</Container>
			<Row className="justify-content-center mt-4 ">
				<Col xs="auto">
					<Button onClick={scrollAllTipBreakDowns}>
						Scroll Up to Tip Breakdowns
					</Button>
				</Col>
			</Row>
		</div>
	);
}
