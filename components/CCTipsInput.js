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

		setInputValue(inputValue + value);
	};
	console.log(inputValue);
	const handleOpenPopup = (e) => {
		e.preventDefault();
		setIsPopupOpen(true);
	};
	const handleDeleteClicked = (e) => {
		e.preventDefault();
		setInputValue(inputValue.slice(0, -1));
	};
	const handleClrClicked = (e) => {
		e.preventDefault();
		setInputValue("");
	};
	const handleEqualsClicked = (e) => {
		e.preventDefault();

		try {
			const result = eval(inputValue); // Evaluate the expression

			// Check if there are any numbers with more than two decimal places
			const hasInvalidDecimal = inputValue.split("+").some((num) => {
				const decimalPart = num.split(".")[1];
				return decimalPart && decimalPart.length > 2;
			});

			if (hasInvalidDecimal) {
				// Alert the user that the input can only have two decimal places
				setAlertMessage("Numbers can only have up to two decimal places.");
				toggleModal(); // Open the modal to display the alert message
				setSubmitting(false);
				return;
			}
			const roundedResult = Math.round(result * 100) / 100; // Round to two decimal places
			setInputValue(roundedResult);
			const isValidInput = /^\d*\.?\d{0,2}$/.test(roundedResult);
			console.log("Is valid input:", isValidInput);
			if (isValidInput === false) {
				console.log("modal should pop up");
				setAlertMessage(
					"Please enter a valid number for the tips. The number can't have more than 2 decimal places."
				);
				toggleModal(); // Open the modal to display the alert message
				setSubmitting(false);
				return;
			}
		} catch (error) {
			setInputValue("Error"); // Display "Error" if there's an invalid expression
		}
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
