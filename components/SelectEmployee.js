import React, { useState, useEffect } from "react";
import { FormGroup, Form, Button, Label } from "reactstrap";
import Select from "react-select";
import style from "./SelectEmployee.module.css";

const CustomSelect = ({ options, onChange, ...props }) => {
	const [menuIsOpen, setMenuIsOpen] = useState(false);

	const handleMenuOpen = () => {
		setMenuIsOpen(true);
	};

	const handleMenuClose = () => {
		setMenuIsOpen(false);
	};

	const handleInputChange = (newValue) => {
		if (!newValue) {
			setMenuIsOpen(false);
		}
	};

	return (
		<Select
			options={options}
			isMulti
			closeMenuOnSelect={false}
			allowSelectAll={true}
			hideSelectedOptions={false}
			placeholder="Select employee(s)"
			onChange={onChange}
			onMenuOpen={handleMenuOpen}
			onMenuClose={handleMenuClose}
			onInputChange={handleInputChange}
			isClearable={false}
			isSearchable={false}
			menuIsOpen={menuIsOpen}
			{...props}
		/>
	);
};

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
		<div className={` ${style.backgroundColor}`}>
			<div className={style.formContainer}>
				<h2
					className={`text-color ${style.centerTitle}`}
					htmlFor="exampleSelect"
				>
					Who is Working?
				</h2>
				<Form>
					<FormGroup>
						<Label className="text-color" htmlFor="exampleSelect">
							test
						</Label>
						<CustomSelect
							options={sortedBartenders}
							onChange={addWorkingEmployee}
						/>
					</FormGroup>
					<FormGroup>
						<Label className="text-color" htmlFor="exampleSelect">
							Bartending
						</Label>
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
					<FormGroup>
						<Label className="text-color" htmlFor="exampleSelect">
							Bar Backing
						</Label>
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
					<FormGroup>
						<Label className="text-color" htmlFor="exampleSelect">
							Cooking
						</Label>
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
					<Button
						type="submit"
						className={`button-color ${style.centerButton}`}
					>
						Add Employees
					</Button>{" "}
				</Form>
			</div>
		</div>
	);
}
