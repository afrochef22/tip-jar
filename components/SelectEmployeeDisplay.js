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
}) {
	console.log(position);
	let content;
	switch (position) {
		case "Bartender":
			content = (
				<SelectBartender
					onClick={handleCheckboxChange}
					sortedBartenders={sortedBartenders}
					btn={btn}
				/>
			);
			break;
		case "BarBack":
			content = (
				<SelectBarBack
					onClick={handleCheckboxChange}
					sortedBarBacks={sortedBarBacks}
					btn={btn}
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
				/>
			);
			break;
	}
	return <div>{content}</div>;
}
