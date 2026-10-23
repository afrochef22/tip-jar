import React from "react";
import { Row, Col, FormGroup, Label, Input } from "reactstrap";
import style from "./CreditTipCalculation.module.css";

export default function CCTipsInput() {
	return (
		<Row className={style.container}>
			<Col sm={4} className={style.employeeContainer}>
				<FormGroup row>
					<Label className={style.name} xs={12} sm={12} for="tipsCollected">
						Enter Tips
					</Label>
					<p>Enter the total credit card tip amount.</p>
					<Col xs={12} sm={12}>
						{/* The form reads this by name and validates it on submit. */}
						<Input
							id="tipsCollected"
							name="totalTips"
							type="tel"
							inputMode="decimal"
							pattern="[0-9]+(\.[0-9]{1,2})?"
							step="0.01"
							placeholder="0.00"
							required
						/>
					</Col>
				</FormGroup>
			</Col>
		</Row>
	);
}
