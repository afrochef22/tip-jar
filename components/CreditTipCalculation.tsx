import React, { useState } from "react";
import type { FormEvent } from "react";
import type { InputProps } from "reactstrap";
import {
	Button,
	Form,
	FormGroup,
	Label,
	Input,
	InputGroup,
	InputGroupText,
	Spinner,
} from "reactstrap";
import form from "./CreditTipForm.module.css";
import { useRouter } from "next/router";
import { CustomAlertModal } from "./ConformationDialog";
import { shiftDateTime } from "../lib/shiftDate";
import type { WorkerOption, WorkingPosition } from "../types/models";

export default function CreditTipCalculation({
	workingEmployees,
	selectedShow,
}: {
	workingEmployees: WorkerOption[];
	selectedShow: string;
}) {
	const router = useRouter();
	const [submitting, setSubmitting] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");

	const toggleModal = () => setIsOpen(!isOpen);

	const bartenders = workingEmployees.filter(
		(employee) => employee.workingPosition === "Bartender"
	);
	const barBacks = workingEmployees.filter(
		(employee) => employee.workingPosition === "Bar Back"
	);
	const cooks = workingEmployees.filter(
		(employee) => employee.workingPosition === "Cook"
	);

	const [isBartenderHoursClicked, setBartenderHoursClicked] = useState(false);
	const [isCookHoursClicked, setCookHoursClicked] = useState(false);
	const [isBarBackHoursClicked, setBarBackHoursClicked] = useState(false);

	const [defaultbarBackPercentage, setDefaultBarBackPercentage] = useState<number | string>(15);
	const handleIncrease = () => {
		setDefaultBarBackPercentage((prevPercentage) =>
			Math.min((Number(prevPercentage) || 0) + 1, 100)
		);
	};

	const handleDecrease = () => {

		setDefaultBarBackPercentage((prevPercentage) =>
			Math.max((Number(prevPercentage) || 0) - 1, 0)
		);
	};

	const handleCalculate = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setSubmitting(true);
		const formData = new FormData(e.currentTarget); // Create a FormData object from the form

		const tips = formData.get("totalTips");
		const isValidInput = /^\d*\.?\d{0,2}$/.test(String(tips));
		if (isValidInput === false) {
			setAlertMessage(
				"Please enter a valid number for the tips. The number can't have more than 2 decimal places."
			);
			toggleModal(); // Open the modal to display the alert message
			setSubmitting(false);

			return;
		}

		const employeeTips: Record<string, number> = {};
		const employeeHours: Record<string, number> = {};
		// Iterate through form data and pull out the per-employee tip/hours fields
		formData.forEach((value, key) => {
			const inputValue = formData.get("totalTips");

			// Check if the input value contains only numbers
			// const isValidInput = /^\d*\.?\d+$/.test(inputValue);

			const isValidId = (id: string) => {
				const regex = /^[0-9a-fA-F]{24}$/;
				const regexUUID =
					/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
				return regex.test(id) || regexUUID.test(id);
			};

			const regexTips =
				/^([\da-fA-F]{24}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})Tips$/;
			const regexHours =
				/^([\da-fA-F]{24}|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})Hours$/;

			const matchTips = key.match(regexTips);
			const matchHours = key.match(regexHours);

			if (matchTips && matchTips[1] && isValidId(matchTips[1])) {
				const employeeID = matchTips[1];
				employeeTips[employeeID] = Number(value);
			}

			if (matchHours && matchHours[1] && isValidId(matchHours[1])) {
				const employeeID = matchHours[1];
				employeeHours[employeeID] = Number(value);
			}
		});

		const totalTips = Number(formData.get("totalTips"));
		const barBackPercentageValue = formData.get("BarBackPercentage");
		const barBackPercentage =
			barBackPercentageValue === null ? 15 : Number(barBackPercentageValue);
		const foodSalesTotalValue = formData.get("FoodSalesTotal");
		const foodSalesTotal = foodSalesTotalValue ? Number(foodSalesTotalValue) : 0;
		const totalBarSales = Number(formData.get("BarSalesTotal")) || 0;
		const shiftNotes = formData.get("shiftNotes") ?? "";

		const withHours = (employee: WorkerOption) => ({
			...employee,
			tippedHours: employeeHours[employee.id] || 0,
		});
		const bartendersWithHoursAndTip = bartenders.map((bartender) => ({
			...withHours(bartender),
			tipsBroughtIn: employeeTips[bartender.id],
		}));

		router.push({
			pathname: "/TipBreakDownPage",
			query: {
				bartenders: JSON.stringify(bartendersWithHoursAndTip),
				barBacks: JSON.stringify(barBacks.map(withHours)),
				cooks: JSON.stringify(cooks.map(withHours)),
				barBackPercentage: JSON.stringify(barBackPercentage),
				foodSalesTotal: JSON.stringify(foodSalesTotal),
				employeeHours: JSON.stringify(employeeHours),
				employeeTipCollected: JSON.stringify(employeeTips),
				selectedShow: JSON.stringify(selectedShow),
				totalTips: JSON.stringify(totalTips),
				totalBarSales: JSON.stringify(totalBarSales),
				shiftNotes: JSON.stringify(shiftNotes),
			},
		});
	};

	const handleSwitchToggle = (position: WorkingPosition) => {
		switch (position) {
			case "Bartender":
				setBartenderHoursClicked(!isBartenderHoursClicked);
				break;
			case "Cook":
				setCookHoursClicked(!isCookHoursClicked);
				break;
			case "Bar Back":
				setBarBackHoursClicked(!isBarBackHoursClicked);
				break;
			default:
				break;
		}
	};

	const handleBackButtonClick = () => {
		// Redirect to the TipCalculationPage and pass workingEmployees as a query parameter
		router.push({
			pathname: "/SelectWorkingEmployee", // Adjust the pathname based on your file structure
		});
	};

	const shiftLabel = shiftDateTime().toFormat("ccc M/d");

	// One entry per role working tonight. "Split by hours" is only offered when
	// more than one person shares a role, matching the tip math.
	const groups = (
		[
		{
			title: "Bartenders",
			employees: bartenders,
			position: "Bartender",
			byHours: isBartenderHoursClicked,
		},
		{
			title: "Bar Backs",
			employees: barBacks,
			position: "Bar Back",
			byHours: isBarBackHoursClicked,
		},
		{
			title: "Cooks",
			employees: cooks,
			position: "Cook",
			byHours: isCookHoursClicked,
		},
		] satisfies { title: string; employees: WorkerOption[]; position: WorkingPosition; byHours: boolean }[]
	).filter((group) => group.employees.length > 0);

	const moneyInput = (id: string, label: string, props: InputProps = {}) => (
		<FormGroup className={form.field}>
			<Label for={id} className={form.label}>
				{label}
			</Label>
			<InputGroup>
				<InputGroupText>$</InputGroupText>
				<Input
					id={id}
					name={id}
					type="tel"
					inputMode="decimal"
					pattern="[0-9]+(\.[0-9]{1,2})?"
					step="0.01"
					placeholder="0.00"
					required
					{...props}
				/>
			</InputGroup>
		</FormGroup>
	);

	return (
		<div className={form.page}>
			<Form onSubmit={handleCalculate} className={form.form}>
				<div className={form.showHeader}>
					<div className={form.showName}>{selectedShow || "No show selected"}</div>
					<div className={form.showDate}>{shiftLabel}</div>
				</div>

				<section className={form.card}>
					{moneyInput("BarSalesTotal", "Bar sales")}
					{/* totalTips keeps its old id so the form and tests can find it. */}
					<FormGroup className={form.field}>
						<Label for="tipsCollected" className={form.label}>
							Credit card tips
						</Label>
						<InputGroup>
							<InputGroupText>$</InputGroupText>
							<Input
								id="tipsCollected"
								name="totalTips"
								type="tel"
								inputMode="decimal"
								pattern="[0-9]+(\.[0-9]{1,2})?"
								step="0.01"
								placeholder="0.00"
								required
								className={form.tipsInput}
							/>
						</InputGroup>
					</FormGroup>
					{cooks.length > 0 && moneyInput("FoodSalesTotal", "Food sales")}
					{barBacks.length > 0 && (
						<FormGroup className={`${form.field} ${form.inline}`}>
							<Label for="BarBackPercentage" className={form.label}>
								Bar back %
							</Label>
							<div className={form.stepper}>
								<Button
									type="button"
									className={form.stepButton}
									onClick={handleDecrease}
									aria-label="Decrease bar back percentage"
								>
									−
								</Button>
								<Input
									id="BarBackPercentage"
									name="BarBackPercentage"
									type="tel"
									inputMode="numeric"
									className={form.stepValue}
									value={defaultbarBackPercentage}
									onChange={(e) => setDefaultBarBackPercentage(e.target.value)}
								/>
								<Button
									type="button"
									className={form.stepButton}
									onClick={handleIncrease}
									aria-label="Increase bar back percentage"
								>
									+
								</Button>
							</div>
						</FormGroup>
					)}
					<FormGroup className={form.field}>
						<Label for="shiftNotes" className={form.label}>
							Notes <span className={form.optional}>(optional)</span>
						</Label>
						<Input id="shiftNotes" name="shiftNotes" type="textarea" rows={3} />
					</FormGroup>
				</section>

				<section className={form.card}>
					<h2 className={form.cardTitle}>Working tonight</h2>
					{groups.map((group) => (
						<div key={group.position} className={form.group}>
							<div className={form.groupTitle}>{group.title}</div>
							{group.employees.map((employee) =>
								group.byHours ? (
									<div key={employee.id} className={form.hoursRow}>
										<Label for={`${employee.id}Hours`} className={form.name}>
											{employee.label}
										</Label>
										<InputGroup className={form.hoursInput}>
											<Input
												id={`${employee.id}Hours`}
												name={`${employee.id}Hours`}
												type="tel"
												inputMode="decimal"
												pattern="[0-9]+(\.[0-9]{1,2})?"
												step="0.01"
												required
											/>
											<InputGroupText>hrs</InputGroupText>
										</InputGroup>
									</div>
								) : (
									<div key={employee.id} className={form.name}>
										{employee.label}
									</div>
								)
							)}
							{group.employees.length > 1 && (
								<FormGroup switch className={form.switch}>
									<Input
										type="switch"
										role="switch"
										id={`${group.position}ByHours`}
										onChange={() => handleSwitchToggle(group.position)}
										checked={group.byHours}
									/>
									<Label check for={`${group.position}ByHours`}>
										Split {group.title.toLowerCase()} by hours worked
									</Label>
								</FormGroup>
							)}
						</div>
					))}
				</section>

				<CustomAlertModal
					isOpen={isOpen}
					toggle={toggleModal}
					message={alertMessage}
				/>

				<div className={form.actions}>
					<Button type="button" className={form.backButton} onClick={handleBackButtonClick}>
						Back
					</Button>
					<Button type="submit" className={form.primaryButton} disabled={submitting}>
						{submitting ? (
							<>
								<Spinner size="sm" /> Loading…
							</>
						) : (
							"Review breakdown →"
						)}
					</Button>
				</div>
			</Form>
		</div>
	);
}
