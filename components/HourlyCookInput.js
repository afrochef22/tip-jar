import React from "react";
import { Row, Col, FormGroup, Label, Input } from "reactstrap";
import style from "./CreditTipCalculation.module.css";

export default function HourlyCookInput({ cooks }) {
	return (
		<Row>
			<h2 className={style.title}>Enter Hours Worked</h2>
			<h3>Cooks</h3>

			{cooks.map((cook) => (
				<Col sm={4} key={cook.id}>
					<FormGroup row>
						<Label className={style.name} xs={6} sm={5}>
							{cook.label}
						</Label>
						<Label for="hoursWorked" xs={2} sm={3}>
							Hours Worked
						</Label>
						<Col xs={3} sm={4}>
							<Input
								name={`${cook.id}Hours`}
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

						<div className={style.seperationLine}></div>
					</FormGroup>
				</Col>
			))}
			<div className={style.positionSeperationLine}></div>
		</Row>
	);
}
