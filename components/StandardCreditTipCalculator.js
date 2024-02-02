import React from "react";
import { Row, Col, FormGroup, Label, Input } from "reactstrap";
import style from "./CreditTipCalculation.module.css";

export default function StandardCreditTipCalculator({ bartenders }) {
	return (
		<Row>
			{bartenders.map((bartender) => (
				<Col sm={4} key={bartender.value}>
					<FormGroup row>
						<Label className={style.name} xs={6} sm={5}>
							{bartender.label}
						</Label>

						<Col xs={4} sm={8}>
							<Label xs={4} sm={4}>
								Tips Collected
							</Label>
							<Input
								name={bartender.label}
								required
								type="text"
								pattern="[0-9]+(\.[0-9]{1,2}?"
								step="0.01"
							/>
						</Col>
						<div className={style.seperationLine}></div>
					</FormGroup>
				</Col>
			))}
		</Row>
	);
}
