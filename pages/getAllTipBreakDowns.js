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
	const reversedAllTipBreakdowns = [...allTipBreakdowns].reverse();

	return (
		<div className={`${style.carouselContainer}`}>
			<Row xs="1" md="3">
				{reversedAllTipBreakdowns.map((data) => (
					<Col>
						<Card
							onClick={() => handleCardClick(data._id)}
							key={data._id}
							style={{ width: "18rem", marginBottom: "20px" }}
						>
							<CardBody>
								<CardTitle tag="h5">{data.show}</CardTitle>
								<CardSubtitle className="mb-2 " tag="h6">
									{data.date}
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
