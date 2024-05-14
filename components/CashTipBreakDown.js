import React from "react";
import { Button, Col, Container, Row } from "reactstrap";
import style from "./TipBreakDown.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UpdateCashTipBreakDownModal from "./UpdateCashTipBreakDownModal";

export default function CashTipBreakDown({
	numberOfBarBacks,
	numberOfBartenders,
	tipsCollected,
	barBacks,
	bartenders,
	barBackPercentage,
}) {
	console.log(bartenders);
	const bartenderHours = bartenders
		.map((bartender) => parseFloat(bartender.hours) || 0)
		.reduce((acc, hours) => acc + hours, 0);
	console.log(bartenderHours);

	const barBackHours = barBacks
		.map((barBack) => parseFloat(barBack.hours) || 0)
		.reduce((acc, hours) => acc + hours, 0);
	const barbackTips =
		numberOfBarBacks === 0
			? 0
			: ((tipsCollected * barBackPercentage) / 100).toFixed(2);

	const tipsPerBarBack = () => {
		if (barBackHours === 0) {
			let tips = Number((barbackTips / numberOfBarBacks).toFixed(2));
			return tips;
		} else {
			let tips = Number((barbackTips / barBackHours).toFixed(2));
			return tips;
		}
	};

	const bartenderTips = (tipsCollected - barbackTips).toFixed(2);
	console.log(bartenderTips);
	const tipsPerBartender = () => {
		if (bartenderHours === 0) {
			let tips = Number((bartenderTips / numberOfBartenders).toFixed(2));
			return tips;
		} else {
			let tips = Number((bartenderTips / bartenderHours).toFixed(2));
			return tips;
		}
	};

	console.log(Number((bartenderTips / numberOfBartenders).toFixed(2)));
	const barBacksWithTipOut = barBacks.map((barBack) => {
		const id = barBack.id;
		if (barBackHours === 0) {
			let tipOut = Number(tipsPerBarBack().toFixed(2));
			return { ...barBack, tipOut };
		} else {
			let tipOut = Number((tipsPerBarBack() * barBack.hours).toFixed(2));
			return { ...barBack, tipOut };
		}
	});

	let bartendersWithTipOut = bartenders.map((bartender) => {
		const id = bartender.id;
		if (bartenderHours === 0) {
			let tipOut = Number(tipsPerBartender().toFixed(2));
			return { ...bartender, tipOut };
		} else {
			let tipOut = Number((tipsPerBartender() * bartender.hours).toFixed(2));
			return { ...bartender, tipOut };
		}
	});

	let totalBartendersTipout = bartendersWithTipOut.reduce(
		(acc, bartender) => acc + Number(bartender.tipOut),
		0
	);
	let totalBarBackTipout = barBacksWithTipOut.reduce(
		(acc, barBack) => acc + Number(barBack.tipOut),
		0
	);
	let NewTotalTipOut = totalBarBackTipout + totalBartendersTipout;
	console.log("total Bartenders Tipout", NewTotalTipOut);

	if (NewTotalTipOut !== tipsCollected) {
		console.log(
			"tipsCollected and NewTotalTipOut not equal",
			tipsCollected - NewTotalTipOut
		);
		const remainingDifference = tipsCollected - NewTotalTipOut;
		console.log("remainingDifference", remainingDifference);

		if (remainingDifference <= 0.09 && remainingDifference >= -0.09) {
			const adjustedDifference = Number(remainingDifference.toFixed(2));
			console.log("adjustedDifference", adjustedDifference);

			// Create a shuffled array of indexes to simulate randomness
			const shuffledIndexes = Array.from(
				{ length: bartendersWithTipOut.length },
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
						bartendersWithTipOut[bartenderIndex].tipOut += adjustment;
						adjustedBartenders.add(bartenderIndex);
					}
				}
			}
		}
	}

	bartendersWithTipOut.forEach((obj) => {
		// Check if the object has the 'tipOut' key
		if ("tipOut" in obj) {
			// Apply toFixed() to the 'tipOut' key and update the value in-place
			obj.tipOut = Number(obj.tipOut).toFixed(2);
		}
	});
	let totalAdjustedTipOutBartenders = bartendersWithTipOut.reduce(
		(acc, bartender) => acc + Number(bartender.tipOut),
		0
	);
	console.log("bartendersWithTipOut", bartendersWithTipOut);
	console.log(
		tipsCollected,
		totalAdjustedTipOutBartenders,
		"+",
		totalBarBackTipout,

		"=",
		totalAdjustedTipOutBartenders + totalBarBackTipout
	);
	return (
		<Container className={style.topRow}>
			<UpdateCashTipBreakDownModal
				numberOfBarBacks={numberOfBarBacks}
				numberOfBartenders={numberOfBartenders}
				tipsCollected={tipsCollected}
				barBacks={barBacks}
				bartenders={bartenders}
				barBackPercentage={barBackPercentage}
			/>

			<div className={style.backgroundColor}>
				<Row className={` ${style.container}`}>
					<Col sm={6} xs={6}>
						<h4>
							Total Tips:
							<p className="highlight-color">${tipsCollected}</p>
						</h4>
					</Col>

					<Col sm={6} xs={6}>
						<h4>
							Bar Back Percentage:{" "}
							<p className="highlight-color">{barBackPercentage}%</p>
						</h4>
					</Col>
				</Row>

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
								<Col key={barBack.name} xs={12} sm={6} md={4}>
									<Container className={style.employeeContainer}>
										<Row>
											{barBackHours === 0 ? (
												<Row>
													<Col className=" mt-2"> {barBack.name}</Col>
													<Col className=" mt-2">
														<FontAwesomeIcon icon="fa-solid fa-sack-dollar" />
														<p className="highlight-color">${barBack.tipOut}</p>
													</Col>
												</Row>
											) : (
												<Row>
													<Col className=" mt-2"> {barBack.name}</Col>
													<Col className=" mt-2">
														<FontAwesomeIcon icon="fa-clock" />{" "}
														<p>{barBack.hours}</p>
													</Col>
													<Col className=" mb-4 mt-2">
														<FontAwesomeIcon icon="fa-solid fa-sack-dollar" />
														<p className="highlight-color">${barBack.tipOut}</p>
													</Col>
												</Row>
											)}
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
							<Col key={bartender.name} xs={12} sm={6} md={4}>
								<Container className={style.employeeContainer}>
									<Row>
										{bartenderHours === 0 ? (
											<Row>
												<Col className=" mt-2"> {bartender.name}</Col>

												<Col className=" mt-2">
													<FontAwesomeIcon icon="fa-solid fa-sack-dollar" />
													<p className="highlight-color">${bartender.tipOut}</p>
												</Col>
											</Row>
										) : (
											<Row>
												<Col className=" mt-2"> {bartender.name}</Col>
												<Col className=" mt-2">
													<FontAwesomeIcon icon="fa-clock" />{" "}
													<p>{bartender.hours} hrs</p>
												</Col>
												<Col className="mb-2 mt-2">
													<FontAwesomeIcon icon="fa-solid fa-sack-dollar" />
													<p className="highlight-color">${bartender.tipOut}</p>
												</Col>
											</Row>
										)}
									</Row>
								</Container>
							</Col>
						))}
					</Row>
				</div>
			</div>
		</Container>
	);
}
