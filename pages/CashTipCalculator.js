import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";

import {
	Form,
	Label,
	Input,
	Col,
	Container,
	Row,
	Button,
	FormGroup,
} from "reactstrap";
import {
	HourlyBarBackCashInput,
	HourlyBartenderCashInput,
} from "../components/HourlyCashInput";
import style from "../components/CreditTipCalculation.module.css";

export default function CashTipCalculator() {
	const router = useRouter();

	const [defaultbarBackPercentage, setDefaultBarBackPercentage] = useState(15);
	const [isBartenderHoursClicked, setBartenderHoursClicked] = useState(false);
	const [isBarBackHoursClicked, setBarBackHoursClicked] = useState(false);

	const [tipsCollected, setTipsCollected] = useState(0);
	const [numberOfBartenders, setNumberOfBartenders] = useState(0);
	const [numberOfBarBacks, setNumberOfBarBacks] = useState(1);
	const [bartenders, setBartenders] = useState([]);
	const [barBacks, setBarBacks] = useState([]);
	// console.log(defaultbarBackPercentage);
	// numberOfBarBacks,
	// numberOfBartenders,
	// isBarBackHoursClicked,
	// isBartenderHoursClicked,
	// barBacks,
	// bartenders

	useEffect(() => {
		if (!isBartenderHoursClicked) {
			// If the toggle is being turned off for the first time, set hours to zero for all bartenders
			setBartenders((prevBartenders) =>
				prevBartenders.map((bartender) => ({
					...bartender,
					hours: 0,
				}))
			);
		}
	}, [isBartenderHoursClicked]);

	useEffect(() => {
		if (!isBarBackHoursClicked) {
			// If the toggle is being turned off for the first time, set hours to zero for all bar backs
			setBarBacks((prevBarBacks) =>
				prevBarBacks.map((barBack) => ({
					...barBack,
					hours: 0,
				}))
			);
		}
	}, [isBarBackHoursClicked]);

	const handleSwitchToggle = (position) => {
		switch (position) {
			case "Bartender":
				setBartenderHoursClicked(!isBartenderHoursClicked);

				break;

			case "Bar Back":
				setBarBackHoursClicked(!isBarBackHoursClicked);

				break;
			default:
				break;
		}
	};
	console.log(
		"CashTipCalculator outside calculate button BartenderHoursClicked ",
		isBartenderHoursClicked,
		" CashTipCalculator barBackHoursClicked",
		isBarBackHoursClicked
	);

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

	const generateBartendersArray = (count) => {
		const bartendersArray = [];
		for (let i = 1; i <= count; i++) {
			bartendersArray.push({ name: `Bartender ${i}`, hours: "" });
		}
		return bartendersArray;
	};

	const generateBarBacksArray = (count) => {
		const bartendersArray = [];
		for (let i = 1; i <= count; i++) {
			bartendersArray.push({ name: `Bar Back ${i}`, hours: "" });
		}
		return bartendersArray;
	};

	// Update bartenders array when the number of bartenders changes
	const handleNumberOfBartendersChange = (value) => {
		setNumberOfBartenders(value);
		setBartenders(generateBartendersArray(value));
	};

	const handleNumberOfBarBacksChange = (value) => {
		setNumberOfBarBacks(value);
		setBarBacks(generateBarBacksArray(value));
	};

	const handleCalculate = (e) => {
		e.preventDefault();

		const data = {};
		const formData = new FormData(e.target);
		const employeeHours = {};

		formData.forEach((value, key) => {
			data;
		});
		console.log(
			"CashTipCalculator BartenderHoursClicked ",
			isBartenderHoursClicked,
			" CashTipCalculator barBackHoursClicked",
			isBarBackHoursClicked
		);

		router.push({
			pathname: "/CashTipBreakDownPage",
			query: {
				numberOfBarBacks: JSON.stringify(numberOfBarBacks),
				numberOfBartenders: JSON.stringify(numberOfBartenders),
				tipsCollected: JSON.stringify(tipsCollected),
				barBacks: JSON.stringify(barBacks),
				bartenders: JSON.stringify(bartenders),
				barBackPercentage: JSON.stringify(defaultbarBackPercentage),
				isBartenderHoursClicked: isBartenderHoursClicked,
				isBarBackHoursClicked: isBarBackHoursClicked,
			},
		});
	};

	return (
		<Container className={style.backgroundColor}>
			<Form onSubmit={handleCalculate} className={style.background}>
				<h1 className={style.centerTitle}>Cash Tip Calculator</h1>
				<Row className={style.container}>
					<Col md={5} sm={5} xs={12} className="mb-2 mt-2">
						<Row>
							<Col xs={8}>
								<Label for="CashTips">Cash Tips Collected</Label>
							</Col>

							<Col>
								<Input
									id="CashTips"
									name="CashTips"
									type="tel"
									inputMode="decimal"
									pattern="[0-9]+(\.[0-9]{1,2})?"
									step="0.01"
									required
									onChange={(e) => setTipsCollected(parseFloat(e.target.value))}
								></Input>
							</Col>
						</Row>
					</Col>

					<Col md={7} sm={5} xs={12} className="mb-2 mt-2">
						<Row>
							<Col>
								<Label
									md={7}
									sm={6}
									xs={9}
									for="BarBackPercentage"
									className={style.BarBackPercentageLabel}
								>
									Bar Back Percentage
								</Label>
							</Col>

							<Col md={4} sm={5} xs={4} className="d-flex align-items-center">
								<div className="d-flex align-items-center">
									<Input
										id="BarBackPercentage"
										name="BarBackPercentage"
										type="tel"
										inputMode="numeric"
										value={defaultbarBackPercentage}
										onChange={(e) =>
											setDefaultBarBackPercentage(e.target.value)
										}
										className={style.barBackInput}
									/>
									<div className="d-flex flex-column">
										<Button
											size="sm"
											onClick={handleIncrease}
											className={style.percentageButton}
										>
											˄
										</Button>
										<Button
											size="sm"
											onClick={handleDecrease}
											className={style.percentageButton}
										>
											˯
										</Button>
									</div>
								</div>
							</Col>
						</Row>
					</Col>
				</Row>

				<Row className={style.container}>
					<Col md={5} sm={5} xs={12} className="mb-2 mt-2">
						<Row>
							<Col xs={9}>
								<Label for="barBackNumber">Number of Bar Backs</Label>
							</Col>
							<Col>
								<Input
									id="barBackNumber"
									name="barBackNumber"
									type="tel"
									inputMode="numeric"
									pattern="[0-9]+(\.[0-9]{1,2})?"
									step="0.01"
									required
									onChange={(e) =>
										handleNumberOfBarBacksChange(parseFloat(e.target.value))
									}
								></Input>
							</Col>
						</Row>
					</Col>
					<Col className="mb-2 mt-2">
						<Row>
							<Col xs={9}>
								<Label for="bartenderNumber">Number of Bartenders</Label>
							</Col>
							<Col>
								<Input
									id="bartenderNumber"
									name="bartenderNumber"
									type="tel"
									inputMode="numeric"
									pattern="[0-9]+(\.[0-9]{1,2})?"
									step="0.01"
									required
									onChange={(e) =>
										handleNumberOfBartendersChange(parseFloat(e.target.value))
									}
								></Input>
							</Col>
						</Row>
					</Col>
				</Row>
				<Row className={`${style.toggleContainer} `}>
					{numberOfBarBacks <= 1 ? (
						<div className={style.hidden}></div>
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
					{numberOfBartenders <= 1 ? (
						<div className={style.hidden}></div>
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
				</Row>
				{isBarBackHoursClicked && barBacks.length > 1 ? (
					<HourlyBarBackCashInput
						barBacks={barBacks}
						updateBarBacks={setBarBacks}
						isHoursClicked={isBarBackHoursClicked}
					/>
				) : (
					<div></div>
				)}
				{isBartenderHoursClicked && bartenders.length > 1 ? (
					<HourlyBartenderCashInput
						bartenders={bartenders}
						updateBartenders={setBartenders}
						isHoursClicked={isBartenderHoursClicked}
					/>
				) : (
					<div></div>
				)}
				<div className={style.centerButtonContainer}>
					<Button
						className={`${style.centerButton} ${style.calculateButton}`}
						type="submit"
					>
						Calculate
					</Button>
				</div>
			</Form>
		</Container>
	);
}
