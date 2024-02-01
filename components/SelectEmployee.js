import React, { useState, useEffect } from "react";
import {
	FormGroup,
	Form,
	Button,
	Label,
	Row,
	Col,
	Container,
} from "reactstrap";
import Select from "react-select";
import style from "./SelectEmployee.module.css";

export default function SelectEmployee({ employees }) {
	const [availableEmployees, setAvailableEmployees] = useState([]);
	const [selectedBartenders, setSelectedBartenders] = useState([]);
	const [selectedBarBacks, setSelectedBarBacks] = useState([]);
	const [selectedCooks, setSelectedCooks] = useState([]);

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

	const addWorkingBartender = (selectedEmployee) => {
		setSelectedBartenders((prev) => [...prev, selectedEmployee]);

		setAvailableEmployees((prev) =>
			prev.filter((value) => value.value !== selectedEmployee.value)
		);
	};

	const addWorkingBarBack = (selectedEmployee) => {
		setSelectedBarBacks((prev) => [...prev, selectedEmployee]);

		setAvailableEmployees((prev) =>
			prev.filter((value) => value.value !== selectedEmployee.value)
		);
	};

	const addWorkingCook = (selectedEmployee) => {
		setSelectedCooks((prev) => [...prev, selectedEmployee]);

		setAvailableEmployees((prev) =>
			prev.filter((value) => value.value !== selectedEmployee.value)
		);
	};

	const removeWorkingEmployee = (selectedEmployee) => {
		setAvailableEmployees((prev) => [...prev, selectedEmployee]);

		setSelectedBartenders((prev) =>
			prev.filter((value) => value.value !== selectedEmployee.value)
		);

		setSelectedBarBacks((prev) =>
			prev.filter((value) => value.value !== selectedEmployee.value)
		);
		setSelectedCooks((prev) =>
			prev.filter((value) => value.value !== selectedEmployee.value)
		);
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
		.filter((barBack) => barBack.position.includes("Bar Back"))
		.sort((a, b) => {
			const lastNameA = a.label.split(" ").pop(); // Get the last word as the last name
			const lastNameB = b.label.split(" ").pop(); // Get the last word as the last name

			return lastNameA.localeCompare(lastNameB);
		});

	const sortedCooks = availableEmployees
		.filter((cook) => cook.position.includes("Cook"))
		.sort((a, b) => {
			const lastNameA = a.label.split(" ").pop(); // Get the last word as the last name
			const lastNameB = b.label.split(" ").pop(); // Get the last word as the last name

			return lastNameA.localeCompare(lastNameB);
		});

	return (
		<div className={` ${style.backgroundColor} `}>
			<Container>
				<Row className={style.centerContainer}>
					{/* Available Bartenders */}
					<div className={style.formContainer}>
						<Col>
							<h2
								className={`text-color ${style.centerTitle}`}
								htmlFor="exampleSelect"
							>
								Available Bartenders
							</h2>
							<div className={`text-color ${style.scrollableContainer}`}>
								{sortedBartenders
									.filter((bartender) =>
										bartender.position.includes("Bartender")
									)
									.map((employee) => (
										<Row key={employee.value}>
											<Col xs={8} sm={8} md={8}>
												{employee.label}
											</Col>
											<Col xs={4} sm={4} md={4}>
												<Button onClick={() => addWorkingBartender(employee)}>
													+
												</Button>
											</Col>
										</Row>
									))}
							</div>
						</Col>
					</div>

					{/* Working Bartenders */}
					<div className={style.formContainer}>
						<Col>
							<h2
								className={`text-color ${style.centerTitle}`}
								htmlFor="exampleSelect"
							>
								Working Bartenders
							</h2>
							<div className={`text-color ${style.scrollableContainer}`}>
								{selectedBartenders
									.filter((bartender) =>
										bartender.position.includes("Bartender")
									)
									.map((employee) => (
										<Row key={employee.value}>
											<Col xs={8} sm={8} md={8}>
												{employee.label}
											</Col>
											<Col xs={4} sm={4} md={4}>
												<Button onClick={() => removeWorkingEmployee(employee)}>
													-
												</Button>
											</Col>
										</Row>
									))}
							</div>
						</Col>
					</div>
				</Row>

				<Row className={style.centerContainer}>
					{/* Available Bar Back */}
					<div className={style.formContainer}>
						<Col>
							<h2
								className={`text-color ${style.centerTitle}`}
								htmlFor="exampleSelect"
							>
								Available Bar Back
							</h2>
							<div className={`text-color ${style.scrollableContainer}`}>
								{sortedBarBacks
									.filter((barBack) => barBack.position.includes("Bar Back"))
									.map((employee) => (
										<Row key={employee.value}>
											<Col xs={8} sm={8} md={8}>
												{employee.label}
											</Col>
											<Col xs={4} sm={4} md={4}>
												<Button onClick={() => addWorkingBarBack(employee)}>
													+
												</Button>
											</Col>
										</Row>
									))}
							</div>
						</Col>
					</div>

					{/* Working Bar Back */}
					<div className={style.formContainer}>
						<Col>
							<h2
								className={`text-color ${style.centerTitle}`}
								htmlFor="exampleSelect"
							>
								Working Bar Back
							</h2>
							<div className={`text-color ${style.scrollableContainer}`}>
								{selectedBarBacks
									.filter((barBack) => barBack.position.includes("Bar Back"))
									.map((employee) => (
										<Row key={employee.value}>
											<Col xs={8} sm={8} md={8}>
												{employee.label}
											</Col>
											<Col xs={4} sm={4} md={4}>
												<Button onClick={() => removeWorkingEmployee(employee)}>
													-
												</Button>
											</Col>
										</Row>
									))}
							</div>
						</Col>
					</div>
				</Row>

				<Row className={style.centerContainer}>
					{/* Available Cook */}
					<div className={style.formContainer}>
						<Col>
							<h2
								className={`text-color ${style.centerTitle}`}
								htmlFor="exampleSelect"
							>
								Available Cook
							</h2>
							<div className={`text-color ${style.scrollableContainer}`}>
								{sortedCooks
									.filter((cook) => cook.position.includes("Cook"))
									.map((employee) => (
										<Row key={employee.value}>
											<Col xs={8} sm={8} md={8}>
												{employee.label}
											</Col>
											<Col xs={4} sm={4} md={4}>
												<Button onClick={() => addWorkingCook(employee)}>
													+
												</Button>
											</Col>
										</Row>
									))}
							</div>
						</Col>
					</div>

					{/* Working Cook */}
					<div className={style.formContainer}>
						<Col>
							<h2
								className={`text-color ${style.centerTitle}`}
								htmlFor="exampleSelect"
							>
								Working Cook
							</h2>
							<div className={`text-color ${style.scrollableContainer}`}>
								{selectedCooks
									.filter((cook) => cook.position.includes("Cook"))
									.map((employee) => (
										<Row key={employee.value}>
											<Col xs={8} sm={8} md={8}>
												{employee.label}
											</Col>
											<Col xs={4} sm={4} md={4}>
												<Button onClick={() => removeWorkingEmployee(employee)}>
													-
												</Button>
											</Col>
										</Row>
									))}
							</div>
						</Col>
					</div>
				</Row>
				<Row>
					<Button className={`mx-auto mt-3 ${style.centerButton}`}>Next</Button>
				</Row>
			</Container>
		</div>
	);
}
