import clientPromise from "../lib/mongodb";
import { BREAKDOWN_CARD_FIELDS } from "../lib/breakdownFields";
import React, { useState, useEffect } from "react";

import {
	Card,
	CardBody,
	CardTitle,
	CardSubtitle,
	CardText,
	Row,
	Col,
	Container,
	Input,
	Button,
} from "reactstrap";
import { useRouter } from "next/router";
import style from "../components/AllTipBreakDowns.module.css";
import { reportError } from "../lib/alert";
import { money, tipPercent } from "../lib/money";
import { toJson } from "../lib/json";
import type { ChangeEvent } from "react";
import type { GetServerSideProps } from "next";
import type { BreakdownCard, BreakdownCardDoc, TipBreakdownDoc } from "../types/models";

type Props = { allTipBreakdowns: BreakdownCard[] };

// Rendering every breakdown at once makes the page slow to load on a phone.
const PAGE_SIZE = 30;
export default function getAllTipBreakDown({ allTipBreakdowns }: Props) {
	const router = useRouter();
	const [reversedAllTipBreakdowns, setReversedAllTipBreakdowns] = useState(
		[...allTipBreakdowns].reverse()
	);
	const [searchValue, setSearchValue] = useState("");
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

	const handleCardClick = (id: string) => {
		router.push(`/getSelectedTipBreakDown/${id}`);
	};
	const formatDateStringWithDayOfWeek = (dateString: string) => {
		const date = new Date(dateString);
		const options: Intl.DateTimeFormatOptions = { weekday: "long" }; // Specify the format for the day of the week
		return `${date.toLocaleDateString(
			undefined,
			options
		)} ${date.toLocaleDateString()}`;
	};

	const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.toLowerCase();
		setSearchValue(e.target.value); // store the actual input for the UI

		const searchResults = allTipBreakdowns.filter(
			(breakDown) =>
				breakDown.show && breakDown.show.toLowerCase().includes(value)
		);

		setReversedAllTipBreakdowns([...searchResults].reverse());
		setVisibleCount(PAGE_SIZE);
	};

	const handleClear = () => {
		setSearchValue("");
		setReversedAllTipBreakdowns([...allTipBreakdowns].reverse());
		setVisibleCount(PAGE_SIZE);
	};

	return (
		<div className={`${style.carouselContainer} ${style.minHeight}`}>
			<div className={`${style.title}`}>
				<h2>Tip Breakdowns</h2>
				<h5>
					<span className="pointer-only">Click</span>
					<span className="touch-only">Tap</span> on a card to get more detail or
					edit
				</h5>

				<div className={style.searchBox} style={{ position: "relative" }}>
					<Input
						className="mb-2 mt-2"
						type="text"
						placeholder="🔍 Search by show name"
						value={searchValue}
						onChange={handleSearch}
						style={{ paddingRight: "30px" }} // space for the button
					/>
					{searchValue && (
						<button
							onClick={handleClear}
							style={{
								position: "absolute",
								right: "10px",
								top: "50%",
								transform: "translateY(-50%)",
								border: "none",
								background: "transparent",
								cursor: "pointer",
								fontSize: "16px",
								color: "#999",
							}}
						>
							✖️
						</button>
					)}
				</div>
			</div>
			<Row xs={12} sm={2} md={3}>
				{reversedAllTipBreakdowns.slice(0, visibleCount).map((data) => (
					<Col sm={12} key={data._id} className={`${style.cardRow} `}>
						<Card
							onClick={() => handleCardClick(data._id)}
							className={`${style.cardContainer}  ${style.backgroundColor} ${style.cardClick}`}
						>
							<CardBody className={`${style.cardWidth}`}>
								<CardTitle
									className={`${style.bandTitle} highlight-color`}
									tag="h5"
								>
									{data.show}
								</CardTitle>
								<CardSubtitle className="mb-2 " tag="h6">
									{`${formatDateStringWithDayOfWeek(data.date)} `}
								</CardSubtitle>
								<CardSubtitle className="mb-2 " tag="h6">
									Bar Sales:{" "}
									<span className="highlight-color">
										${money(data.totalBarSales)}{" "}
									</span>
								</CardSubtitle>
								<CardSubtitle className="mb-2 " tag="h6">
									Total Tips:{" "}
									<span className="highlight-color">
										{" "}
										${money(data.totalTips)}
									</span>
								</CardSubtitle>
								{tipPercent(data.totalTips, data.totalBarSales) && (
									<CardSubtitle className="mb-2 " tag="h6">
										Tip %:{" "}
										<span className="highlight-color">
											{tipPercent(data.totalTips, data.totalBarSales)}
										</span>
									</CardSubtitle>
								)}

								{data.cookTips?.length > 0 && (
									<h5 className={`${style.positionTitle}`}>Cooks:</h5>
								)}
								{data.cookTips &&
									data.cookTips.map((cook) => (
										<table key={cook.id} className={style.employeeContainer}>
											<tbody>
												<tr>
													<td className={`${style.expand} p-2`}>
														{cook.label}:
													</td>
													<td
														className={`${style.expand} p-2 highlight-color text-right`}
													>
														${money(cook.tipOut)}
													</td>
												</tr>
											</tbody>
										</table>
									))}

								<div>
									{data.barBackTips?.length > 0 && (
										<h5 className={`${style.positionTitle}`}>Bar Backs:</h5>
									)}
									<Col>
										{data.barBackTips &&
											data.barBackTips.map((barBack) => (
												<table
													key={barBack.id}
													className={style.employeeContainer}
												>
													<tbody>
														<tr>
															<td className={`${style.expand} p-2`}>
																{barBack.label}:
															</td>
															<td
																className={`${style.expand} p-2 highlight-color text-right`}
															>
																${money(barBack.tipOut)}
															</td>
														</tr>
													</tbody>
												</table>
											))}
									</Col>
								</div>
								<div>
									{data.BartenderTips?.length > 0 && (
										<h5 className={`${style.positionTitle}`}>Bartenders:</h5>
									)}
									{data.BartenderTips &&
										data.BartenderTips.map((bartender) => (
											<table
												key={bartender.id}
												className={style.employeeContainer}
											>
												<tbody>
													<tr>
														<td className={`${style.expand} p-2`}>
															{bartender.label}:
														</td>
														<td
															className={`${style.expand} p-2 highlight-color text-right`}
														>
															${money(bartender.tipOut)}
														</td>
													</tr>
												</tbody>
											</table>
										))}
								</div>
							</CardBody>
						</Card>
					</Col>
				))}
			</Row>
			{visibleCount < reversedAllTipBreakdowns.length && (
				<div className="text-center mb-4">
					<Button onClick={() => setVisibleCount(visibleCount + PAGE_SIZE)}>
						Show more ({reversedAllTipBreakdowns.length - visibleCount} left)
					</Button>
				</div>
			)}
		</div>
	);
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		const allTipBreakdowns = await db
			.collection<TipBreakdownDoc>("tipBreakdown")
			.find<BreakdownCardDoc>({}, { projection: BREAKDOWN_CARD_FIELDS })
			.toArray();
		return {
			props: { allTipBreakdowns: toJson(allTipBreakdowns) },
		};
	} catch (err) {
		await reportError("getAllTipBreakDowns page", err);
		return { props: { allTipBreakdowns: [] } };
	}
};
