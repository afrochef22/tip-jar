import React, { useState } from "react";
import clientPromise from "../lib/mongodb";
import { FormGroup, Label, Input, Button } from "reactstrap";
import { DateTime } from "luxon";
import { getStartDate, getEndDate } from "../components/DateRange";

export default function CCTipsTotals({ employees, allTipBreakdowns }) {
	// Define the start and end dates for the date range (replace these with your actual start and end dates)
	const start = getStartDate();
	const end = getEndDate(start);
	console.log("Start Date:", start);
	console.log("End Date:", end);
	const [startDate, setStartDate] = useState();
	const [endDate, setEndDate] = useState();

	const handleStartDateChange = (e) => {
		setStartDate(DateTime.fromISO(e.target.value));
	};

	const handleEndDateChange = (e) => {
		setEndDate(DateTime.fromISO(e.target.value));
	};

	const handleDateSubmit = (e) => {
		e.preventDefault();
		console.log("Start Date:", startDate.toISODate());
		console.log("End Date:", endDate.toISODate());
	};

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

	return (
		<div>
			<h1>Employee Tips Totals</h1>
			<div>Date Range</div>
			<form onSubmit={handleDateSubmit}>
				<FormGroup>
					<Label for="startDate">Start</Label>
					<Input
						id="startDate"
						name="startDate"
						placeholder="date placeholder"
						type="date"
						value=""
						onChange={handleStartDateChange}
					/>
					<Label for="endDate">End</Label>
					<Input
						id="endDate"
						name="endDate"
						placeholder="date placeholder"
						type="date"
						onChange={handleEndDateChange}
					/>
					<Button type="submit">Set</Button>
				</FormGroup>
			</form>
			{employeesWithTipsInRange.map((employee) => {
				return (
					<div key={employee._id}>
						<h2>{`${employee.firstName} ${employee.lastName}`}</h2>
						<ul>
							{employee.tipsCollected.map((tip) => {
								// Find the corresponding tip breakdown for the employee's tip
								const tipBreakdown = allTipBreakdowns.find(
									(tipBreakdown) => tipBreakdown._id === tip.tipBreakdownId
								);
								return (
									<li key={tip._id}>
										Date: {tip.date}, Amount: {tip.amount}, Working Position:{" "}
										{tip.workingPosition}, Show: {tip.show}
									</li>
								);
							})}
						</ul>
					</div>
				);
			})}
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
