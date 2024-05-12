import React, { useState, useEffect } from "react";
import style from "./CurrentShift.module.css";
import { Container, Row, Col, Label, Input } from "reactstrap";
import { DateTime } from "luxon";
import { CardsSkeleton } from "./skeletons";
import { useSession } from "next-auth/react";

function DayOfTheWeek(day) {
	switch (day) {
		case 0:
			day = "Sunday";
			break;
		case 1:
			day = "Monday";
			break;
		case 2:
			day = "Tuesday";
			break;
		case 3:
			day = "Wednesday";
			break;
		case 4:
			day = "Thursday";
			break;
		case 5:
			day = "Friday";
			break;
		case 6:
			day = "Saturday";
			break;
		default:
	}
	return day;
}

function DayOfTheWeekAbbreviated(day) {
	switch (day) {
		case 1:
			day = "Mon";
			break;
		case 2:
			day = "Tue";
			break;
		case 3:
			day = "Wed";
			break;
		case 4:
			day = "Thu";
			break;
		case 5:
			day = "Fri";
			break;
		case 6:
			day = "Sat";
			break;
		case 7:
			day = "Sun";
			break;
		default:
	}
	return day;
}

function MonthAbbreviated(month) {
	switch (month) {
		case 1:
			month = "Jan";
			break;
		case 2:
			month = "Feb";
			break;
		case 3:
			month = "Mar";
			break;
		case 4:
			month = "Apr";
			break;
		case 5:
			month = "May";
			break;
		case 6:
			month = "Jun";
			break;
		case 7:
			month = "Jul";
			break;
		case 8:
			month = "Aug";
			break;
		case 9:
			month = "Sep";
			break;
		case 10:
			month = "Oct";
			break;
		case 11:
			month = "Nov";
			break;
		case 12:
			month = "Dec";
			break;

		default:
	}
	return month;
}

function CurrentDate() {
	const timeZone = "America/Los_Angeles";
	const zonedDate = DateTime.now().setZone(timeZone);

	const date = zonedDate.day;
	const month = zonedDate.month;
	const year = zonedDate.year;
	const day = zonedDate.weekday;
	const yesterdayDate = zonedDate.minus({ days: 1 }).day;
	const lastMonth = zonedDate.minus({ months: 1 }).month;
	const lastYear = zonedDate.minus({ years: 1 }).year;
	const yesterday = zonedDate.minus({ days: 1 }).weekday;
	const hour = zonedDate.hour;
	const lastDayOfPrevMonth = zonedDate.minus({ months: 1 }).daysInMonth;

	const dateData = {
		date,
		month,
		year,
		day,
		yesterdayDate,
		lastMonth,
		lastYear,
		yesterday,
		hour,
		lastDayOfPrevMonth,
	};
	return dateData;
}

export function ShiftDate(dateData) {
	dateData = CurrentDate();
	let shiftDate = "";

	if (dateData.hour < 6) {
		// If the current hour is before 6 AM, shift started yesterday
		if (dateData.month === 1 && dateData.yesterdayDate === 0) {
			// If it's the first day of January, shift started last year
			shiftDate = `12/31/${dateData.lastYear}`;
		} else if (dateData.yesterdayDate === 0) {
			// If it's the first day of the month, shift started last month
			shiftDate = `${
				dateData.lastMonth < 10
					? `0${dateData.lastDayOfPrevMonth}`
					: `${dateData.lastMonth}`
			}/${lastDayOfPrevMonth}/${dateData.year}`;
		} else {
			// Otherwise, shift started yesterday
			shiftDate = `${
				dateData.month < 10 ? `0${dateData.month}` : `${dateData.month}`
			}/${dateData.yesterdayDate}/${dateData.year}`;
		}
	} else {
		// If the current hour is 6 AM or later, shift started today
		shiftDate = `${
			dateData.month < 10 ? `0${dateData.month}` : `${dateData.month}`
		}/${dateData.date}/${dateData.year}`;
	}

	return shiftDate;
}

function ShiftDay(dateData) {
	dateData = CurrentDate();
	switch (true) {
		case dateData.hour < 6:
			dateData = DayOfTheWeek(dateData.yesterday);
			break;
		default:
			dateData = DayOfTheWeek(dateData.day);
	}
	return dateData;
}
const test = CurrentDate();
export function CurrentShift() {
	return (
		<div className={style.center}>
			<h3>{ShiftDate()}</h3>
		</div>
	);
}
export function ShowDateComparer(dateData) {
	dateData = CurrentDate();
	const timeZone = "America/Los_Angeles";
	const zonedDate = DateTime.now().setZone(timeZone);
	console.log("hi", zonedDate);
	let compareDate = "";
	// Extract relevant date information from zonedDate
	const month = zonedDate.month;
	const day = zonedDate.day;
	const yesterday = zonedDate.minus({ days: 1 }).day;
	console.log(yesterday);

	// Teragram

	switch (true) {
		case zonedDate.hour < 6:
			if (day === 1) {
				compareDate = `${DayOfTheWeekAbbreviated(
					dateData.yesterday
				)} ${MonthAbbreviated(dateData.lastMonth)} ${
					dateData.lastDayOfPrevMonth
				}`;
			} else {
				compareDate = `${DayOfTheWeekAbbreviated(
					dateData.yesterday
				)} ${MonthAbbreviated(dateData.month)} ${dateData.yesterdayDate}`;
			}

			break;

		default:
			compareDate = `${DayOfTheWeekAbbreviated(
				dateData.day
			)} ${MonthAbbreviated(dateData.month)} ${dateData.date}`;
	}
	return compareDate;

	// Moroccan
	switch (true) {
		case zonedDate.hour < 6:
			if (dateData.yesterdayDate === 0) {
				compareDate = `${MonthAbbreviated(dateData.lastMonth)} ${
					dateData.lastDayOfPrevMonth
				}`;
			} else {
				compareDate = `${MonthAbbreviated(dateData.month)} ${
					dateData.yesterdayDate
				}`;
			}

			break;

		default:
			compareDate = `${MonthAbbreviated(dateData.month)} ${dateData.date}`;
	}
	return compareDate;
}

export function CurrentShowPerforming({
	handleSelectedBand,
	setSelectedShow,
	selectedShow,
}) {
	const { data: session } = useSession();

	const [bandPerformingToday, setBandPerformingToday] = useState([]);
	const [showFullDescription, setShowFullDescription] = useState(false);
	const [isLoading, setIsLoading] = useState(true);

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
