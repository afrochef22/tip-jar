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
import { splitCreditTips } from "../lib/tipSplit.mjs";
import { isSameShow } from "../lib/showKey";

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

	const split = splitCreditTips({
		totalTips,
		foodSalesTotal,
		barBackPercentage,
		bartenders,
		barBacks,
		cooks,
	});
	const tipsPerCook = () => split.tipsPerCook;
	const tipsPerBarBack = () => split.tipsPerBarBack;
	const tipsPerBartender = () => split.tipsPerBartender;
	const cooksWithTipOut = split.cooks;
	const barBacksWithTipOut = split.barBacks;
	const adjustedBartendersWithTipOut = split.bartenders;
	const totalAdjustedTipOutBartenders = split.totalTipOutBartenders;

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
				isSameShow(breakdown.show, selectedShow) && breakdown.date === shiftDate
		);
		if (exists) {
			return "Tip breakdown already exists for the selected show and date.";
		}
		return "";
	};

	// A different show name with the exact same total on the same shift is
	// almost always the same breakdown entered twice, so ask before saving.
	const sameTotalBreakdown = (allTipBreakdowns || []).find(
		(breakdown) =>
			Number(totalTips) > 0 &&
			breakdown.date === shiftDate &&
			Number(breakdown.totalTips) === Number(totalTips)
	);
	const duplicateWarning = sameTotalBreakdown
		? `"${sameTotalBreakdown.show}" was already submitted today with the same total of ${Number(totalTips).toFixed(2)}. Make sure this isn't the same shift entered twice.`
		: "";

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
							warning={duplicateWarning}
						/>
					</Col>
				</Row>
			</div>
		</Container>
	);
}
