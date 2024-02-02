import React from "react";
import { Row, Col, FormGroup, Label, Input } from "reactstrap";
import style from "./CreditTipCalculation.module.css";
export default function BartenderHourlyInput({ bartenders }) {
	return (
		<Row>
			{bartenders.map((bartender) => (
				<Col sm={4} key={bartender.value}>
					<FormGroup row>
						<Label className={style.name} xs={12} sm={5}>
							{bartender.label}
						</Label>
						<Label xs={2} sm={3}>
							Hours Worked
						</Label>
						<Col xs={3} sm={4}>
							<Input
								name="hours worked"
								required
								type="text"
								pattern="[0-9]+(\.[0-9]{1,2}?"
								step="0.01"
							></Input>
						</Col>
						<Label xs={4} sm={4}>
							Tips Collected
						</Label>

						<Col xs={3} sm={8}>
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
