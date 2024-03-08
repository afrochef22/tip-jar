import React, { useState, useEffect } from "react";
import style from "./SelectEmployee.module.css";
import { Button, Label, Row, Col, Container } from "reactstrap";
import AddGuestEmployee from "./AddGuestEmployee";

export default function SelectNonActiveBarBack({
	onClick,
	sortedBarBacks,
	btn,
	addNewEmployee,
}) {
	console.log(sortedBarBacks);
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

	const checkedBarBackCount = sortedBarBacks.filter(
		(barBack) => barBack.checked
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
								Bar Backs
							</h2>
							<h5 className={`third-color ${style.centerTitle}`}>
								{" "}
								{checkedBarBackCount} selected
							</h5>

							<div
								className={`third-color  ${style.scrollableContainer} ${style.scrollableContainerMobile}`}
							>
								{sortedBarBacks
									.filter((employee) => employee.active === false)
									.map((employee) => (
										<Row
											onClick={() =>
												onClick(employee, "barBack", !employee.checked)
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
							Bar Backs
						</h2>
						<h5 className={`third-color ${style.centerTitle}`}>
							{" "}
							{checkedBarBackCount} selected
						</h5>
						<div
							className={`third-color ${style.scrollableContainer} ${style.scrollableContainerMobile}`}
						>
							{sortedBarBacks
								.filter((employee) => employee.active === false)
								.map((employee) => (
									<Row
										onClick={() =>
											onClick(employee, "barBack", !employee.checked)
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
