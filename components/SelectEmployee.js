import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
	FormGroup,
	Form,
	Button,
	Label,
	Row,
	Col,
	Container,
	Input,
} from "reactstrap";
import Select from "react-select";
import style from "./SelectEmployee.module.css";

export default function SelectEmployee({ employees }) {
	const router = useRouter();
	const [allEmployees, setAllEmployees] = useState([]);
	const [workingEmployees, setWorkingEmployees] = useState([]);

	const [bartenderList, setBartenderList] = useState([]);
	const [barBacksList, setBarBacksList] = useState([]);
	const [cooksList, setCooksList] = useState([]);

	useEffect(() => {
		const options = employees.map((employee) => {
			return {
				value: employee._id,
				label: `${employee.firstName} ${employee.lastName}`,
				position: employee.position || [],
			};
		});
		setAllEmployees(options);
	}, [employees]);

	useEffect(() => {
		const BarBacks = allEmployees.filter((barBack) =>
			barBack.position.includes("Bar Back")
		);
		setBarBacksList(BarBacks);

		const Bartenders = allEmployees.filter((bartender) =>
			bartender.position.includes("Bartender")
		);
		setBartenderList(Bartenders);

		const Cooks = allEmployees.filter((barBack) =>
			barBack.position.includes("Cook")
		);
		setCooksList(Cooks);
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
					prev.filter((value) => value.value !== selectedEmployee.value)
				);
				setCooksList((prev) =>
					prev.filter((value) => value.value !== selectedEmployee.value)
				);
				break;
			case "Bar Back":
				setBartenderList((prev) =>
					prev.filter((value) => value.value !== selectedEmployee.value)
				);
				setCooksList((prev) =>
					prev.filter((value) => value.value !== selectedEmployee.value)
				);
				break;
			case "Cook":
				setBartenderList((prev) =>
					prev.filter((value) => value.value !== selectedEmployee.value)
				);
				setBarBacksList((prev) =>
					prev.filter((value) => value.value !== selectedEmployee.value)
				);
				break;
			default:
				break;
		}
	};

	const removeWorkingEmployee = (selectedEmployee, position) => {
		setWorkingEmployees((prev) =>
			prev.filter((value) => value.value !== selectedEmployee.value)
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
	const sortedBartenders = bartenderList.sort((a, b) => {
		const lastNameA = a.label.split(" ").pop(); // Get the last word as the last name
		const lastNameB = b.label.split(" ").pop();

		return lastNameA.localeCompare(lastNameB);
	});

	const sortedBarBacks = barBacksList.sort((a, b) => {
		const lastNameA = a.label.split(" ").pop();
		const lastNameB = b.label.split(" ").pop();

		return lastNameA.localeCompare(lastNameB);
	});

	const sortedCooks = cooksList.sort((a, b) => {
		const lastNameA = a.label.split(" ").pop();
		const lastNameB = b.label.split(" ").pop();

		return lastNameA.localeCompare(lastNameB);
	});

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
									<Row className={style.seperationLine} key={employee.value}>
										<Col xs={8} sm={8} md={8}>
											<Label>{employee.label}</Label>
										</Col>
										<Col xs={4} sm={4} md={4}>
											<Input
												type="checkbox"
												onChange={(e) =>
													handleCheckboxChange(
														employee,
														"Bartender",
														e.target.checked
													)
												}
											/>
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
									<Row className={style.seperationLine} key={employee.value}>
										<Col xs={8} sm={8} md={8}>
											<Label>{employee.label}</Label>
										</Col>
										<Col xs={4} sm={4} md={4}>
											<Input
												type="checkbox"
												onChange={(e) =>
													handleCheckboxChange(
														employee,
														"Bar Back",
														e.target.checked
													)
												}
											/>
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
									<Row className={style.seperationLine} key={employee.value}>
										<Col xs={8} sm={8} md={8}>
											<Label>{employee.label}</Label>
										</Col>
										<Col xs={4} sm={4} md={4}>
											<Input
												type="checkbox"
												onChange={(event) =>
													handleCheckboxChange(
														employee,
														"Cook",
														event.target.checked
													)
												}
											/>
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
