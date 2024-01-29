import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useRouter } from "next/router";
import style from "./Bartenders.module.css";
import { Button, Col, Container, Row } from "reactstrap";
import { UpdateEmployeeModal } from "./UpdateEmployeeModal";

const BarBacks = ({ employees }) => {
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
			<h1 className={` primary-color ${style.center}`}>Bar Backs</h1>
			{sortedEmployees
				.filter((barBacks) => barBacks.position.includes("Bar Back"))
				.map((barBacks) => {
					return (
						<Container key={barBacks._id}>
							<Row>
								<Col>
									<p>
										<Link
											className="noDecoration primary-color"
											href={`/getEmployee/${barBacks._id}`}
										>
											{`${barBacks.firstName} ${barBacks.lastName}`}
										</Link>
									</p>
								</Col>

								<Col>
									<Button>
										<UpdateEmployeeModal data={barBacks} />
									</Button>
									<Button
										className={style.trash}
										onClick={() => handleDelete(barBacks._id)}
									>
										delete
									</Button>
								</Col>
							</Row>
						</Container>
					);
				})}
		</Container>
	);
};

export default BarBacks;
