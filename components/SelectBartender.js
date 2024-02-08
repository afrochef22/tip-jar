import React, { useState, useEffect } from "react";
import style from "./SelectEmployee.module.css";
import { Button, Label, Row, Col, Container } from "reactstrap";

export default function SelectBartender({ onClick, sortedBartenders, btn }) {
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
					</div>
					<Row className="justify-content-center mt-4 mb-5">
						<Button
							onClick={() => btn("BarBack")}
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
							Bartenders
						</h2>
						<div className={`text-color ${style.scrollableContainer}`}>
							{sortedBartenders.map((employee) => (
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
				</div>
			)}
		</div>
	);
}
