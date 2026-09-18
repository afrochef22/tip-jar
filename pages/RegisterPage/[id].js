import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import { Register } from "../../components/Register";
import React from "react";

export default function RegisterPage({ employee }) {
	// console.log(employee);
	if (!employee) {
		// Handle the case when employee is not found
		return <div>employee not found</div>;
	}
	console.log("test: ", employee);
	return (
		<div>
			<Register employee={employee} />
		</div>
	);
}

export async function getServerSideProps(data) {
	const id = data.query.id;
	const token = data.query.token;
	const expired = { redirect: { destination: "/TokenExpired", permanent: false } };

	if (!ObjectId.isValid(id) || typeof token !== "string" || !token) {
		return expired;
	}

	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");
		const employeeCollection = db.collection("employees");
		const employee = await employeeCollection.findOne({
			_id: new ObjectId(id),
		});

		if (!employee) {
			return { notFound: true };
		}

		const expiresAt = employee.tokenExpiration
			? new Date(employee.tokenExpiration)
			: null;
		const tokenValid =
			employee.token === token && expiresAt && expiresAt > new Date();
		if (!tokenValid) {
			return expired;
		}

		// Never ship the password hash to the browser.
		const { password, ...safeEmployee } = employee;
		return {
			props: { employee: JSON.parse(JSON.stringify(safeEmployee)) },
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
