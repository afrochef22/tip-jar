import clientPromise from "../lib/mongodb";
import GetAllTipBreakdowns from "../components/GetAllTipBreakdowns";

export default function getAllTipBreakDown({ allTipBreakdowns }) {
	return (
		<div>
			{allTipBreakdowns.map((data) => {
				return (
					<div key={data.id}>
						<div>{data.date}</div>
						<div>{data.show}</div>
					</div>
				);
			})}
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
		// console.log(allTipBreakdowns);
		return {
			props: { allTipBreakdowns: JSON.parse(JSON.stringify(allTipBreakdowns)) },
		};
	} catch (err) {
		console.error(err);
	}
}
