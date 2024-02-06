import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
import style from "./Bartenders.module.css";
import { Button, Col, Container, Row } from "reactstrap";
import { UpdateEmployeeModal } from "./UpdateEmployeeModal";

const Cooks = ({ employees }) => {
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
			<h1 className={` text-color  ${style.center}`}>Cooks</h1>
			{sortedEmployees
				.filter((cook) => cook.position.includes("Cook"))
				.map((cook) => {
					return (
						<Container key={cook._id}>
							<Row>
								<Col>
									<Button className="editBtn">
										<UpdateEmployeeModal data={cook} />
									</Button>
								</Col>
								<Col>
									<p>
										<Link
											className="noDecoration text-color "
											href={`/getEmployee/${cook._id}`}
										>
											{`${cook.firstName} ${cook.lastName}`}
										</Link>
									</p>
								</Col>

								<Col>
									<Button
										className={style.trash}
										onClick={() => handleDelete(cook._id)}
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

export default Cooks;
