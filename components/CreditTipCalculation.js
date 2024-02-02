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
					<Row>
						<div className={style.hourlyContainer}>
							<Col>
								<Row className={style.messageContainer}>
									Toggle the switch next to the position that has an employee
									cut early.
								</Row>
								<Row className={style.toggleSwitches}>
									<Col>
										<FormGroup switch>
											<Input
												type="switch"
												role="switch"
												onChange={() => handleSwitchToggle("Bartender")}
												checked={isBartenderHoursClicked}
											/>
											<Label check>Bartender</Label>
										</FormGroup>
									</Col>
									<Col>
										<FormGroup switch>
											<Input
												type="switch"
												role="switch"
												onChange={() => handleSwitchToggle("Bar Back")}
												checked={isBarBackHoursClicked}
											/>
											<Label check>Bar Back</Label>
										</FormGroup>
									</Col>
									<Col>
										<FormGroup switch>
											<Input
												type="switch"
												role="switch"
												onChange={() => handleSwitchToggle("Cook")}
												checked={isCookHoursClicked}
											/>
											<Label check>Cook</Label>
										</FormGroup>
									</Col>
								</Row>
							</Col>
						</div>
						<Col>
							<Row className={`${style.formRow} `}>
								<Label
									sm={6}
									xs={8}
									className={style.formLabel}
									for="foodSalesTotal"
								>
									Enter Total Food Sales
								</Label>
								<Col sm={4} xs={4}>
									<Input
										id="foodSalesTotal"
										name="Food Sales Total"
										type="number"
									/>
								</Col>
							</Row>
						</Col>
					</Row>
					<h2 className={style.title}>Enter Tips Collected</h2>
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
