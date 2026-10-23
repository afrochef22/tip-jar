import React, { useState, useEffect, memo } from "react";
import { splitCreditTips } from "../lib/tipSplit.mjs";
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
import { faClock, faSackDollar } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { DeleteDialog } from "./ConformationDialog";
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
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [totalBarSales, setTotalBarSales] = useState(breakDown.totalBarSales);
	const [shiftNotes, setShiftNotes] = useState(breakDown.shiftNotes);
	const [saveError, setSaveError] = useState("");

	const router = useRouter();

	const toggle = () => {
		setSaveError("");
		setModal(!modal);
	};

	const handleShowChange = (e) => {
		setShow(e.target.value);
	};

	const handleDateChange = (e) => {
		const dateString = e.target.value; // Example date string in YYYY-MM-DD format
		const parts = dateString.split("-");
		const day = parseInt(parts[2], 10); // Convert day to integer
		const formattedDay = day.toString(); // Convert day back to string to remove leading zero
		const formattedDate = `${parts[1]}/${formattedDay}/${parts[0]}`;
		setDate(formattedDate);
	};

	const handleTotalBarSalesChange = (e) => {
		setTotalBarSales(e.target.value);
	};
	const handleShiftNotesChange = (e) => {
		setShiftNotes(e.target.value);
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

	const setCookHours = (cookId, newHours) => {
		parseFloat(newHours);
		const updatedCookTipsData = cookTipsData.map((cook) => {
			if (cook.id === cookId) {
				return { ...cook, tippedHours: Number(newHours) };
			}
			return cook; // Return the unchanged bartender if it's not the one to be updated
		});
		setCookTipsData(updatedCookTipsData);
	};

	const setBarBackHours = (barBackId, newHours) => {
		parseFloat(newHours);
		const updatedBarBackTipsData = barBackTipsData.map((barBack) => {
			if (barBack.id === barBackId) {
				return { ...barBack, tippedHours: Number(newHours) };
			}
			return barBack; // Return the unchanged barBack if it's not the one to be updated
		});
		setBarBackTipsData(updatedBarBackTipsData);
	};

	const setBartenderHours = (bartenderId, newHours) => {
		parseFloat(newHours);
		const updatedBartenderTipsData = bartenderTipsData.map((bartender) => {
			if (bartender.id === bartenderId) {
				return { ...bartender, tippedHours: Number(newHours) };
			}
			return bartender; // Return the unchanged bartender if it's not the one to be updated
		});
		setBartenderTipsData(updatedBartenderTipsData);
	};

	const bartenderHours = bartenderTipsData
		.map((bartender) => bartender.tippedHours || 0)
		.reduce((acc, tippedHours) => acc + tippedHours, 0);

	const barBackHours = barBackTipsData
		.map((barBack) => barBack.tippedHours || 0)
		.reduce((acc, tippedHours) => acc + tippedHours, 0);

	const cookHours = cookTipsData
		.map((cook) => cook.tippedHours || 0)
		.reduce((acc, tippedHours) => acc + tippedHours, 0);

	const split = splitCreditTips({
		totalTips,
		foodSalesTotal: foodSales,
		barBackPercentage,
		bartenders: bartenderTipsData,
		barBacks: barBackTipsData,
		cooks: cookTipsData,
	});

	const calculatedCookTips = split.tipsPerCook;
	useEffect(() => {
		setTipsPerCook(calculatedCookTips);
	}, [calculatedCookTips]);

	const calculatedBarBackTips = split.tipsPerBarBack;
	useEffect(() => {
		setTipsPerBarBack(calculatedBarBackTips);
	}, [calculatedBarBackTips]);

	const calculatedBartenderTips = split.tipsPerBartender;
	useEffect(() => {
		setTipsPerBartender(calculatedBartenderTips);
	}, [calculatedBartenderTips]);

	const cooksWithTipOut = split.cooks;
	const barBacksWithTipOut = split.barBacks;
	const adjustedBartendersWithTipOut = split.bartenders;

	const handleUpdateBreakDown = async (e) => {
		e.preventDefault();
		// alert("Sorry doesn't work yet");
		try {
			const response = await fetch(`/api/UpdateTipBreakDown/${breakDown._id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					show: show,
					date: date,
					totalTips: Number(totalTips),
					foodSales: Number(foodSales),
					barBackPercentage: Number(barBackPercentage),
					cookTips: cooksWithTipOut,
					barBackTips: barBacksWithTipOut,
					bartenderTips: adjustedBartendersWithTipOut,
					tipsPerBarBack: Number(tipsPerBarBack),
					tipsPerBartender: Number(tipsPerBartender),
					tipsPerCook: Number(tipsPerCook),
					totalBarSales: Number(totalBarSales),
					shiftNotes: shiftNotes,
				}),
			});
			if (response.ok) {
				toggle();
				router.push(`/getSelectedTipBreakDown/${breakDown._id}`);
				return;
			}
			const body = await response.json().catch(() => ({}));
			setSaveError(body.error || "Could not save the changes. Please try again.");
		} catch (error) {
			console.error(error);
			setSaveError("Could not reach the server. Please try again.");
		}
	};

	const toggleConfirmation = () => {
		setShowConfirmation(!showConfirmation);
	};
	const handleDelete = async (e) => {
		e.preventDefault();
		setShowConfirmation(!showConfirmation);

		// alert("Sorry doesn't work yet");
		try {
			const response = await fetch(`/api/removeTipBreakDown/${breakDown._id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					show: show,
					date: date,
					totalTips: totalTips,
					foodSales: foodSales,
					barBackPercentage: barBackPercentage,
					cookTips: cooksWithTipOut,
					barBackTips: barBacksWithTipOut,
					bartenderTips: adjustedBartendersWithTipOut,
					tipsPerBarBack: tipsPerBarBack,
					tipsPerBartender: tipsPerBartender,
					tipsPerCook: tipsPerCook,
					totalBarSales: totalBarSales,
					shiftNotes: shiftNotes,
				}),
			});
			if (response.ok) {
				toggle();
				router.push(`/CCTipsTotals`);
				return;
			}
			const body = await response.json().catch(() => ({}));
			setSaveError(body.error || "Could not delete the breakdown. Please try again.");
		} catch (error) {
			console.error(error);
			setSaveError("Could not reach the server. Please try again.");
		}
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

				<Container className={`${style.topRow} justify-content-center`}>
					<div className={style.backgroundColor}>
						<Container className={` ${style.container}`}>
							<Row>
								<Col md={6} sm={12} className="mb-1 mt-1">
									<Row className={`${style.formRow} `}>
										<Label sm={6} xs={3} className={style.formLabel} for="show">
											<h4>Show:</h4>
										</Label>
										<Col sm={6} xs={12} className="d-flex align-items-center">
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

								<Col md={6} sm={12} className="mb-1 mt-1">
									<Row>
										<Label sm={6} xs={3} className={style.formLabel} for="date">
											<h4>Date</h4>
										</Label>
										<Col sm={6} xs={9} className="d-flex align-items-center">
											<Input
												id="date"
												name="date"
												type="date"
												required={true}
												placeholder={date}
												onChange={handleDateChange}
											/>
										</Col>
									</Row>
								</Col>
							</Row>

							<Row>
								<Col sm={4} xs={12} className="mb-1 mt-1">
									<Label className={style.formLabel} for="totalBarSales">
										<h4>Total Bar Sales:</h4>
									</Label>
									<Row>
										<Col sm={3} xs={3}></Col>
										<Col sm={7} xs={6}>
											<Input
												id="totalBarSales"
												name="totalBarSales"
												type="tel"
												inputMode="decimal"
												pattern="[0-9]+(\.[0-9]{1,2})?"
												step="0.01"
												required={true}
												value={totalBarSales}
												onChange={handleTotalBarSalesChange}
											/>
										</Col>
									</Row>
								</Col>

								<Col sm={4} xs={12} className="mb-1 mt-1">
									<Label className={style.formLabel} for="totalTips">
										<h4>Total Tips:</h4>
									</Label>
									<Row>
										<Col sm={3} xs={3}></Col>
										<Col sm={7} xs={6}>
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

								<Col sm={4} xs={12} className="mb-1 mt-1">
									<Label className={style.formLabel} for="foodSales">
										<h4>Food sales:</h4>
									</Label>
									<Row>
										<Col sm={3} xs={3}></Col>
										<Col sm={7} xs={6}>
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

								<Col md={12} sm={12} className="mb-1 mt-1">
									{/* Bar Back Percentage and Input Column */}
									<Row className={`${style.formRow} align-items-center`}>
										<Col md={6} sm={12} className="mb-1 mt-1">
											<Label
												sm={12}
												xs={12}
												className={style.formLabel}
												for="showNotes"
											>
												<h4 className="mb-0">Show Notes:</h4>
											</Label>
											<Row>
												<Col sm={3} xs={1}></Col>

												<Col
													sm={12}
													xs={12}
													className={`d-flex align-items-center ${style.shiftNotesTextAerea}`}
												>
													<Input
														id="shiftNotes"
														name="shiftNotes"
														type="textarea"
														value={shiftNotes}
														onChange={handleShiftNotesChange}
														className={` ${style.textArea}`}
													/>
												</Col>
											</Row>
										</Col>

										<Col md={6} sm={12}>
											<Label
												md={12}
												sm={12}
												xs={12}
												className={style.formLabel}
												for="BarBackPercentage"
											>
												<h4 className="mb-0">Bar Back %</h4>
											</Label>
											<Row>
												<Col md={3} sm={3} xs={3}></Col>
												<Col
													md={6}
													sm={6}
													xs={6}
													className="d-flex align-items-center"
												>
													<Input
														id="BarBackPercentage"
														name="BarBackPercentage"
														type="tel"
														inputMode="numeric"
														value={barBackPercentage}
														onChange={(e) =>
															setBarBackPercentage(e.target.value)
														}
														className={`text-center`}
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
								</Col>
							</Row>
						</Container>
						{split.warning && (
							<div className={`${style.notice} ${style.noticeDanger}`} role="alert">
								{split.warning}
							</div>
						)}
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
											${tipsPerCook.toFixed(2)}
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
															<FontAwesomeIcon icon={faClock} />{" "}
															<NumericFormat
																id="cookHours"
																name="cookHours"
																type="number"
																inputMode="decimal"
																pattern="[0-9]+(\.[0-9]{1,2})?"
																step="0.01"
																value={cook.tippedHours}
																onChange={(e) =>
																	setCookHours(cook.id, e.target.value)
																}
																className={`${style.enterHoursInbox}`}
															/>
														</Col>
													)}
													<Col>
														<FontAwesomeIcon icon={faSackDollar} />{" "}
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
															<FontAwesomeIcon icon={faClock} />{" "}
															<NumericFormat
																id="barBackHours"
																name="barBackHours"
																type="number"
																inputMode="decimal"
																pattern="[0-9]+(\.[0-9]{1,2})?"
																step="0.01"
																value={barBack.tippedHours}
																onChange={(e) =>
																	setBarBackHours(barBack.id, e.target.value)
																}
																className={`${style.enterHoursInbox}`}
															/>
														</Col>
													)}
													<Col>
														<FontAwesomeIcon icon={faSackDollar} />{" "}
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
														<FontAwesomeIcon icon={faClock} />{" "}
														<NumericFormat
															id="bartenderHours"
															name="bartenderHours"
															type="number"
															inputMode="decimal"
															pattern="[0-9]+(\.[0-9]{1,2})?"
															step="0.01"
															value={bartender.tippedHours}
															onChange={(e) =>
																setBartenderHours(bartender.id, e.target.value)
															}
															allowNegative={false}
															className={`${style.enterHoursInbox}`}
														/>
													</Col>
												)}
												<Col>
													<FontAwesomeIcon icon={faSackDollar} />{" "}
													<p className="highlight-color">
														${Number(bartender.tipOut).toFixed(2)}
													</p>
												</Col>
											</Row>
										</Container>
									</Col>
								))}
							</Row>
						</div>
						{saveError && <div className={style.error}>{saveError}</div>}
						<ModalFooter>
							<Button color="primary" onClick={handleUpdateBreakDown}>
								Update
							</Button>{" "}
							<Button color="secondary" onClick={toggle}>
								Cancel
							</Button>
							<Button color="danger" onClick={toggleConfirmation}>
								Delete
							</Button>
							<DeleteDialog
								isOpen={showConfirmation}
								toggle={toggleConfirmation}
								onConfirm={handleDelete}
							/>
						</ModalFooter>
					</div>
				</Container>
			</Modal>
		</div>
	);
};

export default memo(UpdateTipBreakDown);
