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

function DayOfTheWeekAbbreviated(day) {
	switch (day) {
		case 0:
			day = "Sun";
			break;
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
		case -1:
			day = "Sat";
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
	const lastDayOfPrevMonth = new Date(year, lastMonth, 0).getDate();

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

function ShiftDate(dateData) {
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
			<h1>{ShiftDay()}</h1>
			<h3>{ShiftDate()}</h3>
			<div>{ShowDateComparer()}</div>
		</div>
	);
}

export function ShowDateComparer(dateData) {
	dateData = CurrentDate();
	let compareDate = "";
	switch (true) {
		case dateData.hour < 6:
			if (dateData.yesterdayDate === 0) {
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
}
