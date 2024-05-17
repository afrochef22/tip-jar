import React, { useState } from "react";
import { Label, Input, Col, Row, FormGroup } from "reactstrap";
import style from "./CreditTipCalculation.module.css";

export function HourlyBarBackCashInput({
	barBacks,
	updateBarBacks,
	isBarBackHoursClicked,
}) {
	const [clickedInputs, setClickedInputs] = useState({});
	const handleBarBackHoursWorkedChange = (barBackName, hoursWorked) => {
		console.log("hoursWorked", hoursWorked);

		// const isValidInput = /^\d+(\.\d{1,2})?$/.test(hoursWorked);
		// if (!isValidInput) {
		// 	alert("Please enter a valid number with up to two decimal places.");
		// 	return;
		// }
		// Find the index of the barback with the matching name
		const index = barBacks.findIndex((barBack) => barBack.name === barBackName);

		if (index !== -1) {
			// Update the hours worked for the bartender at the found index
			updateBarBacks((prevBarBacks) => {
				console.log(prevBarBacks);
				const updatedBarBacks = [...prevBarBacks];
				updatedBarBacks[index] = {
					...updatedBarBacks[index],
					hours: hoursWorked,
				};
				return updatedBarBacks;
			});
		}
	};
	const handleInputClick = (bartenderName) => {
		setClickedInputs((prevClickedInputs) => ({
			...prevClickedInputs,
			[bartenderName]: true,
		}));
	};
	return (
		<Row className={style.cashHourlyContainer}>
			<h1>Bar Backs</h1>

			{barBacks.map((barBack) => (
				<Col sm={3} key={barBack.name} className={style.employeeContainer}>
					<FormGroup row>
						<Label className={style.name} xs={12} sm={12}>
							{barBack.name}
						</Label>
						<Label for="hoursWorked" xs={6} sm={6}>
							Hours Worked
						</Label>
						<Col xs={4} sm={5}>
							<Input
								name={`${barBack.name}Hours`}
								id="hoursWorked"
								type="tel"
								inputMode="decimal"
								pattern="[0-9]+(\.[0-9]{1,2})?"
								step="0.01"
								required
								placeholder={clickedInputs[barBack.name] ? "" : barBack.hours}
								onChange={(e) => {
									handleBarBackHoursWorkedChange(barBack.name, e.target.value);
								}}
								onClick={() => handleInputClick(barBack.name)}
								// onInput={(e) => {
								// 	e.preventDefault();
								// 	const inputValue = e.target.value;
								// 	const isValidInput = /^\d*\.?\d{0,2}$/.test(inputValue);

								// 	if (!isValidInput) {
								// 		e.target.setCustomValidity("Please enter a valid number.");
								// 	} else {
								// 		e.target.setCustomValidity("");
								// 	}
								// }}
							></Input>
						</Col>
					</FormGroup>
				</Col>
			))}
		</Row>
	);
}

export function HourlyBartenderCashInput({
	bartenders,
	updateBartenders,
	isBartenderHoursClicked,
}) {
	const [clickedInputs, setClickedInputs] = useState({});

	const handleBartenderHoursWorkedChange = (bartenderName, hoursWorked) => {
		// Find the index of the bartender with the matching name
		const index = bartenders.findIndex(
			(bartender) => bartender.name === bartenderName
		);

		if (index !== -1) {
			// Update the hours worked for the bartender at the found index
			updateBartenders((prevBartenders) => {
				const updatedBartenders = [...prevBartenders];
				updatedBartenders[index] = {
					...updatedBartenders[index],
					hours: hoursWorked,
				};
				return updatedBartenders;
			});
		}
	};
	const handleInputClick = (bartenderName) => {
		setClickedInputs((prevClickedInputs) => ({
			...prevClickedInputs,
			[bartenderName]: true,
		}));
	};
	return (
		<Row className={style.cashHourlyContainer}>
			<h1>Bartender</h1>

			{bartenders.map((bartender) => (
				<Col sm={3} key={bartender.name} className={style.employeeContainer}>
					<FormGroup row>
						<Label className={style.name} xs={12} sm={12}>
							{bartender.name}
						</Label>
						<Label for="hoursWorked" xs={6} sm={6}>
							Hours Worked
						</Label>
						<Col xs={4} sm={5}>
							<Input
								name={`${bartender.name}Hours`}
								id="hoursWorked"
								type="tel"
								inputMode="decimal"
								pattern="[0-9]+(\.[0-9]{1,2})?"
								step="0.01"
								required
								placeholder={
									clickedInputs[bartender.name] ? "" : bartender.hours
								}
								onClick={() => handleInputClick(bartender.name)}
								onChange={(e) =>
									handleBartenderHoursWorkedChange(
										bartender.name,
										e.target.value
									)
								}
								onInput={(e) => {
									const inputValue = e.target.value;
									const isValidInput = /^\d*\.?\d{0,2}$/.test(inputValue);

									if (!isValidInput) {
										e.target.setCustomValidity("Please enter a valid number.");
									} else {
										e.target.setCustomValidity("");
									}
								}}
							></Input>
						</Col>
					</FormGroup>
				</Col>
			))}
		</Row>
	);
}
