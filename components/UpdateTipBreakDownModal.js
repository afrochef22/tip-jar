import React, { useState, useEffect, memo } from "react";
import { Decimal } from "decimal.js";
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

import style from "./TipBreakDown.module.css";

const UpdateTipBreakDown = ({ breakDown }, args) => {
	const [modal, setModal] = useState(false);
	const [show, setShow] = useState(breakDown.show);
	const [date, setDate] = useState(breakDown.date);
	const [totalTips, setTotalTips] = useState(breakDown.totalTips);
	const [foodSales, setFoodSales] = useState(breakDown.foodSales);
	const [barBackPercentage, setBarBackPercentage] = useState(
		breakDown.barBackPercentage
	);
	const [cookTipsData, setCookTipsData] = useState(breakDown.cookTips);
	const [barBackTipsData, setBarBackTipsData] = useState(breakDown.barBackTips);
	const [bartenderTipsData, setBartenderTipsData] = useState(
		breakDown.BartenderTips
	);
	const [tipsPerBarBack, setTipsPerBarBack] = useState(
		breakDown.tipsPerBarBack
	);
	const [tipsPerBartender, setTipsPerBartender] = useState(
		breakDown.tipsPerBartender
	);
	const [tipsPerCook, setTipsPerCook] = useState(breakDown.tipsPerCook);
	const randomIndex = Math.floor(Math.random() * barBackTipsData.length);
	console.log(breakDown);

	const toggle = () => setModal(!modal);

	const handleShowChange = (e) => {
		setShow(e.target.value);
	};

	const handleDateChange = (e) => {
		setDate(e.target.value);
	};

	const handleTotalTipChange = (e) => {
		setTotalTips(e.target.value);
	};

	const handleFoodSalesChange = (e) => {
		setFoodSales(e.target.value);
	};
	const handleIncrease = () => {
		setBarBackPercentage((prevPercentage) => Math.min(prevPercentage + 1, 100));
	};

	const handleDecrease = () => {
		setBarBackPercentage((prevPercentage) => Math.max(prevPercentage - 1, 0));
	};

	const bartenderHours = breakDown.BartenderTips.map(
		(bartender) => bartender.tippedHours || 0
	).reduce((acc, tippedHours) => acc + tippedHours, 0);

	const barBackHours = breakDown.barBackTips
		.map((barBack) => barBack.tippedHours || 0)
		.reduce((acc, tippedHours) => acc + tippedHours, 0);

	const cookHours = breakDown.cookTips
		.map((cook) => cook.tippedHours || 0)
		.reduce((acc, tippedHours) => acc + tippedHours, 0);

	const cooksTips = foodSales * 0.15;

	// Function to calculate tips per cook using Decimal
	const getTipsPerCook = () => {
		let tips;
		if (cookHours === 0) {
			tips = new Decimal(cooksTips).div(cookTipsData.length);
		} else {
			tips = new Decimal(cooksTips).div(cookHours);
		}
		return tips.toNumber(); // Convert Decimal back to number for state
	};
	const calculatedCookTips = getTipsPerCook();
	useEffect(() => {
		setTipsPerCook(calculatedCookTips);
	}, [calculatedCookTips]);

	const barbackTips =
		barBackTipsData.length === 0
			? 0
			: ((totalTips - cooksTips) * barBackPercentage) / 100;

	const getTipsPerBarBack = () => {
		let tips;
		if (barBackHours === 0) {
			tips = new Decimal(barbackTips).div(barBackTipsData.length);
		} else {
			tips = new Decimal(barbackTips).div(barBackHours);
		}
		return tips.toNumber(); // Convert Decimal back to number for state
	};

	const calculatedBarBackTips = getTipsPerBarBack();
	useEffect(() => {
		setTipsPerBarBack(calculatedBarBackTips);
	}, [calculatedBarBackTips]);

	const bartenderTips = totalTips - cooksTips - barbackTips;

	const getTipsPerBartender = () => {
		let tips;
		if (bartenderHours === 0) {
			tips = new Decimal(bartenderTips).div(bartenderTipsData.length);
		} else {
			tips = new Decimal(bartenderTips).div(bartenderHours);
		}
		return tips.toNumber(); // Convert Decimal back to number for state
	};

	const calculatedBartenderTips = getTipsPerBartender();
	useEffect(() => {
		setTipsPerBartender(calculatedBartenderTips);
	}, [calculatedBartenderTips]);

	const bartendersWithTipOut = bartenderTipsData.map((bartender) => {
		const id = bartender.id;
		if (bartenderHours === 0) {
			let tipOut = Number(getTipsPerBartender());
			return { ...bartender, tipOut };
		} else {
			let tipOut = Number(getTipsPerBartender() * bartender.tippedHours);
			return { ...bartender, tipOut };
		}
	});

	const barBacksWithTipOut = barBackTipsData.map((barBack) => {
		const id = barBack.id;
		if (barBackHours === 0) {
			let tipOut = Number(getTipsPerBarBack());
			return { ...barBack, tipOut };
		} else {
			let tipOut = Number(getTipsPerBarBack() * barBack.tippedHours);
			return { ...barBack, tipOut };
		}
	});

	const cooksWithTipOut = cookTipsData.map((cook) => {
		const id = cook.id;
		if (cookHours === 0) {
			let tipOut = Number(getTipsPerCook());
			return { ...cook, tipOut };
		} else {
			let tipOut = Number(getTipsPerCook() * cook.tippedHours);
			return { ...cook, tipOut };
		}
	});

	// Calculate the total tip out amount for each type of employee
	const totalTipOutBartenders = bartendersWithTipOut.reduce(
		(acc, bartender) => acc + bartender.tipOut,
		0
	);
	const totalTipOutBarBacks = barBacksWithTipOut.reduce(
		(acc, barBack) => acc + barBack.tipOut,
		0
	);
	const totalTipOutCooks = cooksWithTipOut.reduce(
		(acc, cook) => acc + cook.tipOut,
		0
	);

	// Calculate the total of all tip outs
	const totalTipOut =
		totalTipOutBartenders + totalTipOutBarBacks + totalTipOutCooks;

	// Calculate the rounding difference
	const roundingDifference = totalTips - totalTipOut;
	console.log("roundingDifference", roundingDifference);

	// Adjust the tip out amounts for bartenders only
	const numberOfBartenders = bartendersWithTipOut.length;
	const adjustmentAmountPerBartender = roundingDifference / numberOfBartenders;
	console.log(
		"adjustment amount per bartender: ",
		adjustmentAmountPerBartender
	);
	console.log(bartendersWithTipOut);

	let adjustedBartendersWithTipOut = bartendersWithTipOut.map((bartender) => ({
		...bartender,
		tipOut: bartender.tipOut + adjustmentAmountPerBartender,
	}));
	console.log(adjustedBartendersWithTipOut);

	// Recalculate the total tip out amount for bartenders after adjustment
	let totalAdjustedTipOutBartenders = adjustedBartendersWithTipOut.reduce(
		(acc, bartender) => acc + Number(bartender.tipOut),
		0
	);
	let b = barBacksWithTipOut.reduce((acc, b) => acc + Number(b.tipOut));
	let c = cooksWithTipOut.reduce((acc, b) => acc + Number(b.tipOut));

	// Adjust one bartender's tip out by the remaining difference
	if (totalAdjustedTipOutBartenders !== totalTipOutBartenders) {
		adjustedBartendersWithTipOut[randomIndex].tipOut -=
			totalTipOutBartenders - totalAdjustedTipOutBartenders;
	}

	adjustedBartendersWithTipOut.forEach((obj) => {
		// Check if the object has the 'tipOut' key
		if ("tipOut" in obj) {
			// Apply toFixed() to the 'tipOut' key and update the value in-place
			obj.tipOut = Number(obj.tipOut).toFixed(2);
		}
	});

	console.log(
		totalTips,
		totalAdjustedTipOutBartenders,
		"+",
		totalTipOutBarBacks,
		"+",
		totalTipOutCooks,
		"=",
		totalAdjustedTipOutBartenders + totalTipOutBarBacks + totalTipOutCooks
	);

	console.log(totalTipOutBartenders);
	const closeBtn = (
		<div>
			<Button color="primary" onClick={toggle}>
				Update
			</Button>{" "}
			<Button color="secondary" onClick={toggle}>
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

				<Container className={`${style.topRow} justify-content-center`}>
					<div className={style.backgroundColor}>
						<Container className={` ${style.container}`}>
							<Row>
								<Col md={6} sm={6} className="mb-1 mt-1">
									<Row className={`${style.formRow} `}>
										<Label sm={3} xs={3} className={style.formLabel} for="show">
											<h4>Show:</h4>
										</Label>
										<Col sm={9} xs={9} className="d-flex align-items-center">
											<Input
												id="show"
												name="show"
												type="text"
												required={true}
												value={show}
												onChange={handleShowChange}
											/>
										</Col>
									</Row>
								</Col>
								<Col md={6} sm={2} className="mb-1 mt-1">
									<Row>
										<Label sm={3} xs={3} className={style.formLabel} for="date">
											<h4>Date</h4>
										</Label>
										<Col sm={6} xs={9} className="d-flex align-items-center">
											<Input
												id="date"
												name="date"
												type="date"
												required={true}
												value={date}
												onChange={handleDateChange}
											/>
										</Col>
									</Row>
								</Col>
							</Row>

							<Row>
								<Col sm={4} xs={6} className="mb-1 mt-1">
									<Label className={style.formLabel} for="totalTips">
										<h4>Total Tips:</h4>
									</Label>
									<Row>
										<Col sm={3} xs={1}></Col>
										<Col sm={7} xs={9}>
											<Input
												id="totalTips"
												name="totalTips"
												type="tel"
												inputMode="decimal"
												pattern="[0-9]+(\.[0-9]{1,2})?"
												step="0.01"
												required={true}
												value={totalTips}
												onChange={handleTotalTipChange}
											/>
										</Col>
									</Row>
								</Col>

								<Col sm={4} xs={6} className="mb-1 mt-1">
									<Label className={style.formLabel} for="foodSales">
										<h4>Food sales:</h4>
									</Label>
									<Row>
										<Col sm={3} xs={1}></Col>
										<Col sm={7} xs={9}>
											<Input
												id="foodSales"
												name="foodSales"
												type="tel"
												inputMode="decimal"
												pattern="[0-9]+(\.[0-9]{1,2})?"
												step="0.01"
												required={true}
												value={foodSales}
												onChange={handleFoodSalesChange}
											/>
										</Col>
									</Row>
								</Col>

								<Col md={4} sm={12} className="mb-1 mt-1">
									{/* Bar Back Percentage and Input Column */}
									<Row className={`${style.formRow} align-items-center`}>
										<Label
											sm={6}
											xs={7}
											className={style.formLabel}
											for="BarBackPercentage"
										>
											<h4 className="mb-0">Bar Back %</h4>
										</Label>

										<Col
											md={4}
											sm={2}
											xs={4}
											className="d-flex align-items-center"
										>
											<Input
												id="BarBackPercentage"
												name="BarBackPercentage"
												type="tel"
												inputMode="numeric"
												value={barBackPercentage}
												onChange={(e) => setBarBackPercentage(e.target.value)}
												className="text-center"
											/>
											<Col sm={2} xs={2}>
												<Button
													// size="sm"
													onClick={handleIncrease}
													className={` ${style.percentageButton} mb-1 ms-1`}
												>
													˄
												</Button>
												<Button
													// size="sm"
													onClick={handleDecrease}
													className={` ms-1 ${style.percentageButton}`}
												>
													˯
												</Button>
											</Col>
										</Col>
									</Row>
								</Col>
							</Row>
						</Container>
						<div className={style.container}>
							<h1>Cook Tips </h1>
							<Row>
								{cookHours === 0 ? (
									<></>
								) : (
									<h4>
										Tips per hour:
										<span className="highlight-color">
											{" "}
											${cookTipsData.toFixed(2)}
										</span>
									</h4>
								)}
								{cooksWithTipOut.length > 0 &&
									cooksWithTipOut.map((cook) => (
										<Col key={cook.id} xs={12} sm={6} md={4}>
											<Container className={style.employeeContainer}>
												<Row>
													<Col>
														{" "}
														{cook.label
															.split(" ")
															.map((namePart, index, parts) => (
																<div key={index}>
																	{index === 0 ? (
																		<div>{namePart}</div> // Display the first name on top
																	) : index === 1 ? (
																		<div style={{ marginTop: "5px" }}>
																			{parts.slice(1).join(" ")}
																		</div> // Join the remaining parts for last name(s)
																	) : null}
																</div>
															))}
													</Col>
													{cookHours === 0 ? (
														<></>
													) : (
														<Col>
															<FontAwesomeIcon icon="fa-clock" />{" "}
															<p>{cook.tippedHours} hrs</p>
														</Col>
													)}
													<Col>
														<FontAwesomeIcon icon="fa-solid fa-sack-dollar" />{" "}
														<p className="highlight-color">
															${cook.tipOut.toFixed(2)}
														</p>
													</Col>
												</Row>
											</Container>
										</Col>
									))}
							</Row>
						</div>

						<div className={style.container}>
							<h1>Bar Back Tips </h1>
							{barBackHours === 0 ? (
								<></>
							) : (
								<h5>
									Tips per hour:{" "}
									<span className="highlight-color">
										${tipsPerBarBack.toFixed(2)}
									</span>
								</h5>
							)}
							<Row>
								{barBacksWithTipOut.length > 0 &&
									barBacksWithTipOut.map((barBack) => (
										<Col key={barBack.id} xs={12} sm={6} md={4}>
											<Container className={style.employeeContainer}>
												<Row>
													<Col>
														{" "}
														{barBack.label
															.split(" ")
															.map((namePart, index, parts) => (
																<div key={index}>
																	{index === 0 ? (
																		<div>{namePart}</div> // Display the first name on top
																	) : index === 1 ? (
																		<div style={{ marginTop: "5px" }}>
																			{parts.slice(1).join(" ")}
																		</div> // Join the remaining parts for last name(s)
																	) : null}
																</div>
															))}
													</Col>
													{barBackHours === 0 ? (
														<></>
													) : (
														<Col>
															<FontAwesomeIcon icon="fa-clock" />{" "}
															<p>{barBack.tippedHours} hrs</p>
														</Col>
													)}
													<Col>
														<FontAwesomeIcon icon="fa-solid fa-sack-dollar" />{" "}
														<p className="highlight-color">
															${barBack.tipOut.toFixed(2)}
														</p>
													</Col>
												</Row>
											</Container>
										</Col>
									))}
							</Row>
						</div>

						<div className={style.container}>
							<h1>Bartender Tips </h1>
							{bartenderHours === 0 ? (
								<></>
							) : (
								<h5>
									Tips per hour:{" "}
									<span className="highlight-color">
										${tipsPerBartender.toFixed(2)}
									</span>
								</h5>
							)}
							<Row>
								{adjustedBartendersWithTipOut.map((bartender) => (
									<Col key={bartender.id} xs={12} sm={6} md={4}>
										<Container className={style.employeeContainer}>
											<Row>
												<Col>
													{" "}
													{bartender.label
														.split(" ")
														.map((namePart, index, parts) => (
															<div key={index}>
																{index === 0 ? (
																	<div>{namePart}</div> // Display the first name on top
																) : index === 1 ? (
																	<div style={{ marginTop: "5px" }}>
																		{parts.slice(1).join(" ")}
																	</div> // Join the remaining parts for last name(s)
																) : null}
															</div>
														))}
												</Col>
												{bartenderHours === 0 ? (
													<></>
												) : (
													<Col>
														<FontAwesomeIcon icon="fa-clock" />{" "}
														<p>{bartender.tippedHours} hrs</p>
													</Col>
												)}
												<Col>
													<FontAwesomeIcon icon="fa-solid fa-sack-dollar" />{" "}
													<p className="highlight-color">${bartender.tipOut}</p>
												</Col>
											</Row>
										</Container>
									</Col>
								))}
							</Row>
						</div>
						<ModalFooter>
							<Button color="primary" onClick={toggle}>
								Update
							</Button>{" "}
							<Button color="secondary" onClick={toggle}>
								Cancel
							</Button>
						</ModalFooter>
					</div>
				</Container>
			</Modal>
		</div>
	);
};

export default memo(UpdateTipBreakDown);
