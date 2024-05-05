import React from "react";
import { Row, Col, FormGroup, Label, Input } from "reactstrap";
import style from "./CreditTipCalculation.module.css";

export default function HourlyCookInput({ cooks }) {
	return (
		<Row className={style.container}>
			<h1>Cooks</h1>

			{cooks.map((cook) => (
				<Col sm={4} key={cook.id} className={style.employeeContainer}>
					<FormGroup row>
						<Label className={style.name} xs={12} sm={12}>
							{cook.label}
						</Label>
						<Label for="hoursWorked" xs={6} sm={6}>
							Hours Worked
						</Label>
						<Col xs={4} sm={4}>
							<Input
								name={`${cook.id}Hours`}
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
