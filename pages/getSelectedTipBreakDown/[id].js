import React from "react";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import { Button, Col, Container, Row } from "reactstrap";
import style from "../../components/TipBreakDown.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import UpdateTipBreakDownModal from "../../components/UpdateTipBreakDownModal";
import { useSession } from "next-auth/react";
import { ShiftDate } from "../../components/CurrentShift";

export default function getSelectedTipBreakDown({ breakDown }) {
	const { data: session } = useSession();
	const shiftMatch = ShiftDate() === breakDown.date;
	console.log("Breakdown:", breakDown.barBackTips);
	if (!breakDown) {
		// Handle the case when breakDown is not found
		return <div>Tip Breakdown not found</div>;
	}

	const bartenderHours = breakDown.BartenderTips.map(
		(bartender) => bartender.tippedHours || 0
	).reduce((acc, tippedHours) => acc + tippedHours, 0);

	const barBackHours = breakDown.barBackTips
		.map((barBack) => barBack.tippedHours || 0)
		.reduce((acc, tippedHours) => acc + tippedHours, 0);

	const cookHours = breakDown.cookTips
		.map((cook) => cook.tippedHours || 0)
		.reduce((acc, tippedHours) => acc + tippedHours, 0);
	console.log("Breakdown:", breakDown.totalTips);
	return (
		<Container className={`${style.topRow} justify-content-center`}>
			{session || shiftMatch ? (
				<UpdateTipBreakDownModal breakDown={breakDown} />
			) : (
				<></>
			)}
			<div className={style.backgroundColor}>
				<Container className={` ${style.container}`}>
					<Row className="mb-3">
						<Col>
							<h4> {breakDown.date}</h4>
						</Col>
					</Row>
					<Row className="mb-3">
						<Col>
							<h4>Show: </h4>
							<div className={` ${style.showTitle} highlight-color`}>
								{" "}
								{breakDown.show}
							</div>
						</Col>
					</Row>

					<Row className="mb-3">
						<Col className="mb-3" sm={4} xs={7}>
							<h4>Total Bar Sales:</h4>
							<h2 className="highlight-color">
								${breakDown.totalBarSales.toFixed(2)}
							</h2>
						</Col>
						<Col className="mb-3" sm={4} xs={5}>
							<h4>Total Tips:</h4>
							<h2 className="highlight-color">
								${breakDown.totalTips.toFixed(2)}
							</h2>
						</Col>
						<Col className="mb-3" sm={4} xs={6}>
							<h4>Food sales:</h4>
							<h2 className="highlight-color">
								${breakDown.foodSales.toFixed(2)}
							</h2>
						</Col>
						{breakDown.barBackTips.length <= 0 ? (
							<></>
						) : (
							<Col className="mb-3" sm={6} xs={6}>
								<h4>Bar Back %:</h4>
								<h2 className="highlight-color">
									{breakDown.barBackPercentage}%
								</h2>
							</Col>
						)}
						<Col sm={6} xs={12} className="mb-3">
							<h4>Shift Notes:</h4>
							<h2 className={`highlight-color ${style.shiftNotes}`}>
								{breakDown.shiftNotes}
							</h2>
						</Col>
					</Row>
				</Container>
				<div className={style.container}>
					<h1>Cook Tips </h1>
					<Row className="gap-2">
						{cookHours === 0 ? (
							<></>
						) : (
							<h4>
								Tips per hour:
								<span className="highlight-color">
									{" "}
									${breakDown.tipsPerCook.toFixed(2)}
								</span>
							</h4>
						)}
						{breakDown.cookTips.length > 0 &&
							breakDown.cookTips.map((cook) => (
								<Col key={cook.id} xs={12} sm={6} md={4}>
									<Container className={style.employeeContainer}>
										<Row className={style.employeeName}>
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
								${breakDown.tipsPerBarBack.toFixed(2)}
							</span>
						</h5>
					)}
					<Row className="gap-2">
						{breakDown.barBackTips.length > 0 &&
							breakDown.barBackTips.map((barBack) => (
								<Col key={barBack.id} xs={12} sm={6} md={4}>
									<Container className={style.employeeContainer}>
										<Row className={style.employeeName}>
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
								${breakDown.tipsPerBartender.toFixed(2)}
							</span>
						</h5>
					)}
					<Row className="gap-2">
						{" "}
						{breakDown.BartenderTips.map((bartender) => (
							<Col
								key={bartender.id}
								xs={12}
								sm={6}
								md={4}
								className={`${style.employeeList} `}
							>
								<Container className={`${style.employeeContainer} `}>
									<Row className={`${style.employeeName} `}>
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
			</div>
		</Container>
	);
}

export async function getServerSideProps(id) {
	// Destructure query directly
	const showId = id.query.id;
	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");
		const breakDownCollection = db.collection("tipBreakdown");
		const breakDown = await breakDownCollection.findOne({
			_id: new ObjectId(showId), // Use showId directly
		});

		if (!breakDown) {
			console.log("not found");
		}
		return {
			props: { breakDown: JSON.parse(JSON.stringify(breakDown)) },
		};
	} catch (error) {
		console.error("Error fetching data:", error);
		return {
			props: {
				breakDown: null,
				error: "Error fetching data", // Pass the error message to the component
			},
		};
	}
}
