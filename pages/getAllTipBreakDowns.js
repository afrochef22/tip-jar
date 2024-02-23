import clientPromise from "../lib/mongodb";
import React from "react";
import { useRouter } from "next/router";

export default function getAllTipBreakDown({ allTipBreakdowns }) {
	const router = useRouter();
	const { date, show, ...additionalParams } = router.query;
	console.log("date: ", date, "show: ", show, "additional: ", additionalParams);
	return (
		<div>
			{allTipBreakdowns.map((data) => {
				return (
					<div>
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
			.limit(20)
			.toArray();
		console.log(allTipBreakdowns);
		return {
			props: { allTipBreakdowns: JSON.parse(JSON.stringify(allTipBreakdowns)) },
		};
	} catch (err) {
		console.error(err);
	}
}
