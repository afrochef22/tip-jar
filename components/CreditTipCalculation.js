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
	Spinner,
} from "reactstrap";
import style from "./CreditTipCalculation.module.css";
import { useRouter } from "next/router";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CustomAlertModal } from "./ConformationDialog";

import StandardCreditTipCalculator from "./StandardCreditTipCalculator";
import BartenderHourlyInput from "./BartenderHourlyInput";
import HourlyBarBackInput from "./HourlyBarBackInput";
import HourlyCookInput from "./HourlyCookInput";
import CCTipsInput from "./CCTipsInput";

export default function CreditTipCalculation({
	workingEmployees,
	selectedShow,
}) {
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");

	const toggleModal = () => setIsOpen(!isOpen);

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
	const [totalTips, setTotalTips] = useState(0);
	const [isBartenderHoursClicked, setBartenderHoursClicked] = useState(false);
	const [isCookHoursClicked, setCookHoursClicked] = useState(false);
	const [isBarBackHoursClicked, setBarBackHoursClicked] = useState(false);
	const [totalBarSales, setTotalBarSales] = useState(0);
	const [shiftNotes, setShiftNotes] = useState("");

	useEffect(() => {
		if (
			barBackPercentage &&
			foodSalesTotal !== null &&
			employeeHours &&
			employeeTipCollected &&
			totalTips
		) {
			const bartendersWithHoursAndTip = bartenders.map((bartender) => {
				const id = bartender.id;
				const tippedHours = employeeHours[id] || 0; // Get hours for the current bartender
				const tipsBroughtIn = employeeTipCollected[id];
				return { ...bartender, tippedHours, tipsBroughtIn };
			});
			const barBacksWithHours = barBacks.map((barBack) => {
				const id = barBack.id;
				const tippedHours = employeeHours[id] || 0; // Get hours for the current barBack
				return { ...barBack, tippedHours };
			});
			const cooksWithHours = cooks.map((cook) => {
				const id = cook.id;
				const tippedHours = employeeHours[id] || 0; // Get hours for the current cook
				return { ...cook, tippedHours };
			});

			console.log("total bar sales", totalBarSales);
			console.log("shift notes", shiftNotes);
			router.push({
				pathname: "/TipBreakDownPage",
				query: {
					bartenders: JSON.stringify(bartendersWithHoursAndTip),
					barBacks: JSON.stringify(barBacksWithHours),
					cooks: JSON.stringify(cooksWithHours),
					barBackPercentage: JSON.stringify(barBackPercentage),
					foodSalesTotal: JSON.stringify(foodSalesTotal),
					employeeHours: JSON.stringify(employeeHours),
					employeeTipCollected: JSON.stringify(employeeTipCollected),
					selectedShow: JSON.stringify(selectedShow),
					totalTips: JSON.stringify(totalTips),
					totalBarSales: JSON.stringify(totalBarSales),
					shiftNotes: JSON.stringify(shiftNotes),
				},
			});
		}
	}, [barBackPercentage, foodSalesTotal, employeeHours, employeeTipCollected]);

	const [defaultbarBackPercentage, setDefaultBarBackPercentage] = useState(15);
	const handleIncrease = () => {
		console.log("up");
		setDefaultBarBackPercentage((prevPercentage) =>
			Math.min(prevPercentage + 1, 100)
		);
	};

	const handleDecrease = () => {
		console.log("down");

		setDefaultBarBackPercentage((prevPercentage) =>
			Math.max(prevPercentage - 1, 0)
		);
	};

	const handleCalculate = (e) => {
		e.preventDefault();
		setSubmitting(true);
		const formData = new FormData(e.target); // Create a FormData object from the form

		const tips = formData.get("totalTips");
		const isValidInput = /^\d*\.?\d{0,2}$/.test(tips);
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

		const data = {};
		const employeeTips = {};
		const employeeHours = {};
		// Iterate through form data and convert it to a plain object
		formData.forEach((value, key) => {
			data[key] = value;
			console.log("formData", formData);

			const inputValue = formData.get("totalTips");

			// Check if the input value contains only numbers
			// const isValidInput = /^\d*\.?\d+$/.test(inputValue);

			const isValidId = (id) => {
				const regex = /^[0-9a-fA-F]{24}$/;
				const regexUUID =
					/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
				return regex.test(id) || regexUUID.test(id);
			};

			const regexTips =
				/^([\da-fA-F]{24}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})Tips$/;
			const regexHours =
				/^([\da-fA-F]{24}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})Hours$/;

			const matchTips = key.match(regexTips);
			const matchHours = key.match(regexHours);

			if (matchTips && matchTips[1] && isValidId(matchTips[1])) {
				const employeeID = matchTips[1];
				employeeTips[employeeID] = Number(value);
			}

			if (matchHours && matchHours[1] && isValidId(matchHours[1])) {
				const employeeID = matchHours[1];
				employeeHours[employeeID] = Number(value);
			}
		});

		// If modal is opened due to invalid input, prevent further execution

		setTotalTips(Number(formData.get("totalTips")));
		console.log("totalTips", totalTips);
		const barBackPercentageValue = formData.get("BarBackPercentage");
		console.log("barBackPercentageValue", barBackPercentageValue);
		setBarBackPercentage(
			barBackPercentageValue === null ? 15 : Number(barBackPercentageValue)
		);
		console.log("barBackPercentage", barBackPercentage);
		// setBarBackPercentage(Number(formData.get("BarBackPercentage")));
		const foodSalesTotalValue = formData.get("FoodSalesTotal");
		setFoodSalesTotal(
			foodSalesTotalValue !== "" && foodSalesTotalValue !== undefined
				? Number(foodSalesTotalValue)
				: null
		);
		setEmployeeHours(employeeHours);
		setEmployeeTipCollected(employeeTips);
		setTotalBarSales(Number(formData.get("BarSalesTotal")));
		setShiftNotes(formData.get("shiftNotes"));
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
		<div className={style.background}>
			<Container className={style.backgroundColor}>
				<Form onSubmit={handleCalculate}>
					<Row className={style.container}>
						<Col md={1} sm={1} xs={1}></Col>
						<Col md={4} sm={12}>
							{/* Bar Back Percentage and Input Column */}
							{barBacks.length < 1 ? (
								<div></div>
							) : (
								<Row className={`${style.formRow}`}>
									<Label
										md={7}
										sm={8}
										xs={7}
										className={style.formLabel}
										for="BarBackPercentage"
									>
										Bar Back Percentage
									</Label>
									<Col
										md={4}
										sm={2}
										xs={3}
										className="d-flex align-items-center ms-1"
									>
										<Input
											id="BarBackPercentage"
											name="BarBackPercentage"
											type="tel"
											inputMode="numeric"
											value={defaultbarBackPercentage}
											onChange={(e) =>
												setDefaultBarBackPercentage(e.target.value)
											}
										/>
										<Col md={1} sm={3} xs={2}>
											<Button
												// size="sm"
												onClick={handleIncrease}
												className={` ${style.percentageButton}`}
											>
												˄
											</Button>
											<Button
												// size="sm"
												onClick={handleDecrease}
												className={style.percentageButton}
											>
												˯
											</Button>
										</Col>
									</Col>
								</Row>
							)}
						</Col>
						{cooks.length === 0 ? (
							<Col md={5} sm={12}>
								<Row className={`${style.formRow} `}>
									<Label
										sm={8}
										xs={8}
										className={style.formLabel}
										for="BarSalesTotal"
									>
										Enter Total Bar Sales
									</Label>
									<Col sm={4} xs={4}>
										<Input
											id="BarSalesTotal"
											name="BarSalesTotal"
											type="tel"
											inputMode="decimal"
											pattern="[0-9]+(\.[0-9]{1,2})?"
											step="0.01"
											required={true}
										/>
									</Col>
								</Row>
							</Col>
						) : (
							<Col md={5} sm={12}>
								<Row className={`${style.formRow} `}>
									<Label
										sm={8}
										xs={8}
										className={style.formLabel}
										for="BarSalesTotal"
									>
										Enter Total <span className={style.wordHighlight}>Bar</span>{" "}
										Sales
									</Label>
									<Col sm={4} xs={4}>
										<Input
											id="BarSalesTotal"
											name="BarSalesTotal"
											type="tel"
											inputMode="decimal"
											pattern="[0-9]+(\.[0-9]{1,2})?"
											step="0.01"
											required={true}
										/>
									</Col>
								</Row>
								<Row className={`${style.formRow} `}>
									<Label
										sm={8}
										xs={8}
										className={style.formLabel}
										for="FoodSalesTotal"
									>
										Enter Total{" "}
										<span className={style.wordHighlight}>Food</span> Sales
									</Label>
									<Col sm={4} xs={4}>
										<Input
											id="FoodSalesTotal"
											name="FoodSalesTotal"
											type="tel"
											inputMode="decimal"
											pattern="[0-9]+(\.[0-9]{1,2})?"
											step="0.01"
											required={true}
										/>
									</Col>
								</Row>
							</Col>
						)}
						<Row className={`${style.formRow} `}>
							<Label sm={6} xs={8} className={style.formLabel} for="ShiftNotes">
								Shift Notes{" "}
							</Label>

							<Col sm={6} xs={12}>
								<Input
									className={style.shiftNotesTextArea}
									id="shiftNotes"
									name="shiftNotes"
									type="textarea"
									required={false}
								/>
							</Col>
						</Row>
						<Col md={1} sm={1} xs={1}></Col>
					</Row>
					<CCTipsInput
						setSubmitting={setSubmitting}
						setAlertMessage={setAlertMessage}
						toggleModal={toggleModal}
					/>
					<div>
						{/* Your existing code */}
						<CustomAlertModal
							isOpen={isOpen}
							toggle={toggleModal}
							message={alertMessage}
						/>
					</div>
					<Row
						className={`${style.toggleContainer} ${
							bartenders.length <= 1 ? "" : style.tipoutCashByHoursContainer
						} 
						${barBacks.length <= 1 ? "" : style.tipoutCashByHoursContainer} 
							${cooks.length <= 1 ? "" : style.tipoutCashByHoursContainer} 
				
						`}
					>
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
										Toggle to tip out{" "}
										<span className="highlight-color">Bartender</span> by hours
										worked.
									</Label>
									<div className={style.seperationLine}></div>
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
										Toggle to tip out{" "}
										<span className="highlight-color">Bar Back</span> by hours
										worked.
									</Label>
									<div className={style.seperationLine}></div>
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
										Toggle to tip out{" "}
										<span className="highlight-color">Cook</span> by hours
										worked.
									</Label>
									<div className={style.seperationLine}></div>
								</FormGroup>
							)}
						</Col>
					</Row>
					{isCookHoursClicked === false ? (
						<div>
							<StandardCreditTipCalculator employees={cooks} position="Cooks" />
						</div>
					) : (
						<HourlyCookInput cooks={cooks} />
					)}
					{isBarBackHoursClicked === false ? (
						<div>
							<StandardCreditTipCalculator
								employees={barBacks}
								position="Bar Backs"
							/>
						</div>
					) : (
						<HourlyBarBackInput barBacks={barBacks} />
					)}
					{isBartenderHoursClicked === false ? (
						<div>
							<StandardCreditTipCalculator
								employees={bartenders}
								position="Bartenders"
							/>
						</div>
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
							{submitting ? (
								<>
									<Spinner size="sm">Loading...</Spinner>
									<span>Submitting....</span>
								</>
							) : (
								"Submit"
							)}
						</Button>
					</div>
				</Form>
			</Container>
		</div>
	);
}
