import clientPromise from "../lib/mongodb";
import Bartenders from "../components/Bartenders";
import BarBacks from "../components/BarBacks";
import Cooks from "../components/Cooks";
import NonPositionedEmployee from "../components/NonPositionedEmployee";
import { AddEmployeeModal } from "../components/addEmployeeModal";

import React from "react";

export default function EmployeesPage({ employees }) {
	return (
		<div>
			<AddEmployeeModal />
			<Bartenders employees={employees} />
			<BarBacks employees={employees} />
			<Cooks employees={employees} />
			<NonPositionedEmployee employees={employees} />
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
	}
}
