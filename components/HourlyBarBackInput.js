import React from "react";
import { Row, Col, FormGroup, Label, Input } from "reactstrap";
import style from "./CreditTipCalculation.module.css";

export default function HourlyBarBackInput({ barBacks }) {
	return (
		<Row className={style.container}>
			<h1>Bar Backs</h1>

			{barBacks.map((barBack) => (
				<Col sm={4} key={barBack.id} className={style.employeeContainer}>
					<FormGroup row>
						<Label className={style.name} xs={12} sm={12}>
							{barBack.label}
						</Label>
						<Label for="hoursWorked" xs={6} sm={6}>
							Hours Worked
						</Label>
						<Col xs={3} sm={4}>
							<Input
								name={`${barBack.id}Hours`}
								id="hoursWorked"
								type="tel"
								inputMode="numeric"
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
