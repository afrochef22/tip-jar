import React from "react";
import SelectBartender from "./SelectBartender";
import SelectBarBack from "./SelectBarBack";
import SelectCook from "./SelectCook";

export default function SelectEmployeeDisplay({
	position,
	handleCheckboxChange,
	sortedBarBacks,
	sortedBartenders,
	sortedCooks,
	btn,
	submit,
	addNewEmployee,
	submitError,
}) {
	let content;
	switch (position) {
		case "Bartender":
			content = (
				<SelectBartender
					onClick={handleCheckboxChange}
					sortedBartenders={sortedBartenders}
					btn={btn}
					addNewEmployee={addNewEmployee}
				/>
			);
			break;
		case "BarBack":
			content = (
				<SelectBarBack
					onClick={handleCheckboxChange}
					sortedBarBacks={sortedBarBacks}
					btn={btn}
					addNewEmployee={addNewEmployee}
				/>
			);
			break;
		case "Cook":
			content = (
				<SelectCook
					onClick={handleCheckboxChange}
					sortedCooks={sortedCooks}
					btn={btn}
					submit={submit}
					addNewEmployee={addNewEmployee}
					submitError={submitError}
				/>
			);
			break;
	}
	return <div>{content}</div>;
}
