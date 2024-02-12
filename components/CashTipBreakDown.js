import React from "react";
import { Button, Col, Container, Row } from "reactstrap";
import style from "./TipBreakDown.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

	return (
		<Container className={style.topRow}>
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
														<p className="highlight-color">
															${tipsPerBarBack().toFixed(2)}
														</p>
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
														<p className="highlight-color">
															${(tipsPerBarBack() * barBack.hours).toFixed(2)}
														</p>
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
													<p className="highlight-color">
														${tipsPerBartender().toFixed(2)}
													</p>
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
													<p className="highlight-color">
														${(tipsPerBartender() * bartender.hours).toFixed(2)}
													</p>
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
