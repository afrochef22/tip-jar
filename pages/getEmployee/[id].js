import clientPromise from "../../lib/mongodb";
import { useRouter } from "next/router";
import { ObjectId } from "mongodb";
import Link from "next/link";
import React, { useState } from "react";
import SendRegistrationLink from "../../components/SendRegistrationLink";
import style from "../../components/TipBreakDown.module.css";
import { Button, Col, Container, Row } from "reactstrap";
import { UpdateEmployeeModal } from "../../components/UpdateEmployeeModal";
import { DeleteDialog } from "../../components/ConformationDialog";

export default function getEmployee({ employee }) {
	const router = useRouter();
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [confirmationStates, setConfirmationStates] = useState({});

	const toggleConfirmation = (id) => {
		setConfirmationStates({
			...confirmationStates,
			[id]: !confirmationStates[id],
		});
	};
	const toggle = () => setShowConfirmation(!showConfirmation);
	if (!employee) {
		// Handle the case when employee is not found
		return <div>employee not found</div>;
	}
	const expirationDate = new Date(employee.tokenExpiration);
	const formattedDate = expirationDate.toLocaleDateString();

	const firstSignInDate = new Date(employee.firstSignInDate);
	const formattedFirstSignInDate = firstSignInDate.toLocaleDateString();

	const isRegistrationLink = () => {
		if (employee.token && employee.firstSignInDate) {
			return <p>Registered on {formattedFirstSignInDate}</p>;
		}
		if (employee.token) {
			return (
				<>
					<p className="highlight-color">
						Registration link sent. Link Expires on {formattedDate}
					</p>
				</>
			);
		} else {
			return <></>;
		}
	};
	const handelBack = () => {
		router.push({
			pathname: "/employees",
		});
	};
	const handleDelete = async (id) => {
		console.log(`id: ${id}`);
		try {
			const response = await fetch(`/api/removeEmployee/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				console.log("Employee deleted successfully");
				router.push("/employees");
			} else {
				console.error("Failed to delete Employee");
			}
		} catch (error) {
			console.error("Error deleting Employee:", error);
		}
		toggle();
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
							<Col>
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

						<Row>
							<Col xs={12} md={4}>
								<h4>Email:</h4>
							</Col>
							<Col xs={12} md={8}>
								<p>{employee.email}</p>
							</Col>
						</Row>

						<Row>
							<Col xs={12} md={4}>
								<h4>Postions:</h4>
							</Col>
							<Col xs={12} md={8}>
								<span>
									{employee.position.map((position, index) => (
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
