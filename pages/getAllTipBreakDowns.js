import clientPromise from "../lib/mongodb";
import {
	Card,
	CardBody,
	CardTitle,
	CardSubtitle,
	CardText,
	Row,
	Col,
	Container,
} from "reactstrap";
import { useRouter } from "next/router";
import style from "../components/AllTipBreakDowns.module.css";
export default function getAllTipBreakDown({ allTipBreakdowns }) {
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

	return (
		<div className={`${style.carouselContainer}`}>
			<div className={`${style.title}`}>
				<h2>Tip Breakdowns</h2>
				<h5>Click on a card to get more detail or edit</h5>
			</div>
			<Row xs={12} sm={2} md={3}>
				{reversedAllTipBreakdowns.map((data) => (
					<Col sm={12} className={`${style.cardRow}`}>
						<Card
							onClick={() => handleCardClick(data._id)}
							key={data._id}
							className={`${style.cardContainer}`}
						>
							<CardBody>
								<CardTitle tag="h5">{data.show}</CardTitle>
								<CardSubtitle className="mb-2 " tag="h6">
									{`${formatDateStringWithDayOfWeek(data.date)} `}
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
