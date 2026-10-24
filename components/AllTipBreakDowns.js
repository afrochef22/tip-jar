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
} from "reactstrap";
import { useRouter } from "next/router";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import style from "./AllTipBreakDowns.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faAnglesDown } from "@fortawesome/free-solid-svg-icons";
import { money, tipPercent } from "../lib/money";

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

	// The Dashboard only shows the most recent shows; older ones are on the
	// Tip Breakdowns page, which has search. Newest show date first; shows on
	// the same date keep newest-entered first.
	const RECENT_COUNT = 10;
	const showTime = (date) => {
		const [month, day, year] = String(date).split("/").map(Number);
		return new Date(year, month - 1, day).getTime() || 0;
	};
	const recentTipBreakdowns = [...allTipBreakdowns]
		.reverse()
		.sort((a, b) => showTime(b.date) - showTime(a.date))
		.slice(0, RECENT_COUNT);
	const cards =
		allTipBreakdowns.length > RECENT_COUNT
			? [...recentTipBreakdowns, { _id: "see-all", seeAll: true }]
			: recentTipBreakdowns;

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

	const chunks = cards.reduce((resultArray, item, index) => {
		const chunkIndex = Math.floor(index / chunkSize);
		if (!resultArray[chunkIndex]) {
			resultArray[chunkIndex] = []; // start a new chunk
		}
		resultArray[chunkIndex].push(item);
		return resultArray;
	}, []);
	const [activeIndex, setActiveIndex] = useState(0);
	const next = () => {
		const nextIndex =
			activeIndex === chunks.length - 1 ? activeIndex : activeIndex + 1;
		setActiveIndex(nextIndex);
	};

	const previous = () => {
		const nextIndex = activeIndex === 0 ? activeIndex : activeIndex - 1;
		setActiveIndex(nextIndex);
	};

	// reactstrap only wires up swiping when the carousel has indicators, so
	// handle it here. Mostly-vertical drags are left alone so the page scrolls.
	const SWIPE_THRESHOLD = 40;
	const touchStart = useRef(null);
	const handleTouchStart = (e) => {
		const touch = e.changedTouches[0];
		touchStart.current = { x: touch.screenX, y: touch.screenY };
	};
	const handleTouchEnd = (e) => {
		if (!touchStart.current) return;
		const touch = e.changedTouches[0];
		const dx = touch.screenX - touchStart.current.x;
		const dy = touch.screenY - touchStart.current.y;
		touchStart.current = null;
		if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
		if (dx < 0) next();
		else previous();
	};

	// Only the visible slide and its neighbours get their cards drawn. Drawing
	// every breakdown on each arrow tap froze the page for over a second on
	// phones; neighbours are kept so the slide animation still has content.
	const slides = chunks.map((chunk, index) => (
		<CarouselItem key={index}>
			{Math.abs(index - activeIndex) <= 1 && (
				<div className={`${style.carouselContainer}`}>
					<Row xs="1" sm="2" md="3">
						{chunk.map((data) =>
							data.seeAll ? (
								<Col key={data._id} sm={12} className={`${style.cardRow} `}>
									<Card
										className={`${style.cardContainer} ${style.backgroundColor}`}
									>
										<CardBody className={`${style.cardWidth} ${style.seeAllBody}`}>
											<h5>Looking for an older show?</h5>
											<p>The Tip Breakdowns page has every show, with search.</p>
											<Link href="/getAllTipBreakDowns" className="btn btn-success">
												See all tip breakdowns →
											</Link>
										</CardBody>
									</Card>
								</Col>
							) : (
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
													${money(data.totalBarSales)}
												</span>
											</CardSubtitle>
											<CardSubtitle className="mb-2 " tag="h6">
												Total Tips:{" "}
												<span className="highlight-color">
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
							)
						)}
					</Row>
				</div>
			)}
		</CarouselItem>
	));
	return (
		<div id="allTipBreakDowns" className={`${style.carouselSection}`}>
			<div className={`${style.title}`}>
				<h2>Tip Breakdowns</h2>
				{/* Both rendered; CSS shows the one that fits the device so the
				    server and client markup always match. */}
				<h5 className={style.pointerOnly}>
					Click on a card to see more detail or edit
				</h5>
				<h5 className={style.touchOnly}>
					Tap a card to see more detail or edit
				</h5>
				{/* Arrows only point where there's more to swipe to. */}
				{chunks.length > 1 && (
					<p className={`${style.touchOnly} ${style.swipeHint}`}>
						{activeIndex > 0 && "← "}Swipe for more
						{activeIndex < chunks.length - 1 && " →"}
					</p>
				)}
			</div>
			<div onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
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
							className={`${style.carouselControlPrevIcon} ${style.pointerOnly}`}
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
							className={`${style.carouselControlNextIcon} ${style.pointerOnly}`}
						/>
					)}
				</Carousel>
			</div>
		</div>
	);
}
