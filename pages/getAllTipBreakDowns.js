import clientPromise from "../lib/mongodb";
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
} from "reactstrap";
import { useRouter } from "next/router";
import style from "../components/AllTipBreakDowns.module.css";
export default function getAllTipBreakDown({ allTipBreakdowns }) {
	console.log(allTipBreakdowns);
	const router = useRouter();
	const [reversedAllTipBreakdowns, setReversedAllTipBreakdowns] = useState(
		[...allTipBreakdowns].reverse()
	);
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
		const searchTerm = e.target.value.toLowerCase();
		const searchResults = allTipBreakdowns.filter(
			(breakDown) =>
				breakDown.show && breakDown.show.toLowerCase().includes(searchTerm)
		);

		setReversedAllTipBreakdowns([...searchResults].reverse());
	};
	console.log(reversedAllTipBreakdowns);
	return (
		<div className={`${style.carouselContainer} ${style.minHeight}`}>
			<div className={`${style.title}`}>
				<h2>Tip Breakdowns</h2>
				<h5>Click on a card to get more detail or edit</h5>

				<div className={style.searchBox}>
					<Input
						className="mb-2 mt-2"
						type="text"
						placeholder="🔍 Search by show name"
						onChange={handleSearch}
					/>
				</div>
			</div>
			<Row xs={12} sm={2} md={3}>
				{reversedAllTipBreakdowns.map((data) => (
					<Col sm={12} className={`${style.cardRow} `}>
						<Card
							onClick={() => handleCardClick(data._id)}
							key={data._id}
							className={`${style.cardContainer}  ${style.backgroundColor} ${style.cardClick}`}
						>
							<CardBody className={``}>
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
									Total Bar Sales:{" "}
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
														${cook.tipOut.toFixed(2)}
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
																${barBack.tipOut.toFixed(2)}
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
															${bartender.tipOut}
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
		</div>
	);
}

export async function getServerSideProps() {
	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		const allTipBreakdowns = await db
			.collection("tipBreakdown")
			.find({})
			.sort()
			.toArray();
		return {
			props: { allTipBreakdowns: JSON.parse(JSON.stringify(allTipBreakdowns)) },
		};
	} catch (err) {
		console.error(err);
	}
}
