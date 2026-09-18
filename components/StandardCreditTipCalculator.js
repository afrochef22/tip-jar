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
						<div className={style.name} xs={12} sm={12}>
							{employee.label}
						</div>
					</Col>
				))}
			</Row>
		</>
	);
}
