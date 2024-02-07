import React from "react";
import { Label, Input, Col, Row, FormGroup } from "reactstrap";
import style from "./CreditTipCalculation.module.css";

export function HourlyBarBackCashInput({ barBacks }) {
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
						<Col xs={3} sm={4}>
							<Input
								name={`${barBack.name}Hours`}
								id="hoursWorked"
								type="tel"
								inputMode="decimal"
								pattern="[0-9]+(\.[0-9]{1,2})?"
								step="0.01"
								required
								onInput={(e) => {
									e.preventDefault();
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

export function HourlyBartenderCashInput({ bartenders }) {
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
						<Col xs={3} sm={4}>
							<Input
								name={`${bartender.name}Hours`}
								id="hoursWorked"
								type="tel"
								inputMode="decimal"
								pattern="[0-9]+(\.[0-9]{1,2})?"
								step="0.01"
								required
								onInput={(e) => {
									e.preventDefault();
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
