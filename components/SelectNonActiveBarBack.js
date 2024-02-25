import React, { useState, useEffect } from "react";
import style from "./SelectEmployee.module.css";
import { Button, Label, Row, Col, Container } from "reactstrap";
import AddGuestEmployee from "./AddGuestEmployee";

export default function SelectNonActiveBarBack({
	onClick,
	sortedBartenders,
	btn,
	addNewEmployee,
}) {
	console.log(sortedBartenders);
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

	const checkedBartendersCount = sortedBartenders.filter(
		(bartender) => bartender.checked
	).length;

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
								{checkedBartendersCount} selected
							</h5>

							<div
								className={`third-color  ${style.scrollableContainer} ${style.scrollableContainerMobile}`}
							>
								{sortedBartenders
									.filter((employee) => employee.active === false)
									.map((employee) => (
										<Row
											onClick={() =>
												onClick(employee, "Bartender", !employee.checked)
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
							{checkedBartendersCount} selected
						</h5>
						<div
							className={`third-color ${style.scrollableContainer} ${style.scrollableContainerMobile}`}
						>
							{/* <AddGuestEmployee
								position="Bartender"
								addNewEmployee={addNewEmployee}
							/> */}

							{sortedBartenders
								.filter((employee) => employee.active === false)
								.map((employee) => (
									<Row
										onClick={() =>
											onClick(employee, "Bartender", !employee.checked)
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
