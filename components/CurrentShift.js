import React, { useState, useEffect } from "react";
import style from "./CurrentShift.module.css";
import { Container, Row, Col, Label, Input } from "reactstrap";
import { CardsSkeleton } from "./skeletons";
import { useSession } from "next-auth/react";
import { ShiftDate, ShowDateComparer } from "../lib/shiftDate";
import { isSameShow } from "../lib/showKey";

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
	const [loadError, setLoadError] = useState(false);

	// Recurring events that can be submitted once per shift alongside the show.
	const [happyHour, afterHours] = ["Happy Hour", "After Hours"].map((event) => {
		const name = `${event} - ${ShiftDate()}`;
		return {
			name,
			alreadySubmitted: allTipBreakdowns.some(
				(breakdown) =>
					isSameShow(breakdown.show, name) && breakdown.date === ShiftDate()
			),
		};
	});

	// Stacked on mobile; from md up, columns shrink to the card so they sit close together.
	const renderRecurringEvent = ({ name, alreadySubmitted }) => (
		<Col key={name} xs={12} md="auto">
			<Container
				className={`mb-1 ${style.bandContainer} ${
					alreadySubmitted ? style.disabledBandContainer : ""
				}`}
			>
				<Row>
					<Col sm={10} xs={10}>
						<Label>{name}</Label>
						{alreadySubmitted && (
							<div>
								<small>Already submitted for today</small>
							</div>
						)}
					</Col>
					<Col
						sm={2}
						xs={2}
						className={
							alreadySubmitted
								? style.disabledCheckbox
								: selectedShow === name
								? style.checkedCheckbox
								: style.unCheckBox
						}
						onClick={() => !alreadySubmitted && handleSelectedBand(name)}
					></Col>
				</Row>
			</Container>
		</Col>
	);

	const toggleDescription = () => {
		setShowFullDescription(!showFullDescription);
	};

	useEffect(() => {
		// Fetch data from your API when the component mounts
		fetch("/api/FindBandPerformingToday")
			.then((response) => {
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				return response.json();
			})
			.then((data) => {
				setBandPerformingToday(
					Array.isArray(data?.bandPerformingToday)
						? data.bandPerformingToday
						: []
				);
			})
			.catch((error) => {
				console.error("Error fetching data:", error);
				setLoadError(true);
				setBandPerformingToday([]);
			})
			.finally(() => setIsLoading(false));
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
							{loadError ? (
								<h4>Couldn&apos;t load today&apos;s show. Enter it below.</h4>
							) : (
								<h2>No show Today</h2>
							)}
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
							{renderRecurringEvent(happyHour)}
							{bandPerformingToday.map((band) => (
								<Col key={band} xs={12} md="auto">
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
							{renderRecurringEvent(afterHours)}
						</>
					)}
				</Row>
			)}
			{(isLoading || bandPerformingToday.length === 0) && (
				<Row className="justify-content-center">
					{renderRecurringEvent(happyHour)}
					{renderRecurringEvent(afterHours)}
				</Row>
			)}
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
