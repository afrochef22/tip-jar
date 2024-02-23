import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
import style from "./Bartenders.module.css";
import { Button, Col, Container, Row } from "reactstrap";
import { UpdateEmployeeModal } from "./UpdateEmployeeModal";

const Bartenders = ({ employees }) => {
	const router = useRouter();

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
			<h1 className={` text-color ${style.center}`}>Bartenders</h1>
			{sortedEmployees
				.filter((bartender) => bartender.position.includes("Bartender"))

				.map((bartender) => {
					return (
						<Container key={bartender._id}>
							<Row>
								<Col>
									<Button className="editBtn">
										<UpdateEmployeeModal data={bartender} />
									</Button>
								</Col>
								<Col>
									<p>
										<Link
											className="noDecoration text-color "
											href={`/getEmployee/${bartender._id}`}
										>
											{`${bartender.firstName} ${bartender.lastName}`}
										</Link>
									</p>
								</Col>

								<Col>
									<Button
										className={style.trash}
										onClick={() => handleDelete(bartender._id)}
									>
										🗑
									</Button>
								</Col>
								<div className="seperationLine"></div>
							</Row>
						</Container>
					);
				})}
		</Container>
	);
};

export default Bartenders;
