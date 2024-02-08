import React, { useState, useEffect } from "react";
import style from "./SelectEmployee.module.css";
import { Button, Label, Row, Col, Container } from "reactstrap";
import AddGuestEmployee from "./AddGuestEmployee";

export default function SelectCook({
	sortedCooks,
	onClick,
	btn,
	submit,
	addNewEmployee,
}) {
	const [isMobile, setIsMobile] = useState(false);
	const updateScreenSize = () => {
		setIsMobile(window.innerWidth < 760);
	};

	// Use useEffect to update screen size on mount and window resize
	useEffect(() => {
		updateScreenSize();
		window.addEventListener("resize", updateScreenSize);
		return () => {
			window.removeEventListener("resize", updateScreenSize);
		};
	}, []);

	const checkedCooksCount = sortedCooks.filter(
		(bartender) => bartender.checked
	).length;

	return (
		<div>
			{isMobile ? (
				<Container>
					<div
						className={`${style.formContainerMobile} ${style.formContainer}`}
					>
						<Col>
							<h2
								className={`text-color ${style.centerTitle}`}
								htmlFor="exampleSelect"
							>
								Cooks
							</h2>
							<h5 className={`text-color ${style.centerTitle}`}>
								{" "}
								{checkedCooksCount} selected
							</h5>
							<div
								className={`text-color ${style.scrollableContainer} ${style.scrollableContainerMobile}`}
							>
								<AddGuestEmployee
									position="Cook"
									addNewEmployee={addNewEmployee}
								/>
								{sortedCooks.map((employee) => (
									<Row
										onClick={() => onClick(employee, "Cook", !employee.checked)}
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
					<Row className="justify-content-center mt-4 mb-1">
						<Button
							onClick={() => btn("BarBack")}
							className={`mx-2 ${style.centerButton}`}
						>
							Back
						</Button>
						<Button onClick={submit} className={`mx-2 ${style.centerButton}`}>
							Next
						</Button>
					</Row>
				</Container>
			) : (
				<div className={` ${style.formContainer}`}>
					<Col>
						<h2
							className={`text-color ${style.centerTitle}`}
							htmlFor="exampleSelect"
						>
							Cooks
						</h2>
						<h5 className={`text-color ${style.centerTitle}`}>
							{" "}
							{checkedCooksCount} selected
						</h5>

						<div className={`text-color ${style.scrollableContainer}`}>
							<AddGuestEmployee
								position="Cook"
								addNewEmployee={addNewEmployee}
							/>
							{sortedCooks.map((employee) => (
								<Row
									onClick={() => onClick(employee, "Cook", !employee.checked)}
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
			)}
		</div>
	);
}
