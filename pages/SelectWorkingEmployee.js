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

		// you can use the cursor interface to iterate over the entire result set without specifying a limit. This approach is more efficient for handling large result sets because it doesn't load all documents into memory at once:

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
