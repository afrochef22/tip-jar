import React from "react";
import style from "./CurrentShift.module.css";

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
		case -1:
			day = "Saturday";
			break;
		default:
	}
	return day;
}

function CurrentDate() {
	const newDate = new Date();
	const date = newDate.getDate();
	const month = newDate.getMonth() + 1;
	const year = newDate.getFullYear();
	const day = newDate.getDay();

	const yesterdayDate = newDate.getDate() - 1;
	const lastMonth = newDate.getMonth();
	const lastYear = newDate.getFullYear() - 1;
	const yesterday = newDate.getDay() - 1;
	const hour = newDate.getHours();

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
	};
	return dateData;
}

function ShiftDate(dateData) {
	dateData = CurrentDate();
	switch (true) {
		case dateData.hour < 6:
			dateData = `${
				dateData.month < 10 ? `0${dateData.month}` : `${dateData.month}`
			}/${dateData.yesterdayDate}/${dateData.year}`;
			break;

		default:
			dateData = `${
				dateData.month < 10 ? `0${dateData.month}` : `${dateData.month}`
			}/${dateData.date}/${dateData.year}`;
	}
	return dateData;
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

function CurrentShift() {
	return (
		<div className={style.center}>
			<h1>{ShiftDay()}</h1>
			<h3>{ShiftDate()}</h3>
		</div>
	);
}

export default CurrentShift;
