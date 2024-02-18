import React, { useState } from "react";
import { Button, Col, Container, Row } from "reactstrap";
import style from "./TipBreakDown.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CurrentShift, ShiftDate } from "./CurrentShift";
import { useRouter } from "next/router";

export default function TipBreakDown({
	bartenders,
	barBacks,
	cooks,
	barBackPercentage,
	foodSalesTotal,
	employeeHours,
	employeeTipCollected,
	selectedShow,
}) {
	const [newTipBreakdown, setNewTipBreakdown] = useState({});
	const router = useRouter();
	console.log(bartenders);
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
	const cooksTips = cooks.length === 0 ? 0 : (foodSalesTotal * 0.15).toFixed(2);

	const tipsPerCook = () => {
		if (cookHours === 0) {
			let tips = Number((cooksTips / cooks.length).toFixed(2));
			return tips;
		} else {
			let tips = Number((cooksTips / cookHours).toFixed(2));
			return tips;
		}
	};

	const barbackTips =
		barBacks.length === 0
			? 0
			: (((totalTipsCollected - cooksTips) * barBackPercentage) / 100).toFixed(
					2
			  );

	const tipsPerBarBack = () => {
		if (barBackHours === 0) {
			let tips = Number((barbackTips / barBacks.length).toFixed(2));
			return tips;
		} else {
			let tips = Number((barbackTips / barBackHours).toFixed(2));
			return tips;
		}
	};

	const bartenderTips = (totalTipsCollected - cooksTips - barbackTips).toFixed(
		2
	);

	const tipsPerBartender = () => {
		if (bartenderHours === 0) {
			let tips = Number((bartenderTips / bartenders.length).toFixed(2));
			return tips;
		} else {
			let tips = Number((bartenderTips / bartenderHours).toFixed(2));
			return tips;
		}
	};

	const bartendersWithTipOut = bartenders.map((bartender) => {
		const id = bartender.id;
		if (bartenderHours === 0) {
			let tipOut = Number(tipsPerBartender().toFixed(2));
			return { ...bartender, tipOut };
		} else {
			let tipOut = Number(
				(tipsPerBartender() * bartender.tippedHours).toFixed(2)
			);
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

	const handleBackButtonClick = () => {
		// Redirect to the TipCalculationPage and pass workingEmployees as a query parameter
		router.push({
			pathname: "/SelectWorkingEmployee", // Adjust the pathname based on your file structure
		});
	};
	console.log(ShiftDate());

	const handleAddTipBreakDown = async (e) => {
		e.preventDefault();
		setNewTipBreakdown({
			show: selectedShow,
			date: ShiftDate(),
			totalTips: totalTipsCollected,
			foodSales: foodSalesTotal,
			barBackPercentage: barBackPercentage,
			cookTips: cooksWithTipOut,
			barBackTips: barBacksWithTipOut,
			BartenderTips: bartendersWithTipOut,
		});
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
				// router.push("/SelectWorkingEmployee");

				setAlertMessage(""); // Clear the alert message
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
						{bartendersWithTipOut.map((bartender) => (
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
											<p className="highlight-color">
												${bartender.tipOut.toFixed(2)}
											</p>
										</Col>
									</Row>
								</Container>
							</Col>
						))}
					</Row>
				</div>
				{/* <Row>
					<Col>
						<Button
							onClick={handleBackButtonClick}
							className={style.centerButton}
						>
							Reset
						</Button>
					</Col>
					<Col>
						<Button
							onClick={handleAddTipBreakDown}
							className={style.centerButton}
						>
							Submit
						</Button>
					</Col>
				</Row> */}
			</div>
		</Container>
	);
}
