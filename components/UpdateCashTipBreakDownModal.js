import React, { useState, useEffect, memo } from "react";
import { Decimal } from "decimal.js";
import { NumericFormat } from "react-number-format";
import {
	Form,
	FormGroup,
	Button,
	Label,
	Input,
	Modal,
	ModalHeader,
	ModalFooter,
	Col,
	Container,
	Row,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/router";
import { DeleteDialog } from "./ConformationDialog";
import style from "./CreditTipCalculation.module.css";
import {
	HourlyBarBackCashInput,
	HourlyBartenderCashInput,
} from "../components/HourlyCashInput";

const UpdateCashTipBreakDown = (
	{
		numberOfBarBacks,
		numberOfBartenders,
		tipsCollected,
		barBacks,
		bartenders,
		barBackPercentage,
		isBarBackHoursClicked,
		isBartenderHoursClicked,
	},
	args
) => {
	console.log(
		barBackPercentage,
		numberOfBarBacks,
		numberOfBartenders,
		barBacks,
		bartenders
	);

	if (tipsCollected === undefined || tipsCollected === null) {
		return <div>Loading...</div>; // Or handle the absence of tipsCollected appropriately
	}
	const router = useRouter();

	const [modal, setModal] = useState(false);
	const toggle = () => setModal(!modal);
	const [defaultbarBackPercentage, setDefaultBarBackPercentage] =
		useState(barBackPercentage);
	const [bartenderHoursClicked, setBartenderHoursClicked] = useState(
		isBartenderHoursClicked
	);
	const [barBackHoursClicked, setBarBackHoursClicked] = useState(
		isBarBackHoursClicked
	);
	const [newTipsCollected, setNewTipsCollected] = useState(tipsCollected);
	const [newNumberOfBartenders, setNewNumberOfBartenders] =
		useState(numberOfBartenders);
	const [newNumberOfBarBacks, setNewNumberOfBarBacks] =
		useState(numberOfBarBacks);
	const [newBartenders, setNewBartenders] = useState(bartenders);
	const [newBarBacks, setNewBarBacks] = useState(barBacks);

	useEffect(() => {
		if (!bartenderHoursClicked) {
			// If the toggle is being turned off for the first time, set hours to zero for all bartenders
			setNewBartenders((prevBartenders) =>
				prevBartenders.map((bartender) => ({
					...bartender,
					hours: 0,
				}))
			);
		}
	}, [bartenderHoursClicked]);

	useEffect(() => {
		if (!barBackHoursClicked) {
			// If the toggle is being turned off for the first time, set hours to zero for all bar backs
			setNewBarBacks((prevBarBacks) =>
				prevBarBacks.map((barBack) => ({
					...barBack,
					hours: 0,
				}))
			);
		}
	}, [barBackHoursClicked]);

	const handleSwitchToggle = (position) => {
		switch (position) {
			case "Bartender":
				setBartenderHoursClicked(!bartenderHoursClicked);

				break;

			case "Bar Back":
				setBarBackHoursClicked(!barBackHoursClicked);

				break;
			default:
				break;
		}
	};

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
		setNewNumberOfBartenders(value);
		setNewBartenders(generateBartendersArray(value));
	};

	const handleNumberOfBarBacksChange = (value) => {
		setNewNumberOfBarBacks(value);
		setNewBarBacks(generateBarBacksArray(value));
	};

	const handleUpdateBreakDown = async (e) => {
		e.preventDefault();
		router.push({
			pathname: "/CashTipBreakDownPage",
			query: {
				numberOfBarBacks: JSON.stringify(newNumberOfBarBacks),
				numberOfBartenders: JSON.stringify(newNumberOfBartenders),
				tipsCollected: JSON.stringify(newTipsCollected),
				barBacks: JSON.stringify(newBarBacks),
				bartenders: JSON.stringify(newBartenders),
				barBackPercentage: JSON.stringify(defaultbarBackPercentage),
			},
		});
		toggle();
	};

	const toggleConfirmation = () => {
		setShowConfirmation(!showConfirmation);
	};

	const closeBtn = (
		<div>
			<Button color="primary mb-1" onClick={handleUpdateBreakDown}>
				Update
			</Button>{" "}
			<Button color="secondary mb-1" onClick={toggle}>
				Cancel
			</Button>
		</div>
	);

	return (
		<div>
			<Button onClick={toggle}>Edit</Button>

			<Modal isOpen={modal} toggle={toggle} {...args} fullscreen>
				<ModalHeader toggle={toggle} close={closeBtn}>
					Edit Breakdown
				</ModalHeader>

				<Container className={style.backgroundColor}>
					<Form onSubmit={handleUpdateBreakDown} className={style.background}>
						<h1 className={style.centerTitle}>Cash Tip Calculator</h1>
						<Row className={style.container}>
							<Col md={5} sm={5} xs={12} className="mb-2 mt-2">
								<Row>
									<Col xs={8}>
										<Label for="CashTips">Cash Tips Collected</Label>
										<Label>Original Amount: {tipsCollected}</Label>
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
											placeholder={
												isNaN(newTipsCollected) ? null : newTipsCollected
											}
											onChange={(e) =>
												setNewTipsCollected(parseFloat(e.target.value))
											}
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

									<Col
										md={4}
										sm={5}
										xs={4}
										className="d-flex align-items-center"
									>
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
											value={
												isNaN(newNumberOfBarBacks) ? "" : newNumberOfBarBacks
											}
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
											value={
												isNaN(newNumberOfBartenders)
													? ""
													: newNumberOfBartenders
											}
											onChange={(e) =>
												handleNumberOfBartendersChange(
													parseFloat(e.target.value)
												)
											}
										></Input>
									</Col>
								</Row>
							</Col>
						</Row>
						<Row className={style.toggleContainer}>
							{newNumberOfBarBacks <= 1 ? (
								<div className={style.hidden}></div>
							) : (
								<FormGroup switch>
									<Input
										type="switch"
										role="switch"
										onChange={() => handleSwitchToggle("Bar Back")}
										checked={barBackHoursClicked}
									/>
									<Label check>
										Toggle to tip out{" "}
										<span className="highlight-color">Bar Back</span> by hours
										worked.
									</Label>
									<div className={style.seperationLine}></div>
								</FormGroup>
							)}
							{newNumberOfBartenders <= 1 ? (
								<div className={style.hidden}></div>
							) : (
								<FormGroup switch>
									<Input
										type="switch"
										role="switch"
										onChange={() => handleSwitchToggle("Bartender")}
										checked={bartenderHoursClicked}
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
						{barBackHoursClicked && newBarBacks.length > 1 ? (
							<div>
								If you need to cancel the hours enter 0 for all the bar backs.
								<HourlyBarBackCashInput
									barBacks={newBarBacks}
									updateBarBacks={setNewBarBacks}
									isBarBackHoursClicked={barBackHoursClicked}
								/>
							</div>
						) : (
							<div></div>
						)}
						{bartenderHoursClicked && newBartenders.length > 1 ? (
							<div>
								If you need to cancel the hours enter 0 for all the bartenders.
								<HourlyBartenderCashInput
									bartenders={newBartenders}
									updateBartenders={setNewBartenders}
									isBartenderHoursClicked={bartenderHoursClicked}
								/>
							</div>
						) : (
							<div></div>
						)}
						<div className={style.centerButtonContainer}>
							<Button
								className={`${style.centerButton} ${style.calculateButton}`}
								onClick={handleUpdateBreakDown}
							>
								Update
							</Button>
						</div>
					</Form>
				</Container>
			</Modal>
		</div>
	);
};

export default memo(UpdateCashTipBreakDown);