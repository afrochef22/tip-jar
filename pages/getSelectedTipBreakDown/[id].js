import React from "react";
import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import { Button, Col, Container, Row } from "reactstrap";
import style from "../../components/TipBreakDown.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faSackDollar } from "@fortawesome/free-solid-svg-icons";
import UpdateTipBreakDownModal from "../../components/UpdateTipBreakDownModal";
import { useSession } from "next-auth/react";
import { ShiftDate } from "../../components/CurrentShift";
import { reportError } from "../../lib/alert";

export default function getSelectedTipBreakDown({ breakDown }) {
	const { data: session } = useSession();
	if (!breakDown) {
		return <div>Tip Breakdown not found</div>;
	}
	const shiftMatch = ShiftDate() === breakDown.date;
	const cookTips = breakDown.cookTips ?? [];
	const barBackTips = breakDown.barBackTips ?? [];
	const bartenderTips = breakDown.BartenderTips ?? [];
	const money = (v) => (Number(v) || 0).toFixed(2);

	const bartenderHours = bartenderTips.map(
		(bartender) => bartender.tippedHours || 0
	).reduce((acc, tippedHours) => acc + tippedHours, 0);

	const barBackHours = barBackTips
		.map((barBack) => barBack.tippedHours || 0)
		.reduce((acc, tippedHours) => acc + tippedHours, 0);

	const cookHours = cookTips
		.map((cook) => cook.tippedHours || 0)
		.reduce((acc, tippedHours) => acc + tippedHours, 0);
	return (
		<Container className={`${style.topRow} justify-content-center`}>
			{session || shiftMatch ? (
				// Keying on the data that changes after a save forces the modal
				// to remount (and re-run its useState initializers) instead of
				// keeping stale local state from a previous edit.
				<UpdateTipBreakDownModal
					key={breakDown.updatedat || breakDown._id}
					breakDown={breakDown}
				/>
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
								${money(breakDown.totalBarSales)}
							</h2>
						</Col>
						<Col className="mb-3" sm={4} xs={5}>
							<h4>Total Tips:</h4>
							<h2 className="highlight-color">
								${money(breakDown.totalTips)}
							</h2>
						</Col>
						<Col className="mb-3" sm={4} xs={6}>
							<h4>Food sales:</h4>
							<h2 className="highlight-color">
								${money(breakDown.foodSales)}
							</h2>
						</Col>
						{barBackTips.length <= 0 ? (
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
				{cookTips.length > 0 && (
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
										${money(breakDown.tipsPerCook)}
									</span>
								</h4>
							)}
							{cookTips.length > 0 &&
								cookTips.map((cook) => (
									<Col key={cook.id} xs={12} sm={6} md={4}>
										<Container className={style.employeeContainer}>
											<Row className={style.employeeName}>
												<Col>
													<span>{cook.label}</span>
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
														${(Number(cook.tipOut) || 0).toFixed(2)}
													</p>
												</Col>
											</Row>
										</Container>
									</Col>
								))}
						</Row>
					</div>
				)}

				{barBackTips.length > 0 && (
					<div className={style.container}>
						<h1>Bar Back Tips </h1>
						{barBackHours === 0 ? (
							<></>
						) : (
							<h5>
								Tips per hour:{" "}
								<span className="highlight-color">
									${money(breakDown.tipsPerBarBack)}
								</span>
							</h5>
						)}
						<Row className="gap-2">
							{barBackTips.length > 0 &&
								barBackTips.map((barBack) => (
									<Col key={barBack.id} xs={12} sm={6} md={4}>
										<Container className={style.employeeContainer}>
											<Row className={style.employeeName}>
												<Col>
													<span>{barBack.label}</span>
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
														${(Number(barBack.tipOut) || 0).toFixed(2)}
													</p>
												</Col>
											</Row>
										</Container>
									</Col>
								))}
						</Row>
					</div>
				)}

				<div className={style.container}>
					<h1>Bartender Tips </h1>
					{bartenderHours === 0 ? (
						<></>
					) : (
						<h5>
							Tips per hour:{" "}
							<span className="highlight-color">
								${money(breakDown.tipsPerBartender)}
							</span>
						</h5>
					)}
					<Row className="gap-2">
						{" "}
						{bartenderTips.map((bartender) => (
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
											<span>{bartender.label}</span>
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
												${(Number(bartender.tipOut) || 0).toFixed(2)}
											</p>
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
		}
		return {
			props: { breakDown: JSON.parse(JSON.stringify(breakDown)) },
		};
	} catch (error) {
		await reportError("Breakdown detail page", error);
		return {
			props: {
				breakDown: null,
				error: "Error fetching data", // Pass the error message to the component
			},
		};
	}
}
