import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button, Label, Row, Col, Container } from "reactstrap";
import style from "./SelectEmployee.module.css";

export default function SelectEmployee({ employees }) {
	const router = useRouter();
	const [allEmployees, setAllEmployees] = useState([]);
	const [workingEmployees, setWorkingEmployees] = useState([]);

	const [bartenderList, setBartenderList] = useState([]);
	const [barBacksList, setBarBacksList] = useState([]);
	const [cooksList, setCooksList] = useState([]);

	const filterEmployeesByPosition = (employees, position) =>
		employees.filter((employee) => employee.position.includes(position));

	useEffect(() => {
		const options = employees.map((employee) => {
			return {
				id: employee._id,
				label: `${employee.firstName} ${employee.lastName}`,
				position: employee.position || [],
				checked: false,
				workingPosition: "",
				tipsBroughtIn: 0,
				tippedHours: 0,
				tipOut: 0,
			};
		});
		setAllEmployees(options);
	}, [employees]);

	useEffect(() => {
		setBarBacksList(filterEmployeesByPosition(allEmployees, "Bar Back"));
		setBartenderList(filterEmployeesByPosition(allEmployees, "Bartender"));
		setCooksList(filterEmployeesByPosition(allEmployees, "Cook"));
	}, [allEmployees]);

	const addWorkingEmployee = (selectedEmployee, position) => {
		setWorkingEmployees((prev) => [
			...prev,
			{
				...selectedEmployee,
				workingPosition: position,
			},
		]);

		switch (position) {
			case "Bartender":
				setBarBacksList((prev) =>
					prev.filter((id) => id.id !== selectedEmployee.id)
				);
				setCooksList((prev) =>
					prev.filter((id) => id.id !== selectedEmployee.id)
				);
				break;
			case "Bar Back":
				setBartenderList((prev) =>
					prev.filter((id) => id.id !== selectedEmployee.id)
				);
				setCooksList((prev) =>
					prev.filter((id) => id.id !== selectedEmployee.id)
				);
				break;
			case "Cook":
				setBartenderList((prev) =>
					prev.filter((id) => id.id !== selectedEmployee.id)
				);
				setBarBacksList((prev) =>
					prev.filter((id) => id.id !== selectedEmployee.id)
				);
				break;
			default:
				break;
		}
	};

	const removeWorkingEmployee = (selectedEmployee, position) => {
		setWorkingEmployees((prev) =>
			prev.filter((id) => id.id !== selectedEmployee.id)
		);

		switch (position) {
			case "Bartender":
				if (selectedEmployee.position.includes("Bar Back")) {
					setBarBacksList((prev) => [...prev, selectedEmployee]);
				}
				if (selectedEmployee.position.includes("Cook")) {
					setCooksList((prev) => [...prev, selectedEmployee]);
				}
				break;
			case "Bar Back":
				if (selectedEmployee.position.includes("Bartender")) {
					setBartenderList((prev) => [...prev, selectedEmployee]);
				}
				if (selectedEmployee.position.includes("Cook")) {
					setCooksList((prev) => [...prev, selectedEmployee]);
				}
				break;
			case "Cook":
				if (selectedEmployee.position.includes("Bartender")) {
					setBartenderList((prev) => [...prev, selectedEmployee]);
				}
				if (selectedEmployee.position.includes("Bar Back")) {
					setBarBacksList((prev) => [...prev, selectedEmployee]);
				}
				break;
			default:
				break;
		}
	};

	const handleCheckboxChange = (selectedEmployee, position, checked) => {
		console.log(checked);

		const updatedEmployees = allEmployees.map((employee) => {
			if (employee.id === selectedEmployee.id) {
				if (checked) {
					return {
						...employee,
						checked: checked,
						workingPosition: position,
					};
				} else {
					return {
						...employee,
						checked: checked,
						workingPosition: "",
					};
				}
			}
			return employee;
		});

		setAllEmployees(updatedEmployees);

		if (checked) {
			addWorkingEmployee(selectedEmployee, position);
		} else {
			removeWorkingEmployee(selectedEmployee, position);
		}
	};

	const handleReset = () => {
		setWorkingEmployees([]);
		setBartenderList(
			allEmployees.filter((employee) => employee.position.includes("Bartender"))
		);
		setBarBacksList(
			allEmployees.filter((employee) => employee.position.includes("Bar Back"))
		);
		setCooksList(
			allEmployees.filter((employee) => employee.position.includes("Cook"))
		);

		document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
			checkbox.checked = false;
		});
	};

	// Sort employees array by last name
	let sortedBartenders = bartenderList.sort((a, b) => {
		const lastNameA = a.label.split(" ").pop(); // Get the last word as the last name
		const lastNameB = b.label.split(" ").pop();

		return lastNameA.localeCompare(lastNameB);
	});

	let sortedBarBacks = barBacksList.sort((a, b) => {
		const lastNameA = a.label.split(" ").pop();
		const lastNameB = b.label.split(" ").pop();

		return lastNameA.localeCompare(lastNameB);
	});

	let sortedCooks = cooksList.sort((a, b) => {
		const lastNameA = a.label.split(" ").pop();
		const lastNameB = b.label.split(" ").pop();

		return lastNameA.localeCompare(lastNameB);
	});

	sortedBartenders = sortedBartenders.filter(
		(bartender) => bartender.workingPosition !== "Bar Back"
	);

	sortedBartenders = sortedBartenders.filter(
		(bartender) => bartender.workingPosition !== "Cook"
	);

	sortedBarBacks = sortedBarBacks.filter(
		(barBack) => barBack.workingPosition !== "Bartender"
	);

	sortedBarBacks = sortedBarBacks.filter(
		(barBack) => barBack.workingPosition !== "Cook"
	);

	sortedCooks = sortedCooks.filter(
		(cook) => cook.workingPosition !== "Bar Back"
	);

	sortedCooks = sortedCooks.filter(
		(cook) => cook.workingPosition !== "Bartender"
	);

	const handleNextButtonClick = () => {
		// Redirect to the TipCalculationPage and pass workingEmployees as a query parameter
		router.push({
			pathname: "/creditTipCalculationPage", // Adjust the pathname based on your file structure
			query: { workingEmployees: JSON.stringify(workingEmployees) },
		});
	};
	return (
		<div className={` ${style.backgroundColor} `}>
			<Container>
				<h1 className={style.centerTitle}>Select Who's Working</h1>
				<Row className={style.centerContainer}>
					{/* Available Bartenders */}
					<div className={style.formContainer}>
						<Col>
							<h2
								className={`text-color ${style.centerTitle}`}
								htmlFor="exampleSelect"
							>
								Bartenders
							</h2>
							<div className={`text-color ${style.scrollableContainer}`}>
								{sortedBartenders.map((employee) => (
									<Row
										onClick={() =>
											handleCheckboxChange(
												employee,
												"Bartender",
												!employee.checked
											)
										}
										className={`${style.seperationLine} ${style.clickEmployee}`}
										key={employee.id}
									>
										<Col xs={8} sm={8} md={8}>
											<Label>{employee.label}</Label>
										</Col>
										<Col xs={4} sm={4} md={4}>
											<div
												className={
													employee.checked
														? style.checkedCheckbox
														: style.unCheckBox
												}
											></div>
										</Col>
									</Row>
								))}
							</div>
						</Col>
					</div>

					{/* Available Bar Back */}
					<div className={style.formContainer}>
						<Col>
							<h2
								className={`text-color ${style.centerTitle}`}
								htmlFor="exampleSelect"
							>
								Bar Backs
							</h2>
							<div className={`text-color ${style.scrollableContainer}`}>
								{sortedBarBacks.map((employee) => (
									<Row
										onClick={() =>
											handleCheckboxChange(
												employee,
												"Bar Back",
												!employee.checked
											)
										}
										className={`${style.seperationLine} ${style.clickEmployee}`}
										key={employee.id}
									>
										<Col xs={8} sm={8} md={8}>
											<Label>{employee.label}</Label>
										</Col>
										<Col xs={4} sm={4} md={4}>
											<div
												className={
													employee.checked
														? style.checkedCheckbox
														: style.unCheckBox
												}
											></div>
										</Col>
									</Row>
								))}
							</div>
						</Col>
					</div>

					{/* Available Cook */}
					<div className={style.formContainer}>
						<Col>
							<h2
								className={`text-color ${style.centerTitle}`}
								htmlFor="exampleSelect"
							>
								Cooks
							</h2>
							<div className={`text-color ${style.scrollableContainer}`}>
								{sortedCooks.map((employee) => (
									<Row
										onClick={() =>
											handleCheckboxChange(employee, "Cook", !employee.checked)
										}
										className={`${style.seperationLine} ${style.clickEmployee}`}
										key={employee.id}
									>
										<Col xs={8} sm={8} md={8}>
											<Label>{employee.label}</Label>
										</Col>
										<Col xs={4} sm={4} md={4}>
											<div
												className={
													employee.checked
														? style.checkedCheckbox
														: style.unCheckBox
												}
											></div>
										</Col>
									</Row>
								))}
							</div>
						</Col>
					</div>
				</Row>
				<Row className="justify-content-center mt-4 mb-5">
					<Button
						onClick={handleReset}
						className={`mx-2 ${style.centerButton}`}
					>
						Reset
					</Button>
					<Button
						onClick={handleNextButtonClick}
						className={`mx-2 ${style.centerButton}`}
					>
						Next
					</Button>
				</Row>
			</Container>
		</div>
	);
}
