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

// Rendering every breakdown at once makes the page slow to load on a phone.
const PAGE_SIZE = 30;
export default function getAllTipBreakDown({ allTipBreakdowns }) {
	const router = useRouter();
	const [reversedAllTipBreakdowns, setReversedAllTipBreakdowns] = useState(
		[...allTipBreakdowns].reverse()
	);
	const [searchValue, setSearchValue] = useState("");
	const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

	const handleCardClick = (id) => {
		router.push(`/getSelectedTipBreakDown/${id}`);
	};
	const formatDateStringWithDayOfWeek = (dateString) => {
		const date = new Date(dateString);
		const options = { weekday: "long" }; // Specify the format for the day of the week
		return `${date.toLocaleDateString(
			undefined,
			options
		)} ${date.toLocaleDateString()}`;
	};

	const handleSearch = (e) => {
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
				<h5>Click on a card to get more detail or edit</h5>

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
										${(Number(data.totalBarSales) || 0).toFixed(2)}{" "}
									</span>
								</CardSubtitle>
								<CardSubtitle className="mb-2 " tag="h6">
									Total Tips:{" "}
									<span className="highlight-color">
										{" "}
										${(Number(data.totalTips) || 0).toFixed(2)}
									</span>
								</CardSubtitle>

								<h5 className={`${style.positionTitle}`}>Cooks:</h5>
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
														${(Number(cook.tipOut) || 0).toFixed(2)}
													</td>
												</tr>
											</tbody>
										</table>
									))}

								<div>
									<h5 className={`${style.positionTitle}`}>Barbacks:</h5>
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
																${(Number(barBack.tipOut) || 0).toFixed(2)}
															</td>
														</tr>
													</tbody>
												</table>
											))}
									</Col>
								</div>
								<div>
									<h5 className={`${style.positionTitle}`}>Bartenders:</h5>
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
															${(Number(bartender.tipOut) || 0).toFixed(2)}
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

export async function getServerSideProps() {
	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		const allTipBreakdowns = await db
			.collection("tipBreakdown")
			.find({}, { projection: BREAKDOWN_CARD_FIELDS })
			.sort()
			.toArray();
		return {
			props: { allTipBreakdowns: JSON.parse(JSON.stringify(allTipBreakdowns)) },
		};
	} catch (err) {
		console.error(err);
		return { props: { allTipBreakdowns: [] } };
	}
}
