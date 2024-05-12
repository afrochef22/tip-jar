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
					<Col sm={12} className={`${style.cardRow} `}>
						<Card
							onClick={() => handleCardClick(data._id)}
							key={data._id}
							className={`${style.cardContainer}  ${style.backgroundColor}`}
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
									Total Tips:{" "}
									<span className="highlight-color">${data.totalTips}</span>
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
