import React, { useState, useEffect } from "react";
import style from "./SelectEmployee.module.css";
import { Button, Label, Row, Col, Container } from "reactstrap";
import AddGuestEmployee from "./AddGuestEmployee";

export default function SelectNonActiveBartender({
	onClick,
	sortedBartenders,
	sortedBarBacks,
	sortedCooks,
	btn,
	addNewEmployee,
	position,
}) {
	console.log("baratenders: ", sortedBartenders);
	console.log("bar backs: ", sortedBarBacks);
	console.log("cooks: ", sortedCooks);

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

	const checkedEmployeesCount = () => {
		let num = "";
		if (sortedBartenders) {
			num = sortedBartenders.filter((bartender) => bartender.checked).length;
			return num;
		}
		if (sortedBarBacks) {
			num = sortedBarBacks.filter((barBack) => barBack.checked).length;
			return num;
		}
		if (sortedCooks) {
			num = sortedCooks.filter((cook) => cook.checked).length;
			return num;
		}
	};
	const sortedEmployees = () => {
		let sort = [];
		if (sortedBartenders) {
			sort = sortedBartenders;
			return sort;
		}
		if (sortedBarBacks) {
			sort = sortedBarBacks;
			return sort;
		}
		if (sortedCooks) {
			sort = sortedCooks;
			return sort;
		}
	};

	return (
		<div>
			{isMobile ? (
				<Container>
					<Row
						className={`${style.formContainerMobile} ${style.formContainer}`}
					>
						<Col>
							<h2
								className={`third-color ${style.centerTitle}`}
								htmlFor="exampleSelect"
							>
								Bartenders
							</h2>
							<h5 className={`third-color ${style.centerTitle}`}>
								{" "}
								{checkedEmployeesCount()} selected
							</h5>

							<div
								className={`third-color  ${style.scrollableContainer} ${style.scrollableContainerMobile}`}
							>
								{sortedEmployees()
									.filter((employee) => employee.active === false)
									.map((employee) => (
										<Row
											onClick={() =>
												onClick(employee, position, !employee.checked)
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
					</Row>
				</Container>
			) : (
				<Container
					className={` ${style.formContainerMobile} ${style.formContainer}`}
				>
					<Col>
						<h2
							className={`third-color ${style.centerTitle}`}
							htmlFor="exampleSelect"
						>
							Bartenders
						</h2>
						<h5 className={`third-color ${style.centerTitle}`}>
							{" "}
							{checkedEmployeesCount()} selected
						</h5>
						<div
							className={`third-color ${style.scrollableContainer} ${style.scrollableContainerMobile}`}
						>
							{/* <AddGuestEmployee
								position="Bartender"
								addNewEmployee={addNewEmployee}
							/> */}

							{sortedEmployees()
								.filter((employee) => employee.active === false)
								.map((employee) => (
									<Row
										onClick={() =>
											onClick(employee, position, !employee.checked)
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
				</Container>
			)}
		</div>
	);
}
