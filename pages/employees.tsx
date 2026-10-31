import clientPromise from "../lib/mongodb";
import { MANAGER_EMPLOYEE_FIELDS } from "../lib/employeeFields";
import Bartenders from "../components/Bartenders";
import BarBacks from "../components/BarBacks";
import Cooks from "../components/Cooks";
import NonPositionedEmployee from "../components/NonPositionedEmployee";
import { AddEmployeeModal } from "../components/addEmployeeModal";
import style from "../components/EmployeeList.module.css";
import React from "react";
import { Col, Row, Container } from "reactstrap";
import { reportError } from "../lib/alert";
import { toJson } from "../lib/json";
import type { GetServerSideProps } from "next";
import type { EmployeeDoc, ManagerEmployee, ManagerEmployeeDoc } from "../types/models";

type Props = { employees: ManagerEmployee[] };

export default function EmployeesPage({ employees }: Props) {
	return (
		<div className={style.pageContainer}>
			<Container className={style.listContianer}>
				<Row>
					<Bartenders employees={employees} />
					<BarBacks employees={employees} />
				</Row>
				<Row>
					<Cooks employees={employees} className="mb-2" />
					<NonPositionedEmployee employees={employees} className="mb-2" />
				</Row>
			</Container>
		</div>
	);
}

export const getServerSideProps: GetServerSideProps<Props> = async () => {
	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");

		const employees = await db
			.collection<EmployeeDoc>("employees")
			.find<ManagerEmployeeDoc>({}, { projection: MANAGER_EMPLOYEE_FIELDS })
			.limit(1000)
			.toArray();
		return {
			props: { employees: toJson(employees) },
		};
	} catch (err) {
		await reportError("Employees page", err);
		return { props: { employees: [] } };
	}
};
