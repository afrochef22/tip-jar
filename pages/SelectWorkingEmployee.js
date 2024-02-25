// pages/SelectWorkingEmployee.js
import React from "react";
import SelectEmployee from "../components/SelectEmployee";
import clientPromise from "../lib/mongodb";

export default function SelectWorkingEmployee({ employees }) {
	return (
		<div className="background-color">
			<SelectEmployee employees={employees} />
		</div>
	);
}

export async function getServerSideProps() {
	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		const cursor = db.collection("employees").find({});
		const employees = await cursor.toArray();

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
