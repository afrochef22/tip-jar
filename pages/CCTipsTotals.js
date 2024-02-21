import React, { useState } from "react";
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

export default function CCTipsTotals({ employees, allTipBreakdowns }) {
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

	const uniqueDates = [
		...new Set(allTipBreakdowns.map((tip) => tip.date)),
	].filter((date) => {
		const currentDate = DateTime.fromFormat(date, "MM/dd/yyyy");
		return (
			currentDate >= startDate.startOf("day") &&
			currentDate <= endDate.endOf("day")
		);
	});

	// Filter employees with tips within the date range
	const employeesWithTipsInRange = employees.filter((employee) => {
		return employee.tipsCollected.some((tip) => {
			// Parse the tip date string into a Luxon DateTime object
			const tipDate = DateTime.fromFormat(tip.date, "MM/dd/yyyy");

			// Ensure that tipDate is valid before comparison
			if (!tipDate.isValid) return false;

			// Ensure startDate and endDate are valid before using them
			if (!startDate || !endDate) return false;

			// Compare the parsed tip date with the start and end dates
			return (
				tipDate >= startDate.startOf("day") && tipDate <= endDate.endOf("day")
			);
		});
	});

	const calculateTotalTips = (employee) => {
		return employee.tipsCollected.reduce((total, tip) => {
			const tipDate = DateTime.fromFormat(tip.date, "MM/dd/yyyy");
			if (
				tipDate >= startDate.startOf("day") &&
				tipDate <= endDate.endOf("day")
			) {
				return total + tip.amount;
			}
			return total;
		}, 0);
	};

	return (
		<div className=" background-color">
			<Container>
				<h1>Employee Tips Totals</h1>
				<h4>
					Date Range:{" "}
					{startDate.toLocaleString({
						month: "2-digit",
						day: "2-digit",
						year: "numeric",
					})}{" "}
					to{" "}
					{endDate.toLocaleString({
						month: "2-digit",
						day: "2-digit",
						year: "numeric",
					})}
				</h4>
			</Container>
			<Container>
				<Row>
					<Col lg={2} md={3} sm={5} xs={6}>
						<Label for="startDate">Start</Label>
						<Input
							id="startDate"
							name="startDate"
							placeholder="date placeholder"
							type="date"
							onChange={handleStartDateChange}
						/>
					</Col>
					<Col lg={2} md={3} sm={5} xs={6}>
						<Label for="endDate">End</Label>
						<Input
							id="endDate"
							name="endDate"
							placeholder="date placeholder"
							type="date"
							onChange={handleEndDateChange}
						/>
					</Col>
				</Row>
			</Container>

			<Container className="table-scroll table-container">
				<table bordered className="table">
					<thead className="sticky-row">
						<tr>
							<th className="employee-column sticky-row">Date</th>
							{uniqueDates.map((date) => {
								// Get unique shows for the current date
								const uniqueShows = [
									...new Set(
										allTipBreakdowns
											.filter((tip) => tip.date === date)
											.map((tip) => tip.show)
									),
								];
								return (
									<th key={`date-${date}`} colSpan={uniqueShows.length}>
										{date}
									</th>
								);
							})}
							<th>Total Tips</th>
						</tr>
						<tr>
							<th className="employee-column">Name</th>
							{uniqueDates.map((date) => {
								// Get unique shows for the current date
								const uniqueShows = [
									...new Set(
										allTipBreakdowns
											.filter((tip) => tip.date === date)
											.map((tip) => tip.show)
									),
								];
								return uniqueShows.map((show, index) => (
									<th key={`show-${date}-${index}`}>
										{show.length > 10 ? show.substring(0, 8) + "..." : show}
									</th>
								));
							})}
							<th></th>
						</tr>
					</thead>
					<tbody className="scorllableContainer">
						{employeesWithTipsInRange.map((employee) => {
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
													{tipForDateAndShow ? tipForDateAndShow.amount : ""}
												</td>
											);
										});
									})}
									<td>{calculateTotalTips(employee).toFixed(2)}</td>
								</tr>
							);
						})}
					</tbody>
					<tfoot>
						<tr>
							<td className="employee-column">Total</td>
							{uniqueDates.map((date) => {
								const total = employeesWithTipsInRange.reduce(
									(acc, employee) => {
										const tipsForDate = employee.tipsCollected.filter(
											(tip) => tip.date === date
										);
										const totalAmountForDate = tipsForDate.reduce(
											(total, tip) => total + tip.amount,
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
									<td key={`total-${date}`} colSpan={uniqueShowsCount}>
										${total.toFixed(2)}
									</td>
								);
							})}
							<td>
								{/* Total for the "Total Tips" column */}$
								{employeesWithTipsInRange
									.reduce(
										(acc, employee) => acc + calculateTotalTips(employee),
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
			.sort()
			.limit(20)
			.toArray();
		console.log(allTipBreakdowns);

		const employees = await db
			.collection("employees")
			.find({})
			.sort()
			.limit(20)
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