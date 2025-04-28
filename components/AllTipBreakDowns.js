import {
	Card,
	CardBody,
	CardTitle,
	CardSubtitle,
	CardText,
	Row,
	Col,
	Container,
	Carousel,
	CarouselItem,
	CarouselControl,
	Button,
} from "reactstrap";
import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import style from "./AllTipBreakDowns.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faAnglesDown } from "@fortawesome/free-solid-svg-icons";

export default function AllTipBreakDowns({ allTipBreakdowns }) {
	const router = useRouter();
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

	const reversedAllTipBreakdowns = [...allTipBreakdowns].reverse();

	const [chunkSize, setChunkSize] = useState(3);

	useEffect(() => {
		const updateChunkSize = () => {
			let newSize;
			switch (true) {
				case window.innerWidth < 641:
					newSize = 1;
					break;
				case window.innerWidth < 905:
					newSize = 2;
					break;
				default:
					newSize = 3;
					break;
			}
			setChunkSize(newSize);
		};

		window.addEventListener("resize", updateChunkSize); // Listen for window resize events
		updateChunkSize(); // Initial update

		return () => {
			window.removeEventListener("resize", updateChunkSize); // Cleanup
		};
	}, []);

	const chunks = reversedAllTipBreakdowns.reduce((resultArray, item, index) => {
		const chunkIndex = Math.floor(index / chunkSize);
		if (!resultArray[chunkIndex]) {
			resultArray[chunkIndex] = []; // start a new chunk
		}
		resultArray[chunkIndex].push(item);
		return resultArray;
	}, []);
	const [activeIndex, setActiveIndex] = useState(0);
	console.log(chunks);
	const next = () => {
		const nextIndex =
			activeIndex === chunks.length - 1 ? activeIndex : activeIndex + 1;
		setActiveIndex(nextIndex);
	};

	const previous = () => {
		const nextIndex = activeIndex === 0 ? activeIndex : activeIndex - 1;
		setActiveIndex(nextIndex);
	};

	const slides = chunks.map((chunk, index) => (
		<CarouselItem key={index}>
			<div className={`${style.carouselContainer}`}>
				<Row xs="1" sm="2" md="3">
					{chunk.map((data) => (
						<Col key={data._id} sm={12} className={`${style.cardRow} `}>
							<Card
								onClick={() => handleCardClick(data._id)}
								key={data._id}
								className={`${style.cardContainer}  ${style.backgroundColor}  ${style.cardClick}`}
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
											${(Number(data.totalBarSales) || 0).toFixed(2)}
										</span>
									</CardSubtitle>
									<CardSubtitle className="mb-2 " tag="h6">
										Total Tips:{" "}
										<span className="highlight-color">
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
		</CarouselItem>
	));
	const scrollToTipsSpreadsheet = () => {
		const tipsSpreadsheet = document.getElementById("tipsSpreadsheet");
		tipsSpreadsheet.scrollIntoView({ behavior: "smooth" });
	};
	return (
		<div id="allTipBreakDowns" className={`${style.carouselSection}`}>
			<div className={`${style.title}`}>
				<h2>Tip Breakdowns</h2>
				<h5>Click on a card to see more detail or edit</h5>
			</div>
			<Carousel
				activeIndex={activeIndex}
				next={next}
				previous={previous}
				interval={false}
			>
				{slides}
				{activeIndex === 0 ? (
					<></>
				) : (
					<CarouselControl
						direction="prev"
						directionText="Previous"
						onClickHandler={previous}
						className={`${style.carouselControlPrevIcon}`}
					/>
				)}
				{activeIndex === slides.length - 1 ? (
					<></>
				) : (
					<CarouselControl
						dark="true"
						direction="next"
						directionText="Next"
						onClickHandler={next}
						className={`${style.carouselControlNextIcon}`}
					/>
				)}
			</Carousel>
			<Row className="justify-content-center mt-4 ">
				<Col xs="auto">
					<Button onClick={scrollToTipsSpreadsheet}>
						Scroll Down to Tips Spreadsheet
					</Button>
				</Col>
			</Row>
		</div>
	);
}
