import React, { useState, useEffect } from "react";
import style from "./CurrentShift.module.css";
import { Container, Row, Col, Label, Input } from "reactstrap";
import { CardsSkeleton } from "./skeletons";
import { useSession } from "next-auth/react";
import { ShiftDate, ShowDateComparer } from "../lib/shiftDate";

// Re-exported so existing imports keep working. The logic lives in lib/shiftDate.js.
export { ShiftDate, ShowDateComparer };

export function CurrentShift() {
	return (
		<div className={style.center}>
			<h3>{ShiftDate()}</h3>
		</div>
	);
}

export function CurrentShowPerforming({
	handleSelectedBand,
	setSelectedShow,
	selectedShow,
	allTipBreakdowns = [],
}) {
	const { data: session } = useSession();

	const [bandPerformingToday, setBandPerformingToday] = useState([]);
	const [showFullDescription, setShowFullDescription] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

	const cafeAfterHoursName = `Cafe After Hours - ${ShiftDate()}`;
	const cafeAlreadySubmitted = allTipBreakdowns.some(
		(breakdown) =>
			breakdown.show === cafeAfterHoursName && breakdown.date === ShiftDate()
	);

	const toggleDescription = () => {
		setShowFullDescription(!showFullDescription);
	};

	useEffect(() => {
		// Fetch data from your API when the component mounts
		fetch("/api/FindBandPerformingToday")
			.then((response) => response.json())
			.then((data) => {
				setBandPerformingToday(data.bandPerformingToday);
				setIsLoading(false);
			})
			.catch((error) => console.error("Error fetching data:", error));
	}, []);
	useEffect(() => {
		if (bandPerformingToday.length === 1) {
			setSelectedShow(bandPerformingToday[0]);
		}
	}, [bandPerformingToday, setSelectedShow]);
	return (
		<Container className={style.center}>
			{isLoading ? (
				<>
					<h3 className={style.title}>Select A Show</h3>
					<Row className="justify-content-center">
						<CardsSkeleton />
					</Row>
				</>
			) : (
				<Row className="justify-content-center">
					{bandPerformingToday.length === 0 ? (
						<>
							<h2>No show Today</h2>
							<Container className={`${style.bandContainer} `}>
								<Row className="justify-content-center">
									<Col className={`${style.enterEventInboxContainer}`}>
										<p>Enter an event</p>
										<Input
											className={`${style.enterEventInbox}`}
											onChange={(e) => handleSelectedBand(e.target.value)}
										/>
									</Col>
								</Row>
							</Container>
						</>
					) : (
						<>
							<h3 className={style.title}>Select A Show</h3>
							{bandPerformingToday.map((band) => (
								<Col key={band} sm={4}>
									{band ? (
										<div>
											<Container
												className={`mb-1 ${style.bandContainer} ${
													showFullDescription ? style.expanded : ""
												}`}
											>
												<Row>
													<Col sm={10} xs={10}>
														<Label>
															{showFullDescription ? band : band.slice(0, 17)}
															{band.length > 17 && (
																<span
																	className="highlight-color"
																	onClick={toggleDescription}
																>
																	{showFullDescription ? " less" : "... more"}
																</span>
															)}
														</Label>
													</Col>
													<Col
														sm={2}
														xs={2}
														className={
															selectedShow === band
																? style.checkedCheckbox
																: style.unCheckBox
														}
														onClick={() => handleSelectedBand(band)}
													></Col>
												</Row>
											</Container>
										</div>
									) : (
										<>
											<h2>No show Today</h2>
											<Container className={`${style.bandContainer} `}>
												<Row className="justify-content-center">
													<Col className={`${style.enterEventInboxContainer}`}>
														<p>Enter an event</p>
														<Input
															className={`${style.enterEventInbox}`}
															onChange={(e) =>
																handleSelectedBand(e.target.value)
															}
														/>
													</Col>
												</Row>
											</Container>
										</>
									)}
								</Col>
							))}
						</>
					)}
				</Row>
			)}
			<Row className="justify-content-center">
				<Col sm={4}>
					<Container
						className={`mb-1 ${style.bandContainer} ${
							cafeAlreadySubmitted ? style.disabledBandContainer : ""
						}`}
					>
						<Row>
							<Col sm={10} xs={10}>
								<Label>{cafeAfterHoursName}</Label>
								{cafeAlreadySubmitted && (
									<div>
										<small>Already submitted for today</small>
									</div>
								)}
							</Col>
							<Col
								sm={2}
								xs={2}
								className={
									cafeAlreadySubmitted
										? style.disabledCheckbox
										: selectedShow === cafeAfterHoursName
										? style.checkedCheckbox
										: style.unCheckBox
								}
								onClick={() =>
									!cafeAlreadySubmitted &&
									handleSelectedBand(cafeAfterHoursName)
								}
							></Col>
						</Row>
					</Container>
				</Col>
			</Row>
			{session && bandPerformingToday.length > 0 ? (
				<div>
					<h3 className={`${style.title} mt-3`}>Or</h3>

					<Container
						className={`mb-1 ${style.bandContainer} ${
							showFullDescription ? style.expanded : ""
						}`}
					>
						<Row className="justify-content-center">
							<Col className={`${style.enterEventInboxContainer}`}>
								<p>Enter an event</p>
								<Input
									className={`${style.enterEventInbox}`}
									onChange={(e) => handleSelectedBand(e.target.value)}
								/>
							</Col>
						</Row>
					</Container>
				</div>
			) : (
				<></>
			)}
		</Container>
	);
}
