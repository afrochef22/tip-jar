import React from "react";
import { Button, Col, Container, Row } from "reactstrap";
import style from "./TipBreakDown.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faSackDollar } from "@fortawesome/free-solid-svg-icons";
import UpdateCashTipBreakDownModal from "./UpdateCashTipBreakDownModal";
import { splitCashTips } from "../lib/cashSplit.mjs";

export default function CashTipBreakDown({
	numberOfBarBacks,
	numberOfBartenders,
	tipsCollected,
	barBacks,
	bartenders,
	barBackPercentage,
	isBartenderHoursClicked,
	isBarBackHoursClicked,
}) {
	const split = splitCashTips({
		tipsCollected,
		barBackPercentage,
		bartenders,
		barBacks,
	});
	const bartenderHours = bartenders
		.map((bartender) => parseFloat(bartender.hours) || 0)
		.reduce((acc, hours) => acc + hours, 0);
	const barBackHours = barBacks
		.map((barBack) => parseFloat(barBack.hours) || 0)
		.reduce((acc, hours) => acc + hours, 0);
	const tipsPerBarBack = () => split.tipsPerBarBack;
	const tipsPerBartender = () => split.tipsPerBartender;
	const barBacksWithTipOut = split.barBacks;
	const bartendersWithTipOut = split.bartenders;

	return (
		<Container className={style.topRow}>
			<UpdateCashTipBreakDownModal
				numberOfBarBacks={numberOfBarBacks}
				numberOfBartenders={numberOfBartenders}
				tipsCollected={tipsCollected}
				barBacks={barBacks}
				bartenders={bartenders}
				barBackPercentage={barBackPercentage}
				isBarBackHoursClicked={isBarBackHoursClicked}
				isBartenderHoursClicked={isBartenderHoursClicked}
			/>

			<div className={style.backgroundColor}>
				<Row className={` align-items-center ${style.container}`}>
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
														<FontAwesomeIcon icon={faSackDollar} />
														<p className="highlight-color">${Number(barBack.tipOut).toFixed(2)}</p>
													</Col>
												</Row>
											) : (
												<Row>
													<Col className=" mt-2"> {barBack.name}</Col>
													<Col className=" mt-2">
														<FontAwesomeIcon icon={faClock} />{" "}
														<p>{barBack.hours} hrs</p>
													</Col>
													<Col className=" mb-4 mt-2">
														<FontAwesomeIcon icon={faSackDollar} />
														<p className="highlight-color">${Number(barBack.tipOut).toFixed(2)}</p>
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
													<FontAwesomeIcon icon={faSackDollar} />
													<p className="highlight-color">${Number(bartender.tipOut).toFixed(2)}</p>
												</Col>
											</Row>
										) : (
											<Row>
												<Col className=" mt-2"> {bartender.name}</Col>
												<Col className=" mt-2">
													<FontAwesomeIcon icon={faClock} />{" "}
													<p>{bartender.hours} hrs</p>
												</Col>
												<Col className="mb-2 mt-2">
													<FontAwesomeIcon icon={faSackDollar} />
													<p className="highlight-color">${Number(bartender.tipOut).toFixed(2)}</p>
												</Col>
											</Row>
										)}
									</Row>
								</Container>
							</Col>
						))}
					</Row>
				</div>
				{split.leftover > 0 && (
					<div className="alert alert-warning" role="alert">
						No bar back is working, so ${split.leftover.toFixed(2)} is left over
						after giving every bartender whole dollars.
					</div>
				)}
			</div>
		</Container>
	);
}
