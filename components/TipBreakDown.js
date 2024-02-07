import React from "react";
import {
	Button,
	Form,
	FormGroup,
	Label,
	Input,
	Col,
	Container,
	Row,
} from "reactstrap";
import style from "./TipBreakDown.module.css";

export default function TipBreakDown({
	bartenders,
	barBacks,
	cooks,
	barBackPercentage,
	foodSalesTotal,
	employeeHours,
	employeeTipCollected,
}) {
	const bartenderHours = bartenders
		.map((bartender) => bartender.tippedHours || 0)
		.reduce((acc, tippedHours) => acc + tippedHours, 0);
	console.log(bartenderHours);

	const barBackHours = barBacks
		.map((barBack) => barBack.tippedHours || 0)
		.reduce((acc, tippedHours) => acc + tippedHours, 0);
	console.log(barBackHours);

	const cookHours = cooks
		.map((cook) => cook.tippedHours || 0)
		.reduce((acc, tippedHours) => acc + tippedHours, 0);
	console.log(cookHours);

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
	console.log(typeof tipsPerBartender());

	console.log(barBacksWithTipOut.map((bartender) => typeof bartender.tipOut));
	console.log("bartenderWithTipOut", bartendersWithTipOut);
	console.log("bartenders", bartenders);

	return (
		<Container className={style.topRow}>
			<div className={style.backgroundColor}>
				<Row className={` ${style.container}`}>
					<Col sm={4} xs={6}>
						<h4>
							Total Tips: <p>${totalTipsCollected}</p>
						</h4>
					</Col>
					<Col sm={4} xs={6}>
						<h4>
							Food sales: <p>${foodSalesTotal}</p>
						</h4>
					</Col>
					<Col sm={4} xs={12}>
						<h4>
							Bar Back Percentage: <p>{barBackPercentage}%</p>
						</h4>
					</Col>
				</Row>
				<div className={style.container}>
					<h1>Cook Tips {tipsPerCook}</h1>
					{cookHours === 0 ? <></> : <h4>Tips per hour: {tipsPerCook()}</h4>}
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
												⏳ <p>{cook.tippedHours}</p>
											</Col>
										)}
										<Col>
											💰 <p>${cook.tipOut}</p>
										</Col>
									</Row>
								</Container>
							</Col>
						))}
				</div>

				<div className={style.container}>
					<h1>Bar Back Tips </h1>
					{barBackHours === 0 ? (
						<></>
					) : (
						<h5>Tips per hour: {tipsPerBarBack()}</h5>
					)}
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
												⏳ <p>{barBack.tippedHours}</p>
											</Col>
										)}
										<Col>
											💰 <p>${barBack.tipOut}</p>
										</Col>
									</Row>
								</Container>
							</Col>
						))}
				</div>

				<div className={style.container}>
					<h1>Bartender Tips </h1>
					{bartenderHours === 0 ? (
						<></>
					) : (
						<h5>Tips per hour: {tipsPerBartender()}</h5>
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
												⏳ <p>{bartender.tippedHours}</p>
											</Col>
										)}
										<Col>
											💰 <p>${bartender.tipOut}</p>
										</Col>
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