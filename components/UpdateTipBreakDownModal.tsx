import React, { useState, useEffect, memo, forwardRef } from "react";
import type { ChangeEvent, InputHTMLAttributes } from "react";
import type { ModalProps } from "reactstrap";
import { splitCreditTips } from "../lib/tipSplit";
import { NumericFormat } from "react-number-format";
import {
	Form,
	FormGroup,
	Button,
	Label,
	Input,
	Modal,
	ModalHeader,
	ModalFooter,
	Col,
	Container,
	Row,
	InputGroup,
	InputGroupText,
} from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock, faSackDollar } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/router";
import { DeleteDialog } from "./ConformationDialog";
import style from "./TipBreakDown.module.css";
import form from "./CreditTipForm.module.css";
import { money } from "../lib/money";
import { text } from "../lib/field";
import type { SavedAmount, TipBreakdown } from "../types/models";

// The hours boxes have always been <input type="number">. react-number-format's
// types don't allow that type (BUGS_FOUND.md), so it's set here, on the same
// input element the library would render, with the same ref and props.
const NumberTypeInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
	function NumberTypeInput(props, ref) {
		return <input {...props} ref={ref} type="number" />;
	}
);

// Saved dates look like 10/5/2026; the date box needs 2026-10-05.
const toDateInput = (date: string) => {
	const [month, day, year] = String(date || "").split("/");
	if (!year) return "";
	return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
};

// React passes its legacy context ({}) as the second argument; it's spread
// into the Modal below.
const UpdateTipBreakDown = ({ breakDown }: { breakDown: TipBreakdown }, args?: Partial<ModalProps>) => {
	const [modal, setModal] = useState(false);
	const [show, setShow] = useState(breakDown.show);
	const [date, setDate] = useState(breakDown.date);
	const [totalTips, setTotalTips] = useState<SavedAmount>(breakDown.totalTips);
	const [foodSales, setFoodSales] = useState<SavedAmount>(breakDown.foodSales);
	const [barBackPercentage, setBarBackPercentage] = useState<number | string>(
		breakDown.barBackPercentage
	);
	const [cookTipsData, setCookTipsData] = useState(breakDown.cookTips);
	const [barBackTipsData, setBarBackTipsData] = useState(breakDown.barBackTips);
	const [bartenderTipsData, setBartenderTipsData] = useState(
		breakDown.BartenderTips
	);
	const [tipsPerBarBack, setTipsPerBarBack] = useState(
		breakDown.tipsPerBarBack
	);
	const [tipsPerBartender, setTipsPerBartender] = useState(
		breakDown.tipsPerBartender
	);
	const [tipsPerCook, setTipsPerCook] = useState(breakDown.tipsPerCook);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [totalBarSales, setTotalBarSales] = useState<SavedAmount | undefined>(breakDown.totalBarSales);
	const [shiftNotes, setShiftNotes] = useState(breakDown.shiftNotes);
	const [saveError, setSaveError] = useState("");

	const router = useRouter();

	const toggle = () => {
		setSaveError("");
		setModal(!modal);
	};

	const handleShowChange = (e: ChangeEvent<HTMLInputElement>) => {
		setShow(e.target.value);
	};

	const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
		const dateString = e.target.value; // Example date string in YYYY-MM-DD format
		if (!dateString) return;
		const parts = dateString.split("-");
		const day = parseInt(parts[2], 10); // Convert day to integer
		const formattedDay = day.toString(); // Convert day back to string to remove leading zero
		const formattedDate = `${parts[1]}/${formattedDay}/${parts[0]}`;
		setDate(formattedDate);
	};

	const handleTotalBarSalesChange = (e: ChangeEvent<HTMLInputElement>) => {
		setTotalBarSales(e.target.value);
	};
	const handleShiftNotesChange = (e: ChangeEvent<HTMLInputElement>) => {
		setShiftNotes(e.target.value);
	};
	const handleTotalTipChange = (e: ChangeEvent<HTMLInputElement>) => {
		setTotalTips(e.target.value);
	};

	const handleFoodSalesChange = (e: ChangeEvent<HTMLInputElement>) => {
		setFoodSales(e.target.value);
	};
	const handleIncrease = () => {
		setBarBackPercentage((prevPercentage) => Math.min((Number(prevPercentage) || 0) + 1, 100));
	};

	const handleDecrease = () => {
		setBarBackPercentage((prevPercentage) => Math.max((Number(prevPercentage) || 0) - 1, 0));
	};

	const setCookHours = (cookId: string, newHours: string) => {
		parseFloat(newHours);
		const updatedCookTipsData = cookTipsData.map((cook) => {
			if (cook.id === cookId) {
				return { ...cook, tippedHours: Number(newHours) };
			}
			return cook; // Return the unchanged bartender if it's not the one to be updated
		});
		setCookTipsData(updatedCookTipsData);
	};

	const setBarBackHours = (barBackId: string, newHours: string) => {
		parseFloat(newHours);
		const updatedBarBackTipsData = barBackTipsData.map((barBack) => {
			if (barBack.id === barBackId) {
				return { ...barBack, tippedHours: Number(newHours) };
			}
			return barBack; // Return the unchanged barBack if it's not the one to be updated
		});
		setBarBackTipsData(updatedBarBackTipsData);
	};

	const setBartenderHours = (bartenderId: string, newHours: string) => {
		parseFloat(newHours);
		const updatedBartenderTipsData = bartenderTipsData.map((bartender) => {
			if (bartender.id === bartenderId) {
				return { ...bartender, tippedHours: Number(newHours) };
			}
			return bartender; // Return the unchanged bartender if it's not the one to be updated
		});
		setBartenderTipsData(updatedBartenderTipsData);
	};

	const bartenderHours = bartenderTipsData
		.map((bartender) => bartender.tippedHours || 0)
		.reduce((acc, tippedHours) => acc + tippedHours, 0);

	const barBackHours = barBackTipsData
		.map((barBack) => barBack.tippedHours || 0)
		.reduce((acc, tippedHours) => acc + tippedHours, 0);

	const cookHours = cookTipsData
		.map((cook) => cook.tippedHours || 0)
		.reduce((acc, tippedHours) => acc + tippedHours, 0);

	const split = splitCreditTips({
		totalTips,
		foodSalesTotal: foodSales,
		barBackPercentage,
		bartenders: bartenderTipsData,
		barBacks: barBackTipsData,
		cooks: cookTipsData,
	});

	const calculatedCookTips = split.tipsPerCook;
	useEffect(() => {
		setTipsPerCook(calculatedCookTips);
	}, [calculatedCookTips]);

	const calculatedBarBackTips = split.tipsPerBarBack;
	useEffect(() => {
		setTipsPerBarBack(calculatedBarBackTips);
	}, [calculatedBarBackTips]);

	const calculatedBartenderTips = split.tipsPerBartender;
	useEffect(() => {
		setTipsPerBartender(calculatedBartenderTips);
	}, [calculatedBartenderTips]);

	const cooksWithTipOut = split.cooks;
	const barBacksWithTipOut = split.barBacks;
	const adjustedBartendersWithTipOut = split.bartenders;

	const handleUpdateBreakDown = async (e: { preventDefault(): void }) => {
		e.preventDefault();
		// alert("Sorry doesn't work yet");
		try {
			const response = await fetch(`/api/UpdateTipBreakDown/${breakDown._id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					show: show,
					date: date,
					totalTips: Number(totalTips),
					foodSales: Number(foodSales),
					barBackPercentage: Number(barBackPercentage),
					cookTips: cooksWithTipOut,
					barBackTips: barBacksWithTipOut,
					bartenderTips: adjustedBartendersWithTipOut,
					tipsPerBarBack: Number(tipsPerBarBack),
					tipsPerBartender: Number(tipsPerBartender),
					tipsPerCook: Number(tipsPerCook),
					totalBarSales: Number(totalBarSales),
					shiftNotes: shiftNotes,
				}),
			});
			if (response.ok) {
				toggle();
				router.push(`/getSelectedTipBreakDown/${breakDown._id}`);
				return;
			}
			const body: unknown = await response.json().catch(() => ({}));
			setSaveError(text(body, "error") || "Could not save the changes. Please try again.");
		} catch (error) {
			console.error(error);
			setSaveError("Could not reach the server. Please try again.");
		}
	};

	const toggleConfirmation = () => {
		setShowConfirmation(!showConfirmation);
	};
	const handleDelete = async (e: { preventDefault(): void }) => {
		e.preventDefault();
		setShowConfirmation(!showConfirmation);

		// alert("Sorry doesn't work yet");
		try {
			const response = await fetch(`/api/removeTipBreakDown/${breakDown._id}`, {
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					show: show,
					date: date,
					totalTips: totalTips,
					foodSales: foodSales,
					barBackPercentage: barBackPercentage,
					cookTips: cooksWithTipOut,
					barBackTips: barBacksWithTipOut,
					bartenderTips: adjustedBartendersWithTipOut,
					tipsPerBarBack: tipsPerBarBack,
					tipsPerBartender: tipsPerBartender,
					tipsPerCook: tipsPerCook,
					totalBarSales: totalBarSales,
					shiftNotes: shiftNotes,
				}),
			});
			if (response.ok) {
				toggle();
				router.push(`/CCTipsTotals`);
				return;
			}
			const body: unknown = await response.json().catch(() => ({}));
			setSaveError(text(body, "error") || "Could not delete the breakdown. Please try again.");
		} catch (error) {
			console.error(error);
			setSaveError("Could not reach the server. Please try again.");
		}
	};

	const moneyInput = (
		id: string,
		label: string,
		value: SavedAmount | undefined,
		onChange: (e: ChangeEvent<HTMLInputElement>) => void,
		extraClass?: string
	) => (
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
					required={true}
					value={value}
					onChange={onChange}
					className={extraClass}
				/>
			</InputGroup>
		</FormGroup>
	);

	return (
		<div>
			<Button onClick={toggle}>Edit</Button>

			<Modal
				isOpen={modal}
				toggle={toggle}
				{...args}
				fullscreen
				contentClassName={style.editModal}
			>
				<ModalHeader toggle={toggle} className={style.editHeader}>
					Edit Breakdown
				</ModalHeader>

				<Container className={`${style.topRow} justify-content-center`}>
					<div className={style.backgroundColor}>
						<section className={`${form.card} ${style.editCard}`}>
							<FormGroup className={form.field}>
								<Label for="show" className={form.label}>
									Show
								</Label>
								<Input
									id="show"
									name="show"
									type="text"
									required={true}
									value={show}
									onChange={handleShowChange}
								/>
							</FormGroup>
							<FormGroup className={form.field}>
								<Label for="date" className={form.label}>
									Date
								</Label>
								<Input
									id="date"
									name="date"
									type="date"
									required={true}
									value={toDateInput(date)}
									onChange={handleDateChange}
								/>
							</FormGroup>
							{moneyInput("totalBarSales", "Bar sales", totalBarSales, handleTotalBarSalesChange)}
							{moneyInput("totalTips", "Credit card tips", totalTips, handleTotalTipChange, form.tipsInput)}
							{(cookTipsData.length > 0 || Number(foodSales) > 0) &&
								moneyInput("foodSales", "Food sales", foodSales, handleFoodSalesChange)}
							{barBackTipsData.length > 0 && (
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
											value={barBackPercentage}
											onChange={(e) => setBarBackPercentage(e.target.value)}
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
								<Input
									id="shiftNotes"
									name="shiftNotes"
									type="textarea"
									rows={3}
									value={shiftNotes}
									onChange={handleShiftNotesChange}
								/>
							</FormGroup>
						</section>
						{split.warning && (
							<div className={`${style.notice} ${style.noticeDanger}`} role="alert">
								{split.warning}
							</div>
						)}
						{cooksWithTipOut.length > 0 && (
							<div className={style.container}>
								<h1>Cook Tips </h1>
								<Row>
									{cookHours === 0 ? (
										<></>
									) : (
										<h4>
											Tips per hour:
											<span className="highlight-color">
												{" "}
												${money(tipsPerCook)}
											</span>
										</h4>
									)}
									{cooksWithTipOut.length > 0 &&
										cooksWithTipOut.map((cook) => (
											<Col key={cook.id} xs={12} sm={6} md={4}>
												<Container className={style.employeeContainer}>
													<Row>
														<Col>
															<span>{cook.label}</span>
														</Col>
														{cookHours === 0 ? (
															<></>
														) : (
															<Col>
																<FontAwesomeIcon icon={faClock} />{" "}
																<NumericFormat
																	id="cookHours"
																	name="cookHours"
																	customInput={NumberTypeInput}
																	inputMode="decimal"
																	pattern="[0-9]+(\.[0-9]{1,2})?"
																	step="0.01"
																	value={cook.tippedHours}
																	onChange={(e) =>
																		setCookHours(cook.id, e.target.value)
																	}
																	className={`${style.enterHoursInbox}`}
																/>
															</Col>
														)}
														<Col>
															<FontAwesomeIcon icon={faSackDollar} />{" "}
															<p className="highlight-color">
																${money(cook.tipOut)}
															</p>
														</Col>
													</Row>
												</Container>
											</Col>
										))}
								</Row>
							</div>
						)}

						{barBacksWithTipOut.length > 0 && (
							<div className={style.container}>
								<h1>Bar Back Tips </h1>
								{barBackHours === 0 ? (
									<></>
								) : (
									<h5>
										Tips per hour:{" "}
										<span className="highlight-color">
											${money(tipsPerBarBack)}
										</span>
									</h5>
								)}
								<Row>
									{barBacksWithTipOut.length > 0 &&
										barBacksWithTipOut.map((barBack) => (
											<Col key={barBack.id} xs={12} sm={6} md={4}>
												<Container className={style.employeeContainer}>
													<Row>
														<Col>
															<span>{barBack.label}</span>
														</Col>
														{barBackHours === 0 ? (
															<></>
														) : (
															<Col>
																<FontAwesomeIcon icon={faClock} />{" "}
																<NumericFormat
																	id="barBackHours"
																	name="barBackHours"
																	customInput={NumberTypeInput}
																	inputMode="decimal"
																	pattern="[0-9]+(\.[0-9]{1,2})?"
																	step="0.01"
																	value={barBack.tippedHours}
																	onChange={(e) =>
																		setBarBackHours(barBack.id, e.target.value)
																	}
																	className={`${style.enterHoursInbox}`}
																/>
															</Col>
														)}
														<Col>
															<FontAwesomeIcon icon={faSackDollar} />{" "}
															<p className="highlight-color">
																${money(barBack.tipOut)}
															</p>
														</Col>
													</Row>
												</Container>
											</Col>
										))}
								</Row>
							</div>
						)}

						<div className={style.container}>
							<h1>Bartender Tips </h1>
							{bartenderHours === 0 ? (
								<></>
							) : (
								<h5>
									Tips per hour:{" "}
									<span className="highlight-color">
										${money(tipsPerBartender)}
									</span>
								</h5>
							)}
							<Row>
								{adjustedBartendersWithTipOut.map((bartender) => (
									<Col key={bartender.id} xs={12} sm={6} md={4}>
										<Container className={style.employeeContainer}>
											<Row>
												<Col>
													<span>{bartender.label}</span>
												</Col>
												{bartenderHours === 0 ? (
													<></>
												) : (
													<Col>
														<FontAwesomeIcon icon={faClock} />{" "}
														<NumericFormat
															id="bartenderHours"
															name="bartenderHours"
															customInput={NumberTypeInput}
															inputMode="decimal"
															pattern="[0-9]+(\.[0-9]{1,2})?"
															step="0.01"
															value={bartender.tippedHours}
															onChange={(e) =>
																setBartenderHours(bartender.id, e.target.value)
															}
															allowNegative={false}
															className={`${style.enterHoursInbox}`}
														/>
													</Col>
												)}
												<Col>
													<FontAwesomeIcon icon={faSackDollar} />{" "}
													<p className="highlight-color">
														${money(bartender.tipOut)}
													</p>
												</Col>
											</Row>
										</Container>
									</Col>
								))}
							</Row>
						</div>
						{saveError && <div className={style.error}>{saveError}</div>}
						<ModalFooter className={style.editFooter}>
							<Button color="danger" outline onClick={toggleConfirmation}>
								Delete
							</Button>
							<Button color="secondary" onClick={toggle}>
								Cancel
							</Button>
							<Button className={form.primaryButton} onClick={handleUpdateBreakDown}>
								Save changes
							</Button>
							<DeleteDialog
								isOpen={showConfirmation}
								toggle={toggleConfirmation}
								onConfirm={handleDelete}
							/>
						</ModalFooter>
					</div>
				</Container>
			</Modal>
		</div>
	);
};

export default memo(UpdateTipBreakDown);
