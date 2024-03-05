import React, { useState, useEffect } from "react";
import { Button, Col, Container, Row } from "reactstrap";
import style from "./TipBreakDown.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CurrentShift, ShiftDate } from "./CurrentShift";
import { useRouter } from "next/router";
import GetAllTipBreakdowns from "./GetAllTipBreakdowns";
import { ConfirmationDialog } from "./ConformationDialog";
import { Decimal } from "decimal.js";

console.log(GetAllTipBreakdowns);
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
}) {
	console.log(allTipBreakdowns);
	const [newTipBreakdown, setNewTipBreakdown] = useState({});
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState("");
	const [showConfirmation, setShowConfirmation] = useState(false);
	const router = useRouter();

	useEffect(() => {
		if (submitting) {
			submitTipBreakdown();
			setTimeout(() => {
				router.push("/CCTipsTotals");
			}, 1000);
		}
	}, [submitting, newTipBreakdown]);

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
		return tips.toNumber(); // Convert Decimal back to number for state
	};

	const barbackTips =
		barBacks.length === 0
			? 0
			: ((totalTipsCollected - cooksTips) * barBackPercentage) / 100;
	const tipsPerBarBack = () => {
		let tips;
		if (barBackHours === 0) {
			tips = new Decimal(barbackTips).div(barBacks.length);
		} else {
			tips = new Decimal(barbackTips).div(barBackHours);
		}
		return tips.toNumber(); // Convert Decimal back to number for state
	};

	const bartenderTips = totalTipsCollected - cooksTips - barbackTips;

	const tipsPerBartender = () => {
		let tips;
		if (bartenderHours === 0) {
			tips = new Decimal(bartenderTips).div(bartenders.length);
		} else {
			tips = new Decimal(bartenderTips).div(bartenderHours);
		}
		return tips.toNumber(); // Convert Decimal back to number for state
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
			let tipOut = Number(tipsPerBarBack());
			return { ...barBack, tipOut };
		} else {
			let tipOut = Number(tipsPerBarBack() * barBack.tippedHours);
			return { ...barBack, tipOut };
		}
	});

	const cooksWithTipOut = cooks.map((cook) => {
		const id = cook.id;
		if (cookHours === 0) {
			let tipOut = Number(tipsPerCook());
			return { ...cook, tipOut };
		} else {
			let tipOut = Number(tipsPerCook() * cook.tippedHours);
			return { ...cook, tipOut };
		}
	});
	console.log(bartendersWithTipOut);
	// Calculate the total tip out amount for each type of employee
	let totalTipOutBartenders = bartendersWithTipOut.reduce(
		(acc, bartender) => acc + bartender.tipOut,
		0
	);
	totalTipOutBartenders = Number(totalTipOutBartenders);
	console.log(totalTipOutBartenders);

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
	console.log(totalTipOut);
	console.log(
		"barthenders",
		totalTipOutBartenders,
		"barback",
		totalTipOutBarBacks,
		"cooks",
		totalTipOutCooks,
		"=",
		totalTipOut
	);
	// Calculate the rounding difference
	let roundingDifference = Number(
		(totalTipsCollected - totalTipOut).toFixed(2)
	);
	console.log(
		"roundingDifference",
		roundingDifference,
		totalTipsCollected,
		"-",
		totalTipOut
	);
	const newTotalTipOutBartenders = totalTipOutBartenders + roundingDifference;
	console.log("new total tip out for bartenders: ", newTotalTipOutBartenders);
	// Adjust the tip out amounts for bartenders only
	const numberOfBartenders = bartendersWithTipOut.length;
	const adjustmentAmountPerBartender = Number(
		(roundingDifference / numberOfBartenders).toFixed(2)
	);
	console.log(
		"adjustment amount per bartender: ",
		adjustmentAmountPerBartender
	);

	let adjustedBartendersWithTipOut = bartendersWithTipOut.map((bartender) => ({
		...bartender,
		tipOut: Number(
			(bartender.tipOut + adjustmentAmountPerBartender).toFixed(2)
		),
	}));
	console.log(adjustedBartendersWithTipOut);

	// Recalculate the total tip out amount for bartenders after adjustment
	let totalAdjustedTipOutBartenders = adjustedBartendersWithTipOut.reduce(
		(acc, bartender) => acc + Number(bartender.tipOut),
		0
	);
	console.log(
		"bartender total tipout vs adjusted total amount",
		totalTipOutBartenders,
		totalAdjustedTipOutBartenders
	);
	// Adjust one bartender's tip out by the remaining difference
	if (totalAdjustedTipOutBartenders !== newTotalTipOutBartenders) {
		console.log(
			"newTotalTipOutBartenders and totalAdjustedTipOutBartenders not equal",
			newTotalTipOutBartenders - totalAdjustedTipOutBartenders
		);
		const remainingDifference =
			newTotalTipOutBartenders - totalAdjustedTipOutBartenders;
		console.log("remainingDifference", remainingDifference);

		if (remainingDifference <= 0.09 && remainingDifference >= -0.09) {
			const adjustedDifference = Number(remainingDifference.toFixed(2));
			console.log("adjustedDifference", adjustedDifference);

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

	console.log(
		totalTipOutBartenders.toFixed(2),
		"-",
		totalAdjustedTipOutBartenders
	);

	adjustedBartendersWithTipOut.forEach((obj) => {
		// Check if the object has the 'tipOut' key
		if ("tipOut" in obj) {
			// Apply toFixed() to the 'tipOut' key and update the value in-place
			obj.tipOut = Number(obj.tipOut).toFixed(2);
		}
	});

	totalAdjustedTipOutBartenders = adjustedBartendersWithTipOut.reduce(
		(acc, bartender) => acc + Number(bartender.tipOut),
		0
	);
	console.log(
		totalTipsCollected,
		totalAdjustedTipOutBartenders,
		"+",
		totalTipOutBarBacks,
		"+",
		totalTipOutCooks,
		"=",
		totalAdjustedTipOutBartenders + totalTipOutBarBacks + totalTipOutCooks
	);
	const handleBackButtonClick = () => {
		router.push({
			pathname: "/SelectWorkingEmployee",
		});
	};

	const toggleConfirmation = () => {
		if (bartendersWithTipOut.length <= 0) {
			setSubmitError("Please select at least 1 bartender.");
			return;
		}
		setShowConfirmation(!showConfirmation);
	};

	const handleAddTipBreakDown = async (e) => {
		e.preventDefault();
		toggleConfirmation();
		const tipBreakdownExists = allTipBreakdowns.allTipBreakdowns.some(
			(breakdown) => {
				return (
					breakdown.show === selectedShow && breakdown.date === ShiftDate()
				);
			}
		);
		if (tipBreakdownExists) {
			setSubmitError(
				"Tip breakdown already exists for the selected show and date."
			);
			return;
		}

		// Ensure that all required fields are filled out
		if (!selectedShow) {
			setSubmitError("Please select a show.");
			return;
		}

		// Ensure that other fields have valid values before submission
		if (bartendersWithTipOut.length <= 0) {
			setSubmitError("Please select at least 1 bartender.");
			return;
		}
		if (!employeeTipCollected) {
			setSubmitError("Please fill out all fields.");
			return;
		}

		// If the tip breakdown doesn't exist, proceed with submitting it
		const tipBreakdown = {
			show: selectedShow,
			date: ShiftDate(),
			totalTips: Number(totalTipsCollected.toFixed(2)),
			foodSales: foodSalesTotal,
			barBackPercentage: barBackPercentage,
			cookTips: cooksWithTipOut,
			barBackTips: barBacksWithTipOut,
			BartenderTips: adjustedBartendersWithTipOut,
			tipsPerBartender: tipsPerBartender(),
			tipsPerBarBack: tipsPerBarBack(),
			tipsPerCook: tipsPerCook(),
		};

		setNewTipBreakdown(tipBreakdown);
		setSubmitting(true);

		// Continue with the submission process
	};

	const submitTipBreakdown = async () => {
		console.log(newTipBreakdown);
		try {
			const response = await fetch("/api/addTipBreakDown", {
				method: "POST",
				headers: {
					"Content-Type": "application/json", // Specify the content type
				},
				body: JSON.stringify(newTipBreakdown),
			});

			if (response.ok) {
				console.log("Tip Breakdown added successfully");
				setSubmitting(false);
			} else {
				console.log("response not ok");
			}
		} catch (error) {
			console.log(error);
		}
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
								${totalTipsCollected.toFixed(2)}
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
				{submitError && (
					<Row>
						<Col>
							<div className={style.error}>{submitError}</div>
						</Col>
					</Row>
				)}
				<Row>
					<Col>
						<Button
							onClick={handleBackButtonClick}
							className={style.centerButton}
						>
							Reset
						</Button>
					</Col>
					<Col>
						<form type="submit" disabled={submitting}>
							<Button
								onClick={toggleConfirmation}
								className={style.centerButton}
							>
								{submitting ? (
									<>
										<FontAwesomeIcon icon="spinner" spin /> Submitting...
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
						</form>
					</Col>
				</Row>
			</div>
		</Container>
	);
}
