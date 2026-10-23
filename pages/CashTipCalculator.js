import React, { useState } from "react";
import { useRouter } from "next/router";

import {
	Form,
	Label,
	Input,
	Button,
	FormGroup,
	InputGroup,
	InputGroupText,
} from "reactstrap";
import form from "../components/CreditTipForm.module.css";

const makePeople = (title, count) =>
	Array.from({ length: count }, (_, i) => ({ name: `${title} ${i + 1}`, hours: "" }));

export default function CashTipCalculator() {
	const router = useRouter();

	const [barBackPercentage, setBarBackPercentage] = useState(15);
	const [tipsCollected, setTipsCollected] = useState("");
	const [bartenders, setBartenders] = useState(makePeople("Bartender", 1));
	const [barBacks, setBarBacks] = useState(makePeople("Bar Back", 1));
	const [isBartenderHoursClicked, setBartenderHoursClicked] = useState(false);
	const [isBarBackHoursClicked, setBarBackHoursClicked] = useState(false);

	const groups = [
		{
			title: "Bartenders",
			single: "Bartender",
			people: bartenders,
			setPeople: setBartenders,
			min: 1,
			byHours: isBartenderHoursClicked,
			setByHours: setBartenderHoursClicked,
		},
		{
			title: "Bar Backs",
			single: "Bar Back",
			people: barBacks,
			setPeople: setBarBacks,
			min: 0,
			byHours: isBarBackHoursClicked,
			setByHours: setBarBackHoursClicked,
		},
	];

	// Changing how many people worked starts their hours over.
	const changeCount = (group, change) => {
		const count = Math.min(Math.max(group.people.length + change, group.min), 20);
		group.setPeople(makePeople(group.single, count));
		if (count < 2) group.setByHours(false);
	};

	const changeHours = (group, index, hours) => {
		group.setPeople((people) =>
			people.map((person, i) => (i === index ? { ...person, hours } : person))
		);
	};

	const toggleByHours = (group) => {
		// Turning hours off clears them so the split goes back to even shares.
		if (group.byHours) {
			group.setPeople((people) => people.map((person) => ({ ...person, hours: 0 })));
		}
		group.setByHours(!group.byHours);
	};

	const changePercentage = (change) => {
		setBarBackPercentage((percentage) =>
			Math.min(Math.max((parseInt(percentage, 10) || 0) + change, 0), 100)
		);
	};

	const handleCalculate = (e) => {
		e.preventDefault();

		router.push({
			pathname: "/CashTipBreakDownPage",
			query: {
				numberOfBarBacks: JSON.stringify(barBacks.length),
				numberOfBartenders: JSON.stringify(bartenders.length),
				tipsCollected: JSON.stringify(parseFloat(tipsCollected) || 0),
				barBacks: JSON.stringify(barBacks),
				bartenders: JSON.stringify(bartenders),
				barBackPercentage: JSON.stringify(barBackPercentage),
				isBartenderHoursClicked: isBartenderHoursClicked,
				isBarBackHoursClicked: isBarBackHoursClicked,
			},
		});
	};

	const stepper = (label, value, onDecrease, onIncrease, input) => (
		<div className={form.stepper}>
			<Button
				type="button"
				className={form.stepButton}
				onClick={onDecrease}
				aria-label={`Decrease ${label}`}
			>
				−
			</Button>
			{input || (
				<div className={`${form.stepValue} ${form.stepCount}`} aria-live="polite">
					{value}
				</div>
			)}
			<Button
				type="button"
				className={form.stepButton}
				onClick={onIncrease}
				aria-label={`Increase ${label}`}
			>
				+
			</Button>
		</div>
	);

	return (
		<div className={form.page}>
			<Form onSubmit={handleCalculate} className={form.form}>
				<h1 className={form.pageTitle}>Cash Tip Calculator</h1>

				<section className={form.card}>
					<FormGroup className={form.field}>
						<Label for="CashTips" className={form.label}>
							Cash tips collected
						</Label>
						<InputGroup>
							<InputGroupText>$</InputGroupText>
							<Input
								id="CashTips"
								name="CashTips"
								type="tel"
								inputMode="decimal"
								pattern="[0-9]+(\.[0-9]{1,2})?"
								placeholder="0.00"
								required
								className={form.tipsInput}
								value={tipsCollected}
								onChange={(e) => setTipsCollected(e.target.value)}
							/>
						</InputGroup>
					</FormGroup>
					{barBacks.length > 0 && (
						<FormGroup className={`${form.field} ${form.inline}`}>
							<Label for="BarBackPercentage" className={form.label}>
								Bar back %
							</Label>
							{stepper(
								"bar back percentage",
								barBackPercentage,
								() => changePercentage(-1),
								() => changePercentage(1),
								<Input
									id="BarBackPercentage"
									name="BarBackPercentage"
									type="tel"
									inputMode="numeric"
									className={form.stepValue}
									value={barBackPercentage}
									onChange={(e) => setBarBackPercentage(e.target.value)}
								/>
							)}
						</FormGroup>
					)}
				</section>

				<section className={form.card}>
					<h2 className={form.cardTitle}>Working tonight</h2>
					{groups.map((group) => (
						<div key={group.title} className={form.group}>
							<div className={`${form.field} ${form.inline}`}>
								<div className={form.label}>{group.title}</div>
								{stepper(
									`number of ${group.title.toLowerCase()}`,
									group.people.length,
									() => changeCount(group, -1),
									() => changeCount(group, 1)
								)}
							</div>
							{group.byHours &&
								group.people.map((person, index) => (
									<div key={person.name} className={form.hoursRow}>
										<Label for={`${person.name}Hours`} className={form.name}>
											{person.name}
										</Label>
										<InputGroup className={form.hoursInput}>
											<Input
												id={`${person.name}Hours`}
												name={`${person.name}Hours`}
												type="tel"
												inputMode="decimal"
												pattern="[0-9]+(\.[0-9]{1,2})?"
												required
												value={person.hours || ""}
												onChange={(e) => changeHours(group, index, e.target.value)}
											/>
											<InputGroupText>hrs</InputGroupText>
										</InputGroup>
									</div>
								))}
							{group.people.length > 1 && (
								<FormGroup switch className={form.switch}>
									<Input
										type="switch"
										role="switch"
										id={`${group.single}ByHours`}
										onChange={() => toggleByHours(group)}
										checked={group.byHours}
									/>
									<Label check for={`${group.single}ByHours`}>
										Split {group.title.toLowerCase()} by hours worked
									</Label>
								</FormGroup>
							)}
						</div>
					))}
				</section>

				<div className={form.actions}>
					<Button type="submit" className={form.primaryButton}>
						Calculate →
					</Button>
				</div>
			</Form>
		</div>
	);
}
