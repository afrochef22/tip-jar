import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
import style from "./Bartenders.module.css";
import { Button, Col, Container, Row } from "reactstrap";
import { UpdateEmployeeModal } from "./UpdateEmployeeModal";
import { DeleteDialog } from "./ConformationDialog";
import { useState } from "react";

const BarBacks = ({ employees }) => {
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
			<h1 className={` text-color  ${style.center}`}>Bar Backs</h1>
			{sortedEmployees
				.filter((barBacks) => barBacks.position.includes("Bar Back"))
				.map((barBacks) => {
					return (
						<Container key={barBacks._id}>
							<Row>
								<Col>
									<Button className="editBtn">
										<UpdateEmployeeModal data={barBacks} />
									</Button>
								</Col>
								<Col>
									<p>
										<Link
											className="noDecoration text-color "
											href={`/getEmployee/${barBacks._id}`}
											// href={`#`}
										>
											{`${barBacks.firstName} ${barBacks.lastName}`}
										</Link>
									</p>
								</Col>

								<Col>
									{/* <Button
										className={style.trash}
										onClick={() => toggleConfirmation(barBacks._id)}
									>
										🗑
									</Button> */}
									<DeleteDialog
										isOpen={!!confirmationStates[barBacks._id]}
										toggle={() => toggleConfirmation(barBacks._id)}
										onConfirm={() => handleDelete(barBacks._id)}
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

export default BarBacks;
