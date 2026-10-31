import clientPromise from "../../lib/mongodb";
import { MANAGER_EMPLOYEE_FIELDS } from "../../lib/employeeFields";
import { useRouter } from "next/router";
import { ObjectId } from "mongodb";
import Link from "next/link";
import React, { useState } from "react";
import SendRegistrationLink from "../../components/SendRegistrationLink";
import style from "../../components/TipBreakDown.module.css";
import { Button, Col, Container, Row } from "reactstrap";
import { UpdateEmployeeModal } from "../../components/UpdateEmployeeModal";
import { DeleteDialog } from "../../components/ConformationDialog";
import { reportError } from "../../lib/alert";
import { text } from "../../lib/field";
import { toJson } from "../../lib/json";
import { isObjectId } from "../../lib/objectId";
import type { GetServerSideProps } from "next";
import type { EmployeeDoc, ManagerEmployee, ManagerEmployeeDoc } from "../../types/models";

type Props = { employee: ManagerEmployee | null };

export default function getEmployee({ employee }: Props) {
	const router = useRouter();
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [confirmationStates, setConfirmationStates] = useState<Record<string, boolean>>({});
	const [deleteError, setDeleteError] = useState("");

	const toggleConfirmation = (id: string) => {
		setConfirmationStates({
			...confirmationStates,
			[id]: !confirmationStates[id],
		});
	};
	// const toggle = () => setShowConfirmation(!showConfirmation);

	if (!employee) {
		// Handle the case when employee is not found
		return <div>employee not found</div>;
	}
	// Both dates are only shown when set (see isRegistrationLink); without one,
	// new Date(undefined) is an Invalid Date that isn't used.
	const expirationDate = new Date(employee.tokenExpiration!);
	const formattedDate = expirationDate.toLocaleDateString();

	const firstSignInDate = new Date(employee.firstSignInDate!);
	const formattedFirstSignInDate = firstSignInDate.toLocaleDateString();

	const isRegistrationLink = () => {
		if (employee.firstSignInDate) {
			return <p>Registered on {formattedFirstSignInDate}</p>;
		}
		// The token itself is never sent to the browser; its expiration is set
		// and cleared alongside it.
		if (employee.tokenExpiration) {
			return (
				<>
					<p className="highlight-color">
						Registration link sent. Link Expires on {formattedDate}
					</p>
				</>
			);
		} else {
			return <p className={style.muted}>Not registered yet</p>;
		}
	};
	const handelBack = () => {
		router.push({
			pathname: "/employees",
		});
	};
	const handleDelete = async (id: string) => {
		try {
			const response = await fetch(`/api/removeEmployee/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				router.push("/employees");
			} else {
				const body: unknown = await response.json().catch(() => ({}));
				setDeleteError(
					text(body, "error") || "Could not delete the employee. Please try again."
				);
			}
		} catch (error) {
			console.error("Error deleting Employee:", error);
			setDeleteError("Could not reach the server. Please try again.");
		} finally {
			toggleConfirmation(id);
		}
	};

	return (
		<div className="front-page">
			<Container className={`${style.topRow} justify-content-center`}>
				<div className={style.backgroundColor}>
					<Container className={` ${style.container}`}>
						<Row>
							<Col>
								<Button className="editBtn">
									<UpdateEmployeeModal data={employee} />
								</Button>
							</Col>
							<Col xs={6}>
								<h1>
									{employee.firstName} {employee.lastName}
								</h1>
							</Col>
							<Col>
								<Button
									className={"editBtn"}
									onClick={() => toggleConfirmation(employee._id)}
								>
									🗑
								</Button>
								<DeleteDialog
									isOpen={!!confirmationStates[employee._id]}
									toggle={() => toggleConfirmation(employee._id)}
									onConfirm={() => handleDelete(employee._id)}
								/>
							</Col>
						</Row>
						{deleteError && <div className={style.error}>{deleteError}</div>}

						<Row>
							<Col xs={12} md={4}>
								<h4>Email:</h4>
							</Col>
							<Col xs={12} md={8}>
								{employee.email ? (
									<p>{employee.email}</p>
								) : (
									<p className={style.muted}>No email yet</p>
								)}
							</Col>
						</Row>

						<Row>
							<Col xs={12} md={4}>
								<h4>Positions:</h4>
							</Col>
							<Col xs={12} md={8}>
								<span>
									{(employee.position || []).map((position, index) => (
										<p
											key={index}
											style={{ display: "inline-block", marginRight: "10px" }}
										>
											{position}
										</p>
									))}
								</span>
							</Col>
						</Row>

						<Col>{isRegistrationLink()}</Col>
					</Container>
					<Row>
						<Col className="mb-2" xs={12} sm={12} lg={12}>
							<Button onClick={handelBack} block>
								Back{" "}
							</Button>
						</Col>
						<Col xs={12} sm={12} lg={12}>
							<SendRegistrationLink employee={employee} />
						</Col>
					</Row>
				</div>
			</Container>
		</div>
	);
}

export const getServerSideProps: GetServerSideProps<Props> = async (data) => {
	// The [id] in the page's path, so always one string.
	const id = String(data.query.id);
	// A mistyped link is a 404, not a server error (new ObjectId throws on it).
	if (!isObjectId(id)) return { notFound: true };

	try {
		const client = await clientPromise;
		const db = client.db("TeragramBallroom");
		const employeeCollection = db.collection<EmployeeDoc>("employees");
		const employee = await employeeCollection.findOne<ManagerEmployeeDoc>(
			{ _id: new ObjectId(id) },
			{ projection: MANAGER_EMPLOYEE_FIELDS }
		);

		if (!employee) {
			// Return a 404 status for not found
			return {
				notFound: true,
			};
		}

		return {
			props: { employee: toJson(employee) },
		};
	} catch (error) {
		await reportError("Employee page", error);
		// Return a 500 status for internal server error
		return {
			props: {
				employee: null,
			},
		};
	}
};
