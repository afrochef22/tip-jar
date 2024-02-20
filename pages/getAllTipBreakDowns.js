import clientPromise from "../lib/mongodb";

import React from "react";

export default function getAllTipBreakDowns({ allTipBreakdowns }) {
	return (
		<div>
			{allTipBreakdowns.map((data) => {
				return (
					<div>
						<div>{data.date}</div>
						<div>{data.show}</div>
						<div>{data.totalTips}</div>
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
