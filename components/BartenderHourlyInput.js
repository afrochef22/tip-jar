import React from "react";
import { Row, Col, FormGroup, Label, Input } from "reactstrap";
import style from "./CreditTipCalculation.module.css";
export default function BartenderHourlyInput({ bartenders }) {
	return (
		<Row className={style.container}>
			<h1>Bartenders</h1>
			{bartenders.map((bartender) => (
				<Col sm={4} key={bartender.id} className={style.employeeContainer}>
					<FormGroup row>
						<Label className={style.name} xs={5} sm={5}>
							{bartender.label}
						</Label>
						<Label for="hoursWorked" xs={3} sm={3}>
							Hours Worked
						</Label>
						<Col xs={4} sm={4}>
							<Input
								name={`${bartender.id}Hours`}
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
						<Label for="tipsCollected" xs={6} sm={6}>
							Tips Collected
						</Label>

						<Col xs={6} sm={6}>
							<Input
								name={`${bartender.id}Tips`}
								id="tipsCollected"
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
							/>
						</Col>
					</FormGroup>
				</Col>
			))}
		</Row>
	);
}
