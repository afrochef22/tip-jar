import React from "react";
import { Row, Col, FormGroup, Label, Input } from "reactstrap";
import style from "./CreditTipCalculation.module.css";

export default function HourlyCookInput({ cooks }) {
	return (
		<Row>
			<h2 className={style.title}>Enter Hours Worked</h2>
			<h3>Cooks</h3>

			{cooks.map((cook) => (
				<Col sm={4} key={cook.value}>
					<FormGroup row>
						<Label className={style.name} xs={6} sm={5}>
							{cook.label}
						</Label>
						<Label for="hours worked" xs={2} sm={3}>
							Hours Worked
						</Label>
						<Col xs={3} sm={4}>
							<Input
								name={`${cook.label} hours`}
								id="hours worked"
								type="tel"
								inputMode="numeric"
								pattern="[0-9]+(\.[0-9]{1,2}?"
								step="0.01"
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
