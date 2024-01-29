// pages/SelectWorkingEmployee.js
import React from "react";
import SelectBartender from "../components/SelectBartender";
import clientPromise from "../lib/mongodb";

export default function SelectWorkingEmployee({ employees }) {
	return (
		<div className="background-color">
			<SelectBartender employees={employees} />
		</div>
	);
}

export async function getServerSideProps() {
	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		const employees = await db
			.collection("employees")
			.find({})
			.sort()
			.limit(20)
			.toArray();

		return {
			props: { employees: JSON.parse(JSON.stringify(employees)) },
		};
	} catch (err) {
		console.error(err);
		return {
			props: { employees: [] },
		};
	}
}
