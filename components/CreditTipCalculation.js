import React, { useState } from "react";
import {
	Button,
	Form,
	FormGroup,
	Label,
	Input,
	Col,
	Container,
	Row,
} from "reactstrap";
import style from "./CreditTipCalculation.module.css";
import { useRouter } from "next/router";

import StandardCreditTipCalculator from "./StandardCreditTipCalculator";
import BartenderHourlyInput from "./BartenderHourlyInput";
import HourlyBarBackInput from "./HourlyBarBackInput";
import HourlyCookInput from "./HourlyCookInput";

export default function CreditTipCalculation({ workingEmployees }) {
	const bartenders = workingEmployees.filter(
		(employee) => employee.workingPosition === "Bartender"
	);
	const barBacks = workingEmployees.filter(
		(employee) => employee.workingPosition === "Bar Back"
	);
	const cooks = workingEmployees.filter(
		(employee) => employee.workingPosition === "Cook"
	);

	const router = useRouter();

	const [isBartenderHoursClicked, setBartenderHoursClicked] = useState(false);
	const [isCookHoursClicked, setCookHoursClicked] = useState(false);
	const [isBarBackHoursClicked, setBarBackHoursClicked] = useState(false);

	const handleCalculate = (e) => {
		e.preventDefault(); // Prevent the default form submission behavior
		const formData = new FormData(e.target); // Create a FormData object from the form
		const data = {};

		// Iterate through form data and convert it to a plain object
		formData.forEach((value, key) => {
			data[key] = value;
		});

		console.log(data);
		// Here, 'data' will contain the values entered in the form fields.
		// You can now handle or submit this data as needed.
	};

	const handleSwitchToggle = (position) => {
		switch (position) {
			case "Bartender":
				setBartenderHoursClicked(!isBartenderHoursClicked);
				break;
			case "Cook":
				setCookHoursClicked(!isCookHoursClicked);
				break;
			case "Bar Back":
				setBarBackHoursClicked(!isBarBackHoursClicked);
				break;
			default:
				break;
		}
	};

	const handleBackButtonClick = () => {
		// Redirect to the TipCalculationPage and pass workingEmployees as a query parameter
		router.push({
			pathname: "/SelectWorkingEmployee", // Adjust the pathname based on your file structure
		});
	};

	return (
		<div className={style.backgroundColor}>
			<Container>
				<Form onSubmit={handleCalculate}>
					<Row className={`${style.toggleSwitches} justify-content-center`}>
						<Col sm={4}>
							{/* Switches Column */}
							<FormGroup switch>
								<Input
									type="switch"
									role="switch"
									onChange={() => handleSwitchToggle("Bartender")}
									checked={isBartenderHoursClicked}
								/>
								<Label check>Toggle Bartender tip out by hour</Label>
							</FormGroup>
							<FormGroup switch>
								<Input
									type="switch"
									role="switch"
									onChange={() => handleSwitchToggle("Bar Back")}
									checked={isBarBackHoursClicked}
								/>
								<Label check>Toggle Bar Back tip out by hour</Label>
							</FormGroup>
							<FormGroup switch>
								<Input
									type="switch"
									role="switch"
									onChange={() => handleSwitchToggle("Cook")}
									checked={isCookHoursClicked}
								/>
								<Label check>Toggle Cook tip out by hour</Label>
							</FormGroup>
						</Col>
						<Col sm={4}>
							{/* Bar Back Percentage and Input Column */}
							<Row className={`${style.formRow} `}>
								<Label
									sm={8}
									xs={8}
									className={style.formLabel}
									for="Food Sales Total"
								>
									Bar Back Percentage
								</Label>
								<Col sm={3} xs={4}>
									<Input
										id="BarBackPercentage"
										name="BarBackPercentage"
										type="tel"
										inputMode="numeric"
										defaultValue={15}
									/>
								</Col>
							</Row>
						</Col>
						<Col sm={4}>
							<Row className={`${style.formRow} `}>
								<Label
									sm={8}
									xs={8}
									className={style.formLabel}
									for="Food Sales Total"
								>
									Enter Total Food Sales
								</Label>
								<Col sm={4} xs={4}>
									<Input
										id="food Sales Total"
										name="Food Sales Total"
										type="tel"
										inputMode="numeric"
										pattern="[0-9]+(\.[0-9]{1,2}?"
										step="0.01"
									/>
								</Col>
							</Row>
						</Col>
						<div className={style.positionSeperationLine}></div>
					</Row>
					{isCookHoursClicked === false ? (
						<div></div>
					) : (
						<HourlyCookInput cooks={cooks} />
					)}
					{isBarBackHoursClicked === false ? (
						<div></div>
					) : (
						<HourlyBarBackInput barBacks={barBacks} />
					)}
					{isBartenderHoursClicked === false ? (
						<StandardCreditTipCalculator bartenders={bartenders} />
					) : (
						<BartenderHourlyInput bartenders={bartenders} />
					)}
					<div className={style.centerButtonContainer}>
						<Button
							className={`${style.centerButton} ${style.backButton}`}
							onClick={handleBackButtonClick}
						>
							Back
						</Button>
						<Button
							className={`${style.centerButton} ${style.calculateButton}`}
							type="submit"
						>
							Calculate
						</Button>
					</div>
				</Form>
			</Container>
		</div>
	);
}
