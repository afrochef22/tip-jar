import React, { useState, useEffect } from "react";
import { FormGroup } from "reactstrap";
import Select from "react-select";
import style from "./SelectBarteder.module.css";

export default function SelectEmployee({ employees }) {
	const [availableEmployees, setAvailableEmployees] = useState([]);
	const [selectedEmployees, setSelectedEmployees] = useState([]);

	useEffect(() => {
		const options = employees.map((employee) => {
			return {
				value: employee._id,
				label: `${employee.firstName} ${employee.lastName}`,
				position: employee.position || [],
			};
		});
		setAvailableEmployees(options);
	}, [employees]);

	const addWorkingEmployee = (selectedOptions, { removedValue }) => {
		setSelectedEmployees(selectedOptions);

		setAvailableEmployees(
			availableEmployees.filter((value) => !selectedOptions.includes(value))
		);

		if (removedValue) {
			setAvailableEmployees((prevEmployees) => [
				...prevEmployees,
				removedValue,
			]);
		}
	};
	// Sort employees array by last name
	const sortedBartenders = availableEmployees
		.filter((bartender) => bartender.position.includes("Bartender"))
		.sort((a, b) => {
			const lastNameA = a.label.split(" ").pop(); // Get the last word as the last name
			const lastNameB = b.label.split(" ").pop(); // Get the last word as the last name

			return lastNameA.localeCompare(lastNameB);
		});

	const sortedBarBacks = availableEmployees
		.filter((bartender) => bartender.position.includes("Bar Back"))
		.sort((a, b) => {
			const lastNameA = a.label.split(" ").pop(); // Get the last word as the last name
			const lastNameB = b.label.split(" ").pop(); // Get the last word as the last name

			return lastNameA.localeCompare(lastNameB);
		});

	const sortedCooks = availableEmployees
		.filter((bartender) => bartender.position.includes("Cook"))
		.sort((a, b) => {
			const lastNameA = a.label.split(" ").pop(); // Get the last word as the last name
			const lastNameB = b.label.split(" ").pop(); // Get the last word as the last name

			return lastNameA.localeCompare(lastNameB);
		});

	return (
		<div>
			<FormGroup className={style.backgroundColor}>
				<h2 htmlFor="exampleSelect">Who is bartending?</h2>

				<Select
					options={sortedBartenders}
					isMulti
					closeMenuOnSelect={false}
					allowSelectAll={true}
					hideSelectedOptions={false}
					placeholder="Select bartender(s)"
					onChange={addWorkingEmployee}
					isClearable={false}
					isSearchable={false}
				/>
			</FormGroup>

			<FormGroup className={style.backgroundColor}>
				<h2 htmlFor="exampleSelect">Who is Bar Backing?</h2>

				<Select
					options={sortedBarBacks}
					isMulti
					closeMenuOnSelect={false}
					allowSelectAll={true}
					hideSelectedOptions={false}
					placeholder="Select bar back(s)"
					onChange={addWorkingEmployee}
					isClearable={false}
					isSearchable={false}
				/>
			</FormGroup>

			<FormGroup className={style.backgroundColor}>
				<h2 htmlFor="exampleSelect">Who is Cooking?</h2>

				<Select
					options={sortedCooks}
					isMulti
					closeMenuOnSelect={false}
					allowSelectAll={true}
					hideSelectedOptions={false}
					placeholder="Select Cook(s)"
					onChange={addWorkingEmployee}
					isClearable={false}
					isSearchable={false}
				/>
			</FormGroup>
		</div>
	);
}
