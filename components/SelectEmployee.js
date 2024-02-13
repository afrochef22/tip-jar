import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button, Label, Row, Col, Container } from "reactstrap";
import style from "./SelectEmployee.module.css";
import SelectEmployeeDisplay from "./SelectEmployeeDisplay";
import SelectBartender from "./SelectBartender";
import SelectBarBack from "./SelectBarBack";
import SelectCook from "./SelectCook";
import { CurrentShift, ShowDateComparer } from "./CurrentShift";

export default function SelectEmployee({ employees }) {
	const router = useRouter();
	const [allEmployees, setAllEmployees] = useState([]);
	const [workingEmployees, setWorkingEmployees] = useState([]);

	const [bartenderList, setBartenderList] = useState([]);
	const [barBacksList, setBarBacksList] = useState([]);
	const [cooksList, setCooksList] = useState([]);

	const [nextBtn, setNextBtn] = useState("Bartender");

	const [isMobile, setIsMobile] = useState(false);
	const updateScreenSize = () => {
		setIsMobile(window.innerWidth < 875);
	};

	// Use useEffect to update screen size on mount and window resize
	useEffect(() => {
		updateScreenSize();
		window.addEventListener("resize", updateScreenSize);
		return () => {
			window.removeEventListener("resize", updateScreenSize);
		};
	}, []);

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

	const addNewEmployee = (newEmployeeData) => {
		setAllEmployees([...allEmployees, newEmployeeData]);
		setWorkingEmployees(() => [...workingEmployees, newEmployeeData]);
	};
	console.log(allEmployees);

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
		setNextBtn("Bartender");

		document.querySelectorAll('input[type="checkbox"]').forEach((checkbox) => {
			checkbox.checked = false;
		});
		router.push({
			pathname: "/SelectWorkingEmployee", // Adjust the pathname based on your file structure
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

	const handleNextBtn = (position) => {
		setNextBtn(position);
	};

	const handleSubmitButtonClick = () => {
		// Redirect to the TipCalculationPage and pass workingEmployees as a query parameter
		router.push({
			pathname: "/creditTipCalculationPage", // Adjust the pathname based on your file structure
			query: { workingEmployees: JSON.stringify(workingEmployees) },
		});
	};
	return (
		<div className={` ${style.backgroundColor} `}>
			<Container fluid className={style.background}>
				<CurrentShift />
				<h1 className={style.centerTitle}>Credit Card Tip Calculator</h1>
				<h3 className={style.centerTitle}>Select Who's Working</h3>
				<Row className={style.centerContainer}>
					{isMobile ? (
						<SelectEmployeeDisplay
							position={nextBtn}
							handleCheckboxChange={handleCheckboxChange}
							sortedBarBacks={sortedBarBacks}
							sortedBartenders={sortedBartenders}
							sortedCooks={sortedCooks}
							btn={handleNextBtn}
							submit={handleSubmitButtonClick}
							addNewEmployee={addNewEmployee}
						/>
					) : (
						<Container fluid>
							<Row>
								<Col className={style.selectEmp}>
									<SelectBartender
										sortedBartenders={sortedBartenders}
										onClick={handleCheckboxChange}
										addNewEmployee={addNewEmployee}
									/>
								</Col>
								<Col className={style.selectEmp}>
									<SelectBarBack
										sortedBarBacks={sortedBarBacks}
										onClick={handleCheckboxChange}
										addNewEmployee={addNewEmployee}
									/>
								</Col>
								<Col className={style.selectEmp}>
									<SelectCook
										sortedCooks={sortedCooks}
										onClick={handleCheckboxChange}
										addNewEmployee={addNewEmployee}
									/>
								</Col>
							</Row>
						</Container>
					)}
				</Row>
				<Row className="justify-content-center">
					{nextBtn === "Bartender" ? (
						<></>
					) : (
						<>
							<Button
								onClick={handleReset}
								className={`mx-2 ${style.centerButton}`}
							>
								Reset
							</Button>
						</>
					)}
					{isMobile ? (
						<></>
					) : (
						<Button
							onClick={handleSubmitButtonClick}
							className={`mx-2 ${style.centerButton}`}
						>
							Next
						</Button>
					)}
				</Row>
			</Container>
		</div>
	);
}
