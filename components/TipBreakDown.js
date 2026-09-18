import React, { useState } from "react";
import { Button, Col, Container, Row } from "reactstrap";
import style from "./TipBreakDown.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
	faClock,
	faSackDollar,
	faSpinner,
} from "@fortawesome/free-solid-svg-icons";
import { CurrentShift, ShiftDate } from "./CurrentShift";
import { useRouter } from "next/router";
import { ConfirmationDialog } from "./ConformationDialog";
import { Decimal } from "decimal.js";

export default function TipBreakDown({
	bartenders,
	barBacks,
	cooks,
	barBackPercentage,
	foodSalesTotal,
	employeeHours,
	employeeTipCollected,
	selectedShow,
	allTipBreakdowns,
	totalTips,
	totalBarSales,
	shiftNotes,
}) {
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState("");
	const [showConfirmation, setShowConfirmation] = useState(false);
	const router = useRouter();

	const bartenderHours = bartenders
		.map((bartender) => bartender.tippedHours || 0)
		.reduce((acc, tippedHours) => acc + tippedHours, 0);

	const barBackHours = barBacks
		.map((barBack) => barBack.tippedHours || 0)
		.reduce((acc, tippedHours) => acc + tippedHours, 0);

	const cookHours = cooks
		.map((cook) => cook.tippedHours || 0)
		.reduce((acc, tippedHours) => acc + tippedHours, 0);

	const totalTipsCollected = Object.values(employeeTipCollected).reduce(
		(acc, tips) => acc + tips,
		0
	);

	const cooksTips = cooks.length === 0 ? 0 : foodSalesTotal * 0.15;

	const tipsPerCook = () => {
		let tips;
		if (cookHours === 0) {
			tips = new Decimal(cooksTips).div(cooks.length);
		} else {
			tips = new Decimal(cooksTips).div(cookHours);
		}
		const n = tips.toNumber();
		return Number.isFinite(n) ? n : 0; // 0/0 when a group is empty
	};

	const barbackTips =
		barBacks.length === 0
			? 0
			: ((totalTips - cooksTips) * barBackPercentage) / 100;
	const tipsPerBarBack = () => {
		let tips;
		if (barBackHours === 0) {
			tips = new Decimal(barbackTips).div(barBacks.length);
		} else {
			tips = new Decimal(barbackTips).div(barBackHours);
		}
		const n = tips.toNumber();
		return Number.isFinite(n) ? n : 0; // 0/0 when a group is empty
	};

	const bartenderTips = totalTips - cooksTips - barbackTips;

	const tipsPerBartender = () => {
		let tips;
		if (bartenderHours === 0) {
			tips = new Decimal(bartenderTips).div(bartenders.length);
		} else {
			tips = new Decimal(bartenderTips).div(bartenderHours);
		}
		const n = tips.toNumber();
		return Number.isFinite(n) ? n : 0; // 0/0 when a group is empty
	};

	const bartendersWithTipOut = bartenders.map((bartender) => {
		const id = bartender.id;
		if (bartenderHours === 0) {
			let tipOut = Number(tipsPerBartender());
			return { ...bartender, tipOut };
		} else {
			let tipOut = Number(tipsPerBartender() * bartender.tippedHours);
			return { ...bartender, tipOut };
		}
	});

	const barBacksWithTipOut = barBacks.map((barBack) => {
		const id = barBack.id;
		if (barBackHours === 0) {
			let tipOut = Number(tipsPerBarBack().toFixed(2));
			return { ...barBack, tipOut };
		} else {
			let tipOut = Number((tipsPerBarBack() * barBack.tippedHours).toFixed(2));
			return { ...barBack, tipOut };
		}
	});

	const cooksWithTipOut = cooks.map((cook) => {
		const id = cook.id;
		if (cookHours === 0) {
			let tipOut = Number(tipsPerCook().toFixed(2));
			return { ...cook, tipOut };
		} else {
			let tipOut = Number((tipsPerCook() * cook.tippedHours).toFixed(2));
			return { ...cook, tipOut };
		}
	});

	// Calculate the total tip out amount for each type of employee
	let totalTipOutBartenders = bartendersWithTipOut.reduce(
		(acc, bartender) => acc + bartender.tipOut,
		0
	);
	totalTipOutBartenders = Number(totalTipOutBartenders);

	let totalTipOutBarBacks = barBacksWithTipOut.reduce(
		(acc, barBack) => acc + barBack.tipOut,
		0
	);
	totalTipOutBarBacks = Number(totalTipOutBarBacks.toFixed(2));

	let totalTipOutCooks = cooksWithTipOut.reduce(
		(acc, cook) => acc + cook.tipOut,
		0
	);
	totalTipOutCooks = Number(totalTipOutCooks.toFixed(2));

	// Calculate the total of all tip outs
	const totalTipOut =
		totalTipOutBartenders + totalTipOutBarBacks + totalTipOutCooks;
	// Calculate the rounding difference
	let roundingDifference = Number((totalTips - totalTipOut).toFixed(2));
	const newTotalTipOutBartenders = totalTipOutBartenders + roundingDifference;
	// Adjust the tip out amounts for bartenders only
	const numberOfBartenders = bartendersWithTipOut.length;
	const adjustmentAmountPerBartender = Number(
		(roundingDifference / numberOfBartenders).toFixed(2)
	);

	let adjustedBartendersWithTipOut = bartendersWithTipOut.map((bartender) => ({
		...bartender,
		tipOut: Number(
			(bartender.tipOut + adjustmentAmountPerBartender).toFixed(2)
		),
	}));

	// Recalculate the total tip out amount for bartenders after adjustment
	let totalAdjustedTipOutBartenders = adjustedBartendersWithTipOut.reduce(
		(acc, bartender) => acc + Number(bartender.tipOut),
		0
	);
	// Adjust one bartender's tip out by the remaining difference
	if (totalAdjustedTipOutBartenders !== newTotalTipOutBartenders) {
		const remainingDifference =
			newTotalTipOutBartenders - totalAdjustedTipOutBartenders;

		if (remainingDifference <= 0.09 && remainingDifference >= -0.09) {
			const adjustedDifference = Number(remainingDifference.toFixed(2));

			// Create a shuffled array of indexes to simulate randomness
			const shuffledIndexes = Array.from(
				{ length: adjustedBartendersWithTipOut.length },
				(_, i) => i
			);
			for (let i = shuffledIndexes.length - 1; i > 0; i--) {
				const j = Math.floor(Math.random() * (i + 1));
				[shuffledIndexes[i], shuffledIndexes[j]] = [
					shuffledIndexes[j],
					shuffledIndexes[i],
				];
			}

			// Calculate how many bartenders need to receive the additional tip
			let additionalBartendersCount = Math.floor(
				Math.abs(adjustedDifference) / 0.01
			);

			if (additionalBartendersCount > 0) {
				// Determine the adjustment per bartender based on the sign of the adjusted difference
				const adjustment = adjustedDifference > 0 ? 0.01 : -0.01;

				// Distribute the additional tip among the bartenders
				let adjustedBartenders = new Set();
				for (let i = 0; i < additionalBartendersCount; i++) {
					const bartenderIndex = shuffledIndexes[i % shuffledIndexes.length];
					if (!adjustedBartenders.has(bartenderIndex)) {
						adjustedBartendersWithTipOut[bartenderIndex].tipOut += adjustment;
						adjustedBartenders.add(bartenderIndex);
					}
				}
			}
		}
	}

	adjustedBartendersWithTipOut.forEach((obj) => {
		// Check if the object has the 'tipOut' key
		if ("tipOut" in obj) {
			// Apply toFixed() to the 'tipOut' key and update the value in-place
			obj.tipOut = Number(Number(obj.tipOut).toFixed(2));
		}
	});

	totalAdjustedTipOutBartenders = adjustedBartendersWithTipOut.reduce(
		(acc, bartender) => acc + Number(bartender.tipOut),
		0
	);
	const handleBackButtonClick = () => {
		router.back();
	};

	const shiftDate = ShiftDate();

	const validate = () => {
		if (!selectedShow) return "Please select a show.";
		if (bartendersWithTipOut.length <= 0) {
			return "Please select at least 1 bartender.";
		}
		const exists = (allTipBreakdowns || []).some(
			(breakdown) =>
				breakdown.show === selectedShow && breakdown.date === shiftDate
		);
		if (exists) {
			return "Tip breakdown already exists for the selected show and date.";
		}
		return "";
	};

	const toggleConfirmation = () => {
		if (!showConfirmation) {
			const problem = validate();
			if (problem) {
				setSubmitError(problem);
				return;
			}
			setSubmitError("");
		}
		setShowConfirmation(!showConfirmation);
	};

	const handleAddTipBreakDown = async () => {
		setShowConfirmation(false);
		if (submitting) return;
		const problem = validate();
		if (problem) {
			setSubmitError(problem);
			return;
		}
		setSubmitError("");
		setSubmitting(true);

		const tipBreakdown = {
			show: selectedShow,
			date: shiftDate,
			totalTips: Number(totalTips),
			foodSales: Number(foodSalesTotal) || 0,
			barBackPercentage: Number(barBackPercentage) || 0,
			cookTips: cooksWithTipOut,
			barBackTips: barBacksWithTipOut,
			BartenderTips: adjustedBartendersWithTipOut,
			tipsPerBartender: tipsPerBartender(),
			tipsPerBarBack: tipsPerBarBack(),
			tipsPerCook: tipsPerCook(),
			totalBarSales: Number(totalBarSales) || 0,
			shiftNotes: shiftNotes || "",
		};

		try {
			const response = await fetch("/api/addTipBreakDown", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(tipBreakdown),
			});
			const body = await response.json().catch(() => ({}));
			if (response.ok && body.tipBreakdownId) {
				// replace() so the browser Back button does not land here again.
				router.replace(`/getSelectedTipBreakDown/${body.tipBreakdownId}`);
				return;
			}
			setSubmitError(
				body.message || "Could not save the tip breakdown. Please try again."
			);
		} catch (error) {
			console.error(error);
			setSubmitError("Could not reach the server. Please try again.");
		}
		setSubmitting(false);
	};

	return (
		<Container className={`${style.topRow} justify-content-center`}>
			<div className={style.backgroundColor}>
				<Container className={` ${style.container}`}>
					<Row>
						<Col sm={6} xs={12}>
							<h4>Show: {selectedShow}</h4>
						</Col>
						<Col sm={6} xs={12}>
							<h4> {CurrentShift()}</h4>
						</Col>
					</Row>

					<Row>
						<Col sm={4} xs={6}>
							<h4>Total Tips:</h4>
							<h2 className="highlight-color">
								${Number(totalTips).toFixed(2)}
							</h2>
						</Col>
						<Col sm={4} xs={6}>
							<h4>Food sales:</h4>
							<h2 className="highlight-color">${foodSalesTotal.toFixed(2)}</h2>
						</Col>
						<Col sm={4} xs={12}>
							<h4>Bar Back Percentage:</h4>
							<h2 className="highlight-color">{barBackPercentage}%</h2>
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
									${tipsPerCook().toFixed(2)}
								</span>
							</h4>
						)}
						{cooks.length > 0 &&
							cooksWithTipOut.map((cook) => (
								<Col key={cook.id} xs={12} sm={6} md={4}>
									<Container className={style.employeeContainer}>
										<Row>
											<Col>
												{" "}
												{cook.label.split(" ").map((namePart, index, parts) => (
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
													<p>{cook.tippedHours} hrs</p>
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
								${tipsPerBarBack().toFixed(2)}
							</span>
						</h5>
					)}
					<Row>
						{barBacks.length > 0 &&
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
													<p>{barBack.tippedHours} hrs</p>
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
								${tipsPerBartender().toFixed(2)}
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
												<p>{bartender.tippedHours} hrs</p>
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
				{submitError && (
					<Row>
						<Col>
							<div className={style.error}>{submitError}</div>
						</Col>
					</Row>
				)}
				<Row className="justify-content-center mt-3">
					<Col xs="auto">
						<Button
							onClick={handleBackButtonClick}
							className={style.centerButton}
							disabled={submitting}
						>
							Back
						</Button>
					</Col>
					<Col xs="auto">
						<Button
							onClick={toggleConfirmation}
							className={style.centerButton}
							disabled={submitting}
						>
							{submitting ? (
								<>
									<FontAwesomeIcon icon={faSpinner} spin /> Submitting...
								</>
							) : (
								"Submit"
							)}
						</Button>
						<ConfirmationDialog
							isOpen={showConfirmation}
							toggle={toggleConfirmation}
							onConfirm={handleAddTipBreakDown}
						/>
					</Col>
				</Row>
			</div>
		</Container>
	);
}
