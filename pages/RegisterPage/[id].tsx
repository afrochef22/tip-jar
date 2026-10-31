import clientPromise from "../../lib/mongodb";
import { ObjectId } from "mongodb";
import { Register } from "../../components/Register";
import React from "react";
import { reportError } from "../../lib/alert";
import { isObjectId } from "../../lib/objectId";
import { toJson } from "../../lib/json";
import type { GetServerSideProps } from "next";
import type { EmployeeDoc, Json } from "../../types/models";
import type { WithId } from "mongodb";

type Props = { employee: Json<Omit<WithId<EmployeeDoc>, "password">> | null };

export default function RegisterPage({ employee }: Props) {
	if (!employee) {
		// Handle the case when employee is not found
		return <div>employee not found</div>;
	}
	return (
		<div>
			<Register employee={employee} />
		</div>
	);
}

export const getServerSideProps: GetServerSideProps<Props> = async (data) => {
	const id = data.query.id;
	const token = data.query.token;
	const expired = { redirect: { destination: "/TokenExpired", permanent: false } };

	if (!isObjectId(id) || typeof token !== "string" || !token) {
		return expired;
	}

	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");
		const employeeCollection = db.collection<EmployeeDoc>("employees");
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
			props: { employee: toJson(safeEmployee) },
		};
	} catch (error) {
		await reportError("Registration page", error);
		// Return a 500 status for internal server error
		return {
			props: {
				employee: null,
			},
		};
	}
};
