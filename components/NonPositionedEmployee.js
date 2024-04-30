import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
import style from "./Bartenders.module.css";
import { Button, Col, Container, Row } from "reactstrap";
import { UpdateEmployeeModal } from "./UpdateEmployeeModal";
import { DeleteDialog } from "./ConformationDialog";
import { useState } from "react";

const NonPositionedEmployee = ({ employees }) => {
	const router = useRouter();

	const [confirmationStates, setConfirmationStates] = useState({});

	const toggleConfirmation = (id) => {
		setConfirmationStates({
			...confirmationStates,
			[id]: !confirmationStates[id],
		});
	};

	// Sort employees array by last name
	const sortedEmployees = employees.sort((a, b) =>
		a.lastName.localeCompare(b.lastName)
	);

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
	};
	return (
		<Container className={style.employeeList}>
			<h1 className={` text-color  ${style.center}`}>
				Employees without a position
			</h1>
			{sortedEmployees
				.filter((employee) => employee.position.length === 0)
				.map((employee) => {
					return (
						<Container key={employee._id}>
							<Row>
								<Col>
									<Button className="editBtn">
										<UpdateEmployeeModal data={employee} />
									</Button>
								</Col>
								<Col>
									<p>
										<Link
											className="noDecoration text-color "
											href={`/getEmployee/${employee._id}`}
										>
											{`${employee.firstName} ${employee.lastName}`}
										</Link>
									</p>
								</Col>

								<Col>
									{/* <Button
										className={style.trash}
										onClick={() => toggleConfirmation(employee._id)}
									>
										🗑
									</Button> */}
									<DeleteDialog
										isOpen={!!confirmationStates[employee._id]}
										toggle={() => toggleConfirmation(employee._id)}
										onConfirm={() => handleDelete(employee._id)}
									/>
								</Col>
								<div className="seperationLine"></div>
							</Row>
						</Container>
					);
				})}
		</Container>
	);
};

export default NonPositionedEmployee;
