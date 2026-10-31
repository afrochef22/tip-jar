import React from "react";
import type { ReactNode } from "react";
import type { WorkerOption, WorkingPosition } from "../types/models";
import SelectBartender from "./SelectBartender";
import SelectBarBack from "./SelectBarBack";
import SelectCook from "./SelectCook";

// The phone layout shows one list at a time; these are its steps.
export type SelectStep = "Bartender" | "BarBack" | "Cook";

// Ticking or unticking someone in a pick list.
export type PickEmployee = (employee: WorkerOption, position: WorkingPosition, checked: boolean) => void;
export type AddNewEmployee = (employee: WorkerOption) => void;

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
	showCooks,
}: {
	position: SelectStep;
	handleCheckboxChange: PickEmployee;
	sortedBarBacks: WorkerOption[];
	sortedBartenders: WorkerOption[];
	sortedCooks: WorkerOption[];
	btn: (step: SelectStep) => void;
	submit: () => void;
	addNewEmployee: AddNewEmployee;
	submitError: ReactNode;
	showCooks: boolean;
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
					submitError={submitError}
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
					showCooks={showCooks}
					submit={submit}
					submitError={submitError}
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
