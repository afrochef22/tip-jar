import React from "react";
import clientPromise from "../lib/mongodb";
import AllTipBreakDowns from "../components/AllTipBreakDowns";

export default function Dashboard({ employees, allTipBreakdowns }) {
	return (
		<div
			className="
		front-page"
		>
			<AllTipBreakDowns allTipBreakdowns={allTipBreakdowns} />
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

			.toArray();
		// console.log(allTipBreakdowns);

		const employees = await db
			.collection("employees")
			.find({})

			.toArray();

		return {
			props: {
				allTipBreakdowns: JSON.parse(JSON.stringify(allTipBreakdowns)),
				employees: JSON.parse(JSON.stringify(employees)),
			},
		};
	} catch (err) {
		console.error(err);
	}
}
