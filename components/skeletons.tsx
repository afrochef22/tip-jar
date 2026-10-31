import styles from "./skeleton.module.css";
import { Row, Col, Label, Container } from "reactstrap";

export function CardSkeleton() {
	return (
		<Row className={` ${styles.center}`}>
			<Col sm={4}>
				<Container className={`${styles.shimmer} ${styles.bandContainer} `}>
					<Row>
						<Col sm={10} xs={10}>
							<Label></Label>
						</Col>
					</Row>
				</Container>
			</Col>
		</Row>
	);
}

export function CardsSkeleton() {
	return <CardSkeleton />;
}
