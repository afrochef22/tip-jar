import React from "react";
import { Row, Col, FormGroup, Label, Input } from "reactstrap";
import style from "./CreditTipCalculation.module.css";

export default function StandardCreditTipCalculator({ bartenders }) {
	return (
		<Row className={style.container}>
			{bartenders.map((bartender) => (
				<Col sm={3} key={bartender.id} className={style.employeeContainer}>
					<FormGroup row>
						<Label className={style.name} xs={12} sm={12}>
							{bartender.label}
						</Label>

						<Col xs={12} sm={12}>
							<Row>
								<Col>
									<Label for="tipsCollected" xs={12} sm={12}>
										Tips Collected
									</Label>
								</Col>
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
												e.target.setCustomValidity(
													"Please enter a valid number."
												);
											} else {
												e.target.setCustomValidity("");
											}
										}}
									/>
								</Col>
							</Row>
						</Col>
					</FormGroup>
				</Col>
			))}
		</Row>
	);
}
