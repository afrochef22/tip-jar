import React, { useState, useEffect } from "react";
import clientPromise from "../lib/mongodb";
import {
	FormGroup,
	Label,
	Input,
	Row,
	Col,
	Container,
	Table,
} from "reactstrap";
import { DateTime } from "luxon";
import { getStartDate, getEndDate } from "../components/DateRange";
import Link from "next/link";
import { useRouter } from "next/router";
import TipBreakDown from "../components/TipBreakDown";

export default function CCTipsTotals({ employees, allTipBreakdowns }) {
	const router = useRouter();
	// Define the start and end dates for the date range (replace these with your actual start and end dates)
	const start = getStartDate();
	const end = getEndDate(start);
	const [startDate, setStartDate] = useState(DateTime.fromISO(start));
	const [endDate, setEndDate] = useState(DateTime.fromISO(end));

	const handleStartDateChange = (e) => {
		setStartDate(DateTime.fromISO(e.target.value));
	};

	const handleEndDateChange = (e) => {
		setEndDate(DateTime.fromISO(e.target.value));
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

	return (
		<div className=" employeeTipsPage ">
			<Container className="">
				<Row className="date-input-row mt-5 mb-4">
					<Col lg={3} md={4} sm={5} xs={6}>
						<Label for="startDate">Select Start Date</Label>
						<Input
							id="startDate"
							name="startDate"
							placeholder="date placeholder"
							type="date"
							onChange={handleStartDateChange}
						/>
					</Col>
					<Col lg={3} md={3} sm={5} xs={6}>
						<Label for="endDate">Select End Date</Label>
						<Input
							id="endDate"
							name="endDate"
							placeholder="date placeholder"
							type="date"
							onChange={handleEndDateChange}
						/>
					</Col>
				</Row>
				<h3>Current Date Range: </h3>
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
			</Container>

			<Container className=" table-scroll mt-4 border-box ">
				<table bordered className="table ">
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
										{date}
									</th>
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
		</div>
	);
}

export async function getServerSideProps() {
	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		const allTipBreakdowns = await db
			.collection("tipBreakdown")
			.find({})

			.toArray();
		// console.log(allTipBreakdowns);

		const employees = await db
			.collection("employees")
			.find({})

			.toArray();

		return {
			props: {
				allTipBreakdowns: JSON.parse(JSON.stringify(allTipBreakdowns)),
				employees: JSON.parse(JSON.stringify(employees)),
			},
		};
	} catch (err) {
		console.error(err);
	}
}
