import clientPromise from "../../lib/mongodb";
import { userRouter } from "next/router";
import { ObjectId } from "mongodb";
import Link from "next/link";
import React from "react";
import SendRegistrationLink from "../../components/SendRegistrationLink";

export default function getEmployee({ employee }) {
	if (!employee) {
		// Handle the case when employee is not found
		return <div>employee not found</div>;
	}

	return (
		<div className="front-page">
			<SendRegistrationLink employee={employee} />
			<p>
				{employee.firstName} {employee.lastName}
			</p>
			<p>{employee.email}</p>
			<p>{employee.position}</p>
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
