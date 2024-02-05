import React from "react";
import { Row, Col, FormGroup, Label, Input } from "reactstrap";
import style from "./CreditTipCalculation.module.css";

export default function StandardCreditTipCalculator({ bartenders }) {
	return (
		<Row>
			{bartenders.map((bartender) => (
				<Col sm={4} key={bartender.id}>
					<FormGroup row>
						<Label className={style.name} xs={6} sm={5}>
							{bartender.label}
						</Label>

						<Col xs={4} sm={8}>
							<Label for="tipdCollected" xs={4} sm={4}>
								Tips Collected
							</Label>
							<Input
								name={`${bartender.id}Tips`}
								id="tipsCollected"
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
							/>
						</Col>
						<div className={style.seperationLine}></div>
					</FormGroup>
				</Col>
			))}
		</Row>
	);
}
