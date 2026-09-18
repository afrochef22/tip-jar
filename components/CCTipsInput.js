import React, { useState } from "react";
import { Row, Col, FormGroup, Label, Input, Button } from "reactstrap";
import style from "./CreditTipCalculation.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faCalculator,
	faDeleteLeft,
	faEraser,
} from "@fortawesome/free-solid-svg-icons";

export default function CCTipsInput({
	setSubmitting,
	setAlertMessage,
	toggleModal,
}) {
	const [isPopupOpen, setIsPopupOpen] = useState(false);
	const [inputValue, setInputValue] = useState("");

	const handleButtonClicked = (value, e) => {
		e.preventDefault();

		setInputValue(String(inputValue) + String(value));
	};
	const handleOpenPopup = (e) => {
		e.preventDefault();
		setIsPopupOpen(true);
	};
	const handleDeleteClicked = (e) => {
		e.preventDefault();
		setInputValue(String(inputValue).slice(0, -1));
	};
	const handleClrClicked = (e) => {
		e.preventDefault();
		setInputValue("");
	};
	const handleEqualsClicked = (e) => {
		e.preventDefault();

		// The input is only ever digits, "." and "+", so sum the terms directly.
		const terms = String(inputValue)
			.split("+")
			.map((t) => t.trim())
			.filter((t) => t !== "");

		if (terms.length === 0) return;

		const invalid = terms.some((t) => t === "." || !/^\d*\.?\d{0,2}$/.test(t));
		if (invalid) {
			setAlertMessage("Numbers can only have up to two decimal places.");
			toggleModal();
			setSubmitting(false);
			return;
		}

		const totalCents = terms.reduce(
			(sum, t) => sum + Math.round(Number(t) * 100),
			0
		);
		setInputValue((totalCents / 100).toFixed(2));
	};

	return (
		<>
			<Row className={style.container}>
				<Col sm={4} className={style.employeeContainer}>
					<FormGroup row>
						<Label className={style.name} xs={12} sm={12}>
							Enter Tips
						</Label>
						<p>
							Enter the total tip amount manually, or use the calculator buttons
							to add the tips together. Click the equal sign to calculate the
							total tip amount.
						</p>
						<Col xs={12} sm={12}>
							<Row>
								<Col>
									<textarea
										readOnly
										className={`${style.inputField} mb-3`}
										name={`totalTips`}
										id="tipsCollected"
										pattern="[0-9]+(\.[0-9]{1,2})?"
										step="0.01"
										required
										value={inputValue}
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

									<div id="popup" className={style.calculator}>
										<button
											onClick={(e) => handleButtonClicked(1, e)}
											className={`${style.number} ${style.calculatorButton}`}
										>
											1
										</button>
										<button
											onClick={(e) => handleButtonClicked(2, e)}
											className={`${style.number} ${style.calculatorButton}`}
										>
											2
										</button>
										<button
											onClick={(e) => handleButtonClicked(3, e)}
											className={`${style.number} ${style.calculatorButton}`}
										>
											3
										</button>
										<button
											onClick={(e) => handleButtonClicked(4, e)}
											className={`${style.number} ${style.calculatorButton}`}
										>
											4
										</button>
										<button
											onClick={(e) => handleButtonClicked(5, e)}
											className={`${style.number} ${style.calculatorButton}`}
										>
											5
										</button>
										<button
											onClick={(e) => handleButtonClicked(6, e)}
											className={`${style.number} ${style.calculatorButton}`}
										>
											6
										</button>
										<button
											onClick={(e) => handleButtonClicked(7, e)}
											className={`${style.number} ${style.calculatorButton}`}
										>
											7
										</button>
										<button
											onClick={(e) => handleButtonClicked(8, e)}
											className={`${style.number} ${style.calculatorButton}`}
										>
											8
										</button>
										<button
											onClick={(e) => handleButtonClicked(9, e)}
											className={`${style.number} ${style.calculatorButton}`}
										>
											9
										</button>
										<button
											onClick={(e) => handleButtonClicked(0, e)}
											className={`${style.number} ${style.calculatorButton}`}
										>
											0
										</button>
										<button
											onClick={(e) => handleButtonClicked(".", e)}
											className={`${style.operator} ${style.calculatorButton}`}
										>
											.
										</button>
										<button
											onClick={(e) => handleButtonClicked("+", e)}
											className={` ${style.calculatorButton}`}
										>
											+
										</button>
										<button
											onClick={handleClrClicked}
											className={` ${style.calculatorButton}`}
										>
											clear{/* <FontAwesomeIcon icon={faEraser} /> */}
										</button>
										<button
											onClick={handleDeleteClicked}
											className={`${style.operator} ${style.calculatorButton}`}
										>
											<FontAwesomeIcon icon={faDeleteLeft} />
										</button>
										<button
											onClick={handleEqualsClicked}
											className={` ${style.calculatorButton}`}
										>
											=
										</button>
									</div>
								</Col>
							</Row>
						</Col>
					</FormGroup>
				</Col>
			</Row>
		</>
	);
}
