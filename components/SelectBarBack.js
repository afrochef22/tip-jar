import React, { useState, useEffect } from "react";
import style from "./SelectEmployee.module.css";
import { Button, Label, Row, Col, Container } from "reactstrap";

export default function SelectBarBack({ onClick, sortedBarBacks, btn }) {
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
								Bar Backs
							</h2>
							<div
								className={`text-color ${style.scrollableContainer} ${style.scrollableContainerMobile}`}
							>
								{sortedBarBacks.map((employee) => (
									<Row
										onClick={() =>
											onClick(employee, "Bar Back", !employee.checked)
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
					<Row className="justify-content-center mt-4 mb-1">
						<Button
							onClick={() => btn("Bartender")}
							className={`mx-2 ${style.centerButton}`}
						>
							Back
						</Button>
						<Button
							onClick={() => btn("Cook")}
							className={`mx-2 ${style.centerButton}`}
						>
							Next
						</Button>
					</Row>
				</Container>
			) : (
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
										onClick(employee, "Bar Back", !employee.checked)
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
			)}
		</div>
	);
}
