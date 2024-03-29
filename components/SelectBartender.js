import React, { useState, useEffect } from "react";
import style from "./SelectEmployee.module.css";
import { Button, Label, Row, Col, Container } from "reactstrap";
import AddGuestEmployee from "./AddGuestEmployee";
import { on } from "events";
import e from "cors";

export default function SelectBartender({
	onClick,
	sortedBartenders,
	btn,
	addNewEmployee,
	submitError,
}) {
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

	const checkedFillIn = sortedBartenders.filter((bartender) => {
		const fillIn = bartender.active === false && bartender.checked;
		return fillIn;
	});
	console.log(checkedFillIn);
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
								className={`text-color ${style.centerTitle}`}
								htmlFor="exampleSelect"
							>
								Bartenders
							</h2>
							<h5 className={`text-color ${style.centerTitle}`}>
								{" "}
								{checkedBartendersCount} selected
							</h5>

							<div
								className={`text-color }  ${style.scrollableContainer} ${style.scrollableContainerMobile}`}
							>
								<AddGuestEmployee
									position="Bartender"
									addNewEmployee={addNewEmployee}
									sortedBartenders={sortedBartenders}
									onClick={onClick}
								/>

								{sortedBartenders
									.filter(
										(employee) =>
											employee.active === true ||
											(employee.active === false && employee.checked)
									)
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
					<Row className="justify-content-center mt-4 mb-5">
						{submitError && (
							<Row>
								<Col className={`mx-2 secondary-color ${style.centerButton}`}>
									<h2 className={style.error}>{submitError}</h2>
								</Col>
							</Row>
						)}
						<Button
							onClick={() => btn("BarBack")}
							className={`mx-2 ${style.centerButton}`}
						>
							Next
						</Button>
					</Row>
				</Container>
			) : (
				<Container
					className={`${style.formContainerMobile} ${style.formContainer}`}
				>
					<Col>
						<h2
							className={`text-color ${style.centerTitle}`}
							htmlFor="exampleSelect"
						>
							Bartenders
						</h2>
						<h5 className={`text-color ${style.centerTitle}`}>
							{" "}
							{checkedBartendersCount} selected
						</h5>
						<div
							className={`text-color ${style.scrollableContainer} ${style.scrollableContainerMobile}`}
						>
							<AddGuestEmployee
								position="Bartender"
								addNewEmployee={addNewEmployee}
								sortedBartenders={sortedBartenders}
								onClick={onClick}
							/>

							{sortedBartenders
								.filter(
									(employee) =>
										employee.active === true ||
										(employee.active === false && employee.checked)
								)
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
