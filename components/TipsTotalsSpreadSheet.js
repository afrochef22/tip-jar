import React, { useState } from "react";
import { Label, Input, Row, Col, Container, Button } from "reactstrap";
import { DateTime } from "luxon";
import { getPayrollDates } from "./DateRange";
import Link from "next/link";
import { money } from "../lib/money";

// Shared by the Dashboard carousel (variant="dashboard") and the standalone
// /CCTipsTotals page (variant="page"). The two only ever differed in the
// header above the table - which is kept as two explicit blocks below,
// each matching what that page already rendered - while every date
// calculation and the whole table are written once.
export default function TipsTotalsSpreadSheet({
	employees,
	allTipBreakdowns,
	variant = "dashboard",
}) {
	const { startDate: start, endDate: end } = getPayrollDates();
	const [startDate, setStartDate] = useState(DateTime.fromISO(start));
	const [endDate, setEndDate] = useState(DateTime.fromISO(end));

	// Track the start and end dates of the pay period range separately from
	// startDate/endDate, which the manual date pickers (page variant) can
	// also move independently of the Previous/Next Pay Period buttons.
	const [payPeriodStartDate, setPayPeriodStartDate] = useState(startDate);
	const [payPeriodEndDate, setPayPeriodEndDate] = useState(endDate);

	const handleStartDateChange = (e) => {
		if (!e.target.value) return; // ignore the input being cleared
		setStartDate(DateTime.fromISO(e.target.value));
	};

	const handleEndDateChange = (e) => {
		if (!e.target.value) return;
		setEndDate(DateTime.fromISO(e.target.value));
	};

	const handlePreviousPayPeriod = () => {
		const previousStartDate = payPeriodStartDate.minus({ weeks: 2 });
		const previousEndDate = payPeriodEndDate.minus({ weeks: 2 });
		setStartDate(previousStartDate);
		setEndDate(previousEndDate);
		setPayPeriodStartDate(previousStartDate);
		setPayPeriodEndDate(previousEndDate);
	};

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
				if (!tipDate || !tipDate.isValid) return false;
				// Ensure startDate and endDate are valid before using them
				if (!startDate || !endDate) return false;

				// Compare the parsed tip date with the start and end dates
				return (
					tipDate >= startDate.startOf("day") && tipDate <= endDate.endOf("day")
				);
			})
		);
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

	const dateRangeDisplay = (
		<>
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
		</>
	);

	const payPeriodNav = (
		<div className="d-flex justify-content-between align-items-center mt-3">
			<Button size="sm" onClick={handlePreviousPayPeriod}>
				Previous Pay Period
			</Button>
			<Row>
				<h3>Pay Period: </h3>
				<h5 className="m-2">{dateRangeDisplay}</h5>
			</Row>
			<Button size="sm" onClick={handleNextPayPeriod}>
				Next Pay Period
			</Button>
		</div>
	);

	const table = (
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
								<th
									className="band-date"
									key={`date-${date}`}
									colSpan={uniqueShows.length}
								>
									{formatDateStringWithDayOfWeek(date)}
								</th>
							);
						})}
						<th className="employeeTipsCol" rowSpan={2}>
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
								.filter(
									(tip) => tip.date === date && uniqueShows.includes(tip.show)
								)
								.forEach((tip) => {
									showIdMap[tip.show] = tip._id;
								});

							return uniqueShows.map((show, index) => (
								<th className="lastBand table-hover" key={`show-${date}-${index}`}>
									<Link
										className="noDecoration band-name"
										title={show}
										href={{
											pathname: `/getSelectedTipBreakDown/${showIdMap[show]}`,
										}}
									>
										<span className="band-name-text">{show}</span>
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
										// Someone who worked two positions in one show (e.g. bar
										// back and bartender) has two tips here; show their sum.
										const tipsForDateAndShow = employee.tipsCollected.filter(
											(tip) => tip.date === date && tip.show === show
										);
										const cellTotal = tipsForDateAndShow.reduce(
											(total, tip) => total + Number(tip.amount),
											0
										);
										return (
											<td key={`${date}-${show}-${index}`}>
												{tipsForDateAndShow.length > 0 ? cellTotal.toFixed(2) : ""}
											</td>
										);
									});
								})}
								<td className=" bold-text">
									${money(calculateTotalTips(employee))}
								</td>
							</tr>
						);
					})}
				</tbody>
				<tfoot>
					<tr>
						<td className="employee-column bold-text">Total Tips</td>
						{uniqueDates.map((date) => {
							const total = employeesWithTipsInRange.reduce((acc, employee) => {
								const tipsForDate = employee.tipsCollected.filter(
									(tip) => tip.date === date
								);
								const totalAmountForDate = tipsForDate.reduce(
									(total, tip) => total + Number(Number(tip.amount).toFixed(2)),
									0
								);
								return acc + totalAmountForDate;
							}, 0);
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
									${money(total)}
								</td>
							);
						})}
						<td className=" bold-text">
							{/* Total for the "Total Tips" column */}$
							{money(
								employeesWithTipsInRange.reduce(
									(acc, employee) =>
										Number(acc) + Number(calculateTotalTips(employee).toFixed(2)),
									0
								)
							)}
						</td>
					</tr>
				</tfoot>
			</table>
		</Container>
	);

	if (variant === "page") {
		return (
			<div className=" employeeTipsPage ">
				<Container className="">
					<h2 className="mt-5">Credit Card Tips Spreadsheet</h2>
					<Row className="date-input-row mt-5 mb-4">
						<Col lg={3} md={4} sm={5} xs={6}>
							<Label for="startDate">
								<h6>Select Start Date</h6>
							</Label>
							<Input
								id="startDate"
								name="startDate"
								placeholder="date placeholder"
								type="date"
								value={startDate.isValid ? startDate.toISODate() : ""}
								onChange={handleStartDateChange}
							/>
						</Col>
						<Col lg={3} md={3} sm={5} xs={6}>
							<Label for="endDate">
								<h6>Select End Date</h6>
							</Label>
							<Input
								id="endDate"
								name="endDate"
								placeholder="date placeholder"
								type="date"
								value={endDate.isValid ? endDate.toISODate() : ""}
								onChange={handleEndDateChange}
							/>
						</Col>
					</Row>
					<h3>Current Date Range: </h3>
					<h5 className="m-2">{dateRangeDisplay}</h5>
				</Container>
				<Container>
					<Row className="date-input-row mt-4 mb-4 ">{payPeriodNav}</Row>
					<h5 className="mt-4">Click on a band name to see more detail</h5>
				</Container>
				{table}
			</div>
		);
	}

	return (
		<div
			id="tipsSpreadsheet"
			className=" employeeTipsPage employeeTipsBackGroundColor "
		>
			<Container>
				<Row className="date-input-row mt-5 mb-4 ">
					<h2 className="payPeriodContainer">Pay Period Spreadsheet</h2>
					<h5>Click on a band name to see more detail or edit</h5>
					{payPeriodNav}
				</Row>
			</Container>
			{table}
		</div>
	);
}
