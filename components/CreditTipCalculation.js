import React, { useState, useEffect } from "react";
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
	const router = useRouter();
	const bartenders = workingEmployees.filter(
		(employee) => employee.workingPosition === "Bartender"
	);
	const barBacks = workingEmployees.filter(
		(employee) => employee.workingPosition === "Bar Back"
	);
	const cooks = workingEmployees.filter(
		(employee) => employee.workingPosition === "Cook"
	);

	const [barBackPercentage, setBarBackPercentage] = useState(0);
	const [foodSalesTotal, setFoodSalesTotal] = useState(0);
	const [employeeHours, setEmployeeHours] = useState([]);
	const [employeeTipCollected, setEmployeeTipCollected] = useState([]);

	const [isBartenderHoursClicked, setBartenderHoursClicked] = useState(false);
	const [isCookHoursClicked, setCookHoursClicked] = useState(false);
	const [isBarBackHoursClicked, setBarBackHoursClicked] = useState(false);

	useEffect(() => {
		if (
			barBackPercentage &&
			foodSalesTotal !== null &&
			employeeHours &&
			employeeTipCollected
		) {
			router.push({
				pathname: "/TipBreakDownPage",
				query: {
					bartenders: JSON.stringify(bartenders),
					barBacks: JSON.stringify(barBacks),
					cooks: JSON.stringify(cooks),
					barBackPercentage: JSON.stringify(barBackPercentage),
					foodSalesTotal: JSON.stringify(foodSalesTotal),
					employeeHours: JSON.stringify(employeeHours),
					employeeTipCollected: JSON.stringify(employeeTipCollected),
				},
			});
		}
	}, [barBackPercentage, foodSalesTotal, employeeHours, employeeTipCollected]);

	const handleCalculate = (e) => {
		console.log("in");
		e.preventDefault();
		const formData = new FormData(e.target); // Create a FormData object from the form
		const data = {};
		const employeeTips = {};
		const employeeHours = {};

		// Iterate through form data and convert it to a plain object
		formData.forEach((value, key) => {
			data[key] = value;

			const regexTips = /^([a-f\d]{24})Tips$/;
			const regexHours = /^([a-f\d]{24})Hours$/;
			const matchTips = key.match(regexTips);
			const matchHours = key.match(regexHours);

			if (matchTips && matchTips[1]) {
				const employeeID = matchTips[1];
				employeeTips[employeeID] = Number(value);
			}

			if (matchHours && matchHours[1]) {
				const employeeID = matchHours[1];
				employeeHours[employeeID] = Number(value);
			}
		});

		setBarBackPercentage(Number(formData.get("BarBackPercentage")));
		const foodSalesTotalValue = formData.get("FoodSalesTotal");

		setFoodSalesTotal(
			foodSalesTotalValue !== "" && foodSalesTotalValue !== undefined
				? Number(foodSalesTotalValue)
				: null
		);
		setEmployeeHours(employeeHours);
		setEmployeeTipCollected(employeeTips);
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
					<Row className={`${style.toggleSwitches}`}>
						<Col>
							{/* Switches Column */}
							{bartenders.length <= 1 ? (
								<div></div>
							) : (
								<FormGroup switch>
									<Input
										type="switch"
										role="switch"
										onChange={() => handleSwitchToggle("Bartender")}
										checked={isBartenderHoursClicked}
									/>
									<Label check>
										Toggle <span className="highlight-color">Bartender</span>{" "}
										tip out by hour
									</Label>
								</FormGroup>
							)}
							{barBacks.length <= 1 ? (
								<div></div>
							) : (
								<FormGroup switch>
									<Input
										type="switch"
										role="switch"
										onChange={() => handleSwitchToggle("Bar Back")}
										checked={isBarBackHoursClicked}
									/>
									<Label check>
										Toggle <span className="highlight-color">Bar Back</span> tip
										out by hour
									</Label>
								</FormGroup>
							)}
							{cooks.length <= 1 ? (
								<div></div>
							) : (
								<FormGroup switch>
									<Input
										type="switch"
										role="switch"
										onChange={() => handleSwitchToggle("Cook")}
										checked={isCookHoursClicked}
									/>
									<Label check>
										Toggle <span className="highlight-color">Cook</span> tip out
										by hour
									</Label>
								</FormGroup>
							)}
						</Col>
					</Row>
					<Row>
						<Col sm={2} xs={1}></Col>
						<Col sm={4}>
							{/* Bar Back Percentage and Input Column */}
							<Row className={`${style.formRow} `}>
								<Label
									sm={8}
									xs={8}
									className={style.formLabel}
									for="BarBackPercentage"
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
						{cooks.length === 0 ? (
							<div></div>
						) : (
							<Col sm={4}>
								<Row className={`${style.formRow} `}>
									<Label
										sm={8}
										xs={8}
										className={style.formLabel}
										for="FoodSalesTotal"
									>
										Enter Total Food Sales
									</Label>
									<Col sm={4} xs={4}>
										<Input
											id="FoodSalesTotal"
											name="FoodSalesTotal"
											type="tel"
											inputMode="numeric"
											pattern="[0-9]+(\.[0-9]{1,2})?"
											step="0.01"
											defaultValue={0}
										/>
									</Col>
								</Row>
							</Col>
						)}
						<Col sm={2} xs={1}></Col>
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
