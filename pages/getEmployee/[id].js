import clientPromise from "../../lib/mongodb";
import { userRouter } from "next/router";
import { ObjectId } from "mongodb";

import React from "react";

export default function getEmployee({ employee }) {
	if (!employee) {
		// Handle the case when employee is not found
		return <div>employee not found</div>;
	}
	console.log("test: ", employee);
	return (
		<div>
			<p key={employee._id}>{employee.firstName}</p>
		</div>
	);
}

export async function getServerSideProps(data) {
	const id = data.query.id;

	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");
		const employeeCollection = db.collection("employees");
		const employee = await employeeCollection.findOne({
			_id: new ObjectId(id),
		});

		if (!employee) {
			// Return a 404 status for not found
			return {
				notFound: true,
			};
		}

		return {
			props: { employee: JSON.parse(JSON.stringify(employee)) },
		};
	} catch (error) {
		console.error("Error fetching data:", error);
		// Return a 500 status for internal server error
		return {
			props: {
				employee: null,
			},
		};
	}
}
