import React from "react";
import clientPromise from "../lib/mongodb";

export default function Dashboard({ employees, allTipBreakdowns }) {
	return <div>Dashboard</div>;
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
