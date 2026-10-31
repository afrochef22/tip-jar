import React, { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { NextRouter } from "next/router";
import {
	Form,
	Label,
	Input,
	Button,
	FormGroup,
	InputGroup,
	InputGroupText,
} from "reactstrap";
import form from "./CreditTipForm.module.css";
import type { CashPerson } from "../lib/cashSplit";

// One row in the cash form. `hours` is "" until typed, and 0 after hours are
// turned off.
export type CashWorker = CashPerson & { name: string };

export type CashTipValues = {
	tipsCollected: number | string;
	barBackPercentage: number | string; // a string once typed into the input
	bartenders: CashWorker[];
	barBacks: CashWorker[];
};

const makePeople = (title: string, count: number): CashWorker[] =>
	Array.from({ length: count }, (_, i) => ({ name: `${title} ${i + 1}`, hours: "" }));

const hasHours = (people: CashWorker[]) => people.some((person) => parseFloat(String(person.hours)) > 0);

// Opens the cash breakdown for the numbers entered.
export const showCashBreakdown = (
	router: NextRouter,
	{ tipsCollected, barBackPercentage, bartenders, barBacks }: CashTipValues
) =>
	router.push({
		pathname: "/CashTipBreakDownPage",
		query: {
			numberOfBarBacks: JSON.stringify(barBacks.length),
			numberOfBartenders: JSON.stringify(bartenders.length),
			tipsCollected: JSON.stringify(parseFloat(String(tipsCollected)) || 0),
			barBacks: JSON.stringify(barBacks),
			bartenders: JSON.stringify(bartenders),
			barBackPercentage: JSON.stringify(barBackPercentage),
			isBartenderHoursClicked: hasHours(bartenders),
			isBarBackHoursClicked: hasHours(barBacks),
		},
	});

// Cash tips, bar back %, and who worked. Used by the Cash Tip Calculator page
// and the cash breakdown's edit window; `initial` fills it in for editing.
export default function CashTipForm({
	initial = {},
	onSubmit,
	submitLabel,
	children,
}: {
	initial?: Partial<CashTipValues>;
	onSubmit: (values: CashTipValues) => void;
	submitLabel: string;
	children?: ReactNode;
}) {
	const [barBackPercentage, setBarBackPercentage] = useState<number | string>(initial.barBackPercentage ?? 15);
	const [tipsCollected, setTipsCollected] = useState(
		initial.tipsCollected ? Number(initial.tipsCollected).toFixed(2) : ""
	);
	const [bartenders, setBartenders] = useState(
		initial.bartenders?.length ? initial.bartenders : makePeople("Bartender", 1)
	);
	const [barBacks, setBarBacks] = useState(initial.barBacks ?? makePeople("Bar Back", 1));
	const [isBartenderHoursClicked, setBartenderHoursClicked] = useState(hasHours(bartenders));
	const [isBarBackHoursClicked, setBarBackHoursClicked] = useState(hasHours(barBacks));

	const groups = [
		{
			title: "Bar Backs",
			single: "Bar Back",
			people: barBacks,
			setPeople: setBarBacks,
			min: 0,
			byHours: isBarBackHoursClicked,
			setByHours: setBarBackHoursClicked,
		},
		{
			title: "Bartenders",
			single: "Bartender",
			people: bartenders,
			setPeople: setBartenders,
			min: 1,
			byHours: isBartenderHoursClicked,
			setByHours: setBartenderHoursClicked,
		},
	];

	// Changing how many people worked starts their hours over.
	type Group = (typeof groups)[number];

	const changeCount = (group: Group, change: number) => {
		const count = Math.min(Math.max(group.people.length + change, group.min), 20);
		group.setPeople(makePeople(group.single, count));
		if (count < 2) group.setByHours(false);
	};

	const changeHours = (group: Group, index: number, hours: string) => {
		group.setPeople((people) =>
			people.map((person, i) => (i === index ? { ...person, hours } : person))
		);
	};

	const toggleByHours = (group: Group) => {
		// Turning hours off clears them so the split goes back to even shares.
		if (group.byHours) {
			group.setPeople((people) => people.map((person) => ({ ...person, hours: 0 })));
		}
		group.setByHours(!group.byHours);
	};

	const changePercentage = (change: number) => {
		setBarBackPercentage((percentage) =>
			Math.min(Math.max((parseInt(String(percentage), 10) || 0) + change, 0), 100)
		);
	};

	const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		onSubmit({ tipsCollected, barBackPercentage, bartenders, barBacks });
	};

	const stepper = (
		label: string,
		value: ReactNode,
		onDecrease: () => void,
		onIncrease: () => void,
		input?: ReactNode
	) => (
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
		<Form onSubmit={handleSubmit} className={form.form}>
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
				{children}
				<Button type="submit" className={form.primaryButton}>
					{submitLabel}
				</Button>
			</div>
		</Form>
	);
}
