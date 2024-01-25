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
		<Container>
			<h1>Bartenders</h1>
			{bartenders.map((bartender) => (
				<Container key={bartender._id}>
					<Row>
						<Col>
							<p>
								<Link href={`/getBartender/${bartender._id}`}>
									{`${bartender.firstName} ${bartender.lastName}`}
								</Link>
							</p>
						</Col>
						<Col>
							<Button
								className={style.red}
								onClick={() => handleDelete(bartender._id)}
							>
								Delete
							</Button>
						</Col>
					</Row>
				</Container>
			))}
			<Button>
				<Link href={"/addBartender"}>Add Bartender</Link>
			</Button>
		</Container>
	);
};

export default Bartenders;
