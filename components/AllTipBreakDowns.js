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
import React, { useState, useEffect } from "react";
import style from "./AllTipBreakDowns.module.css";

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
						<Col key={data._id} className={`${style.cardWidth}`}>
							<Card onClick={() => handleCardClick(data._id)}>
								<CardBody>
									<CardTitle tag="h5">{data.show}</CardTitle>
									<CardSubtitle className="mb-2 " tag="h6">
										{formatDateStringWithDayOfWeek(data.date)}
									</CardSubtitle>
									<CardSubtitle className="mb-2 " tag="h6">
										Total Tips: ${data.totalTips}
									</CardSubtitle>
									<div>
										<h6>Cooks:</h6>
										<ul>
											{data.cookTips &&
												data.cookTips.map((cook) => (
													<li key={cook.id}>
														{cook.label}: ${cook.tipOut.toFixed(2)}
													</li>
												))}
										</ul>
									</div>
									<div>
										<h6>Barbacks:</h6>
										<ul>
											{data.barBackTips &&
												data.barBackTips.map((barBack) => (
													<li key={barBack.id}>
														{barBack.label}: ${barBack.tipOut.toFixed(2)}
													</li>
												))}
										</ul>
									</div>
									<div>
										<h6>Bartenders:</h6>
										<ul>
											{data.BartenderTips &&
												data.BartenderTips.map((bartender) => (
													<li key={bartender.id}>
														{bartender.label}: ${bartender.tipOut}
													</li>
												))}
										</ul>
									</div>
								</CardBody>
							</Card>
						</Col>
					))}
				</Row>
			</div>
		</CarouselItem>
	));

	return (
		<div className={`${style.carouselSection}`}>
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
				<CarouselControl
					direction="prev"
					directionText="Previous"
					onClickHandler={previous}
					className={`${style.carouselControlPrevIcon}`}
				/>
				<CarouselControl
					dark="true"
					direction="next"
					directionText="Next"
					onClickHandler={next}
					className={`${style.carouselControlNextIcon}`}
				/>
			</Carousel>
		</div>
	);
}
