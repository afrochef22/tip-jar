import React, { useState } from "react";
import type { ChangeEvent } from "react";
import { Label, Input, Row, Col, Container, Button } from "reactstrap";
import { DateTime } from "luxon";
import { getPayrollDates } from "./DateRange";
import Link from "next/link";
import { money } from "../lib/money";
import { field } from "../lib/field";
import type { BreakdownSummary, PublicEmployeeWithTips } from "../types/models";

// Shared by the Dashboard carousel (variant="dashboard") and the standalone
// /CCTipsTotals page (variant="page"). The two only ever differed in the
// header above the table - which is kept as two explicit blocks below,
// each matching what that page already rendered - while every date
// calculation and the whole table are written once.
export default function TipsTotalsSpreadSheet({
	employees,
	allTipBreakdowns,
	variant = "dashboard",
}: {
	employees: PublicEmployeeWithTips[];
	allTipBreakdowns: BreakdownSummary[];
	variant?: "dashboard" | "page";
}) {
	const { startDate: start, endDate: end } = getPayrollDates();
	// toISODate() is only null for an invalid date; the pay periods are
	// counted from a fixed, valid start date.
	const [startDate, setStartDate] = useState(DateTime.fromISO(start!));
	const [endDate, setEndDate] = useState(DateTime.fromISO(end!));

	// Track the start and end dates of the pay period range separately from
	// startDate/endDate, which the manual date pickers (page variant) can
	// also move independently of the Previous/Next Pay Period buttons.
	const [payPeriodStartDate, setPayPeriodStartDate] = useState(startDate);
	const [payPeriodEndDate, setPayPeriodEndDate] = useState(endDate);

	// Tapping a row highlights it so it's easy to follow across the shows;
	// tapping it again (or another row) moves the highlight.
	const [highlightedId, setHighlightedId] = useState<string | null>(null);
	const toggleHighlight = (id: string) =>
		setHighlightedId((current) => (current === id ? null : id));

	const handleStartDateChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (!e.target.value) return; // ignore the input being cleared
		setStartDate(DateTime.fromISO(e.target.value));
	};

	const handleEndDateChange = (e: ChangeEvent<HTMLInputElement>) => {
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

	// "Thu 10/15" - the year is in the pay period row above the table.
	const formatDateStringWithDayOfWeek = (dateString: string) => {
		const date = parseDateWithFormats(dateString, dateFormats);
		return date ? date.toFormat("ccc M/d") : dateString;
	};

	function parseDateWithFormats(dateString: string, formats: string[]) {
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
			currentDate !== null &&
			currentDate >= startDate.startOf("day") &&
			currentDate <= endDate.endOf("day")
		);
	});

	uniqueDates.sort((a, b) => {
		const dateA = parseDateWithFormats(a, dateFormats);
		const dateB = parseDateWithFormats(b, dateFormats);
		return Number(dateA) - Number(dateB);
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

	const calculateTotalTips = (employee: PublicEmployeeWithTips) => {
		return employee.tipsCollected.reduce((total, tip) => {
			const tipDate = parseDateWithFormats(tip.date, dateFormats);
			if (
				tipDate !== null &&
				tipDate >= startDate.startOf("day") &&
				tipDate <= endDate.endOf("day")
			) {
				return total + Number(tip.amount);
			}
			return Number(total);
		}, 0);
	};

	// "10/11 - 10/24/2026", or with both years when the range crosses one.
	const sameYear = startDate.year === endDate.year;
	const dateRangeDisplay = `${startDate.toFormat(sameYear ? "M/d" : "M/d/yyyy")} - ${endDate.toFormat("M/d/yyyy")}`;
	const isPayPeriod =
		startDate.hasSame(payPeriodStartDate, "day") && endDate.hasSame(payPeriodEndDate, "day");

	const payPeriodNav = (
		<div className="pay-period-nav">
			<Button onClick={handlePreviousPayPeriod} aria-label="Previous pay period">
				‹ Prev
			</Button>
			<div className="pay-period-label">
				<div className="pay-period-title">{isPayPeriod ? "Pay period" : "Custom dates"}</div>
				<div className="pay-period-dates">{dateRangeDisplay}</div>
			</div>
			<Button onClick={handleNextPayPeriod} aria-label="Next pay period">
				Next ›
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
										// Breakdowns have no `id` field, so this is always undefined.
										.map((tip) => ({ id: field(tip, "id"), show: tip.show })) // Include both id and show in the array
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
							let showIdMap: Record<string, string> = {};
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
							<tr
								key={employee._id}
								className={`employee-row ${highlightedId === employee._id ? "row-highlighted" : ""}`}
								onClick={() => toggleHighlight(employee._id)}
								aria-selected={highlightedId === employee._id}
							>
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
					{payPeriodNav}
					<Row className="date-input-row custom-dates mb-4">
						<Col xs={12}>
							<div className="custom-dates-title">Or pick dates</div>
						</Col>
						<Col xs={6}>
							<Label for="startDate">From</Label>
							<Input
								id="startDate"
								name="startDate"
								placeholder="date placeholder"
								type="date"
								value={startDate.isValid ? startDate.toISODate() : ""}
								onChange={handleStartDateChange}
							/>
						</Col>
						<Col xs={6}>
							<Label for="endDate">To</Label>
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
					<h5 className="mt-2">
						<span className="pointer-only">Click</span>
						<span className="touch-only">Tap</span> on a band name to see more detail,
							or on a person to highlight their row
					</h5>
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
					{payPeriodNav}
					<h5>
						<span className="pointer-only">Click</span>
						<span className="touch-only">Tap</span> on a band name to see more
						detail or edit, or on a person to highlight their row
					</h5>
				</Row>
			</Container>
			{table}
		</div>
	);
}
