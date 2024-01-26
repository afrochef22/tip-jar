import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import Link from "next/link";
import { useRouter } from "next/router";
import style from "./Bartenders.module.css";
import { Button, Col, Container, Row } from "reactstrap";

const Bartenders = ({ bartenders }) => {
	const router = useRouter();

	const handleDelete = async (id) => {
		console.log(`id: ${id}`);
		try {
			const response = await fetch(`/api/removeBartender/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				console.log("Bartender deleted successfully");
				router.push("/bartenders");
			} else {
				console.error("Failed to delete Bartender");
			}
		} catch (error) {
			console.error("Error deleting bartender:", error);
		}
	};

	return (
		<Container className={style.employeeList}>
			<h1 className={` primary-color ${style.center}`}>Bartenders</h1>
			{bartenders.map((bartender) => (
				<Container key={bartender._id}>
					<Row>
						<Col>
							<p>
								<Link
									className="noDecoration primary-color"
									href={`/getBartender/${bartender._id}`}
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
								<FontAwesomeIcon icon="fa-solid fa-trash" />{" "}
							</Button>
						</Col>
					</Row>
				</Container>
			))}
			<Button className={style.green}>
				<Link className="noDecoration text-color" href={"/addBartender"}>
					Add Bartender
				</Link>
			</Button>
		</Container>
	);
};

export default Bartenders;
