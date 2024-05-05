import React, { useState } from "react";
import { Row, Col, FormGroup, Label, Input, Button } from "reactstrap";
import style from "./CreditTipCalculation.module.css";

export default function StandardCreditTipCalculator({ employees, position }) {
	return (
		<>
			<Row className={style.container}>
				<h1>{position}</h1>
				{employees.map((employee) => (
					<Col sm={4} key={employee.id}>
						{/* <FormGroup row> */}
						<div className={style.name} xs={12} sm={12}>
							{employee.label}
						</div>
						{/* <Col xs={12} sm={12}>
								<Row>
									<Col>
										<Label for="tipsCollected">Tips Collected</Label>
									</Col>
									<Col>
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
							</Col> */}
						{/* </FormGroup> */}
					</Col>
				))}
			</Row>
		</>
	);
}
