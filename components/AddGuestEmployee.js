import { useState } from "react";
import { useRouter } from "next/router";
import {
	Form,
	FormGroup,
	Button,
	Label,
	Input,
	Modal,
	ModalHeader,
	ModalFooter,
	Row,
	Col,
	ModalBody,
	Container,
} from "reactstrap";
import style from "./addEmployee.module.css";
import style2 from "./SelectEmployee.module.css";

import SelectNonActiveEmployee from "./SelectNonActiveEmployee";

export default function AddGuestEmployee({
	position,
	addNewEmployee,
	sortedBartenders,
	onClick,
	sortedBarBacks,
	sortedCooks,
}) {
	const [modal, setModal] = useState(false);
	const [nestedModal, setNestedModal] = useState(false);
	const [closeAll, setCloseAll] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");
	const [newEmployee, setNewEmployee] = useState({
		id: 0,
		firstName: "",
		lastName: "",
		position: [],
		checked: true, // Assuming all new employees are initially checked
		workingPosition: position, // Assigning the working position
		tipsBroughtIn: 0,
		tippedHours: 0,
		tipOut: 0,
	});
	const toggle = () => setModal(!modal);
	const toggleNested = () => {
		setNestedModal(!nestedModal);
		setCloseAll(false);
		setAlertMessage("");
	};
	const toggleAll = () => {
		setNestedModal(!nestedModal);
		setCloseAll(true);
	};

	const handleInputChange = (e) => {
		setNewEmployee({
			...newEmployee,
			[e.target.name]: e.target.value,
			position: [position],
			active: false,
		});
	};

	const handleAddEmployee = async (e) => {
		e.preventDefault();
		// Combine first name and last name to form the label
		const label = `${newEmployee.firstName} ${newEmployee.lastName}`;

		try {
			const response = await fetch("/api/addEmployee", {
				method: "POST",
				headers: {
					"Content-Type": "application/json", // Specify the content type
				},
				body: JSON.stringify(newEmployee),
			});

			if (response.ok) {
				const data = await response.json();
				const newEmployeeData = {
					id: data.insertedEmployeeId,
					label,
					position: [position],
					checked: newEmployee.checked,
					active: false,
					workingPosition: position,
					tipsBroughtIn: 0,
					tippedHours: 0,
					tipOut: 0,
				};

				// Pass the new employee data to the parent component
				addNewEmployee(newEmployeeData);
				// Reset the form and close the modal
				setNewEmployee({
					firstName: "",
					lastName: "",
					position: [],
					active: true,
					tipsCollected: [
						{
							amount: Number,
							date: Date,
						},
					],
				});
				setAlertMessage(""); // Clear the alert message
				toggleNested();
			} else {
				const body = await response.json().catch(() => ({}));
				setAlertMessage(
					body.message || "Could not add employee. Please try again."
				);
			}
		} catch (error) {
			console.error(error);
			setAlertMessage("Could not reach the server. Please try again.");
		}
	};

	return (
		<div>
			<Row
				onClick={toggle}
				className={`${style2.seperationLine} ${style.clickEmployee} ${style2.clickEmployee}`}
			>
				<Col xs={12}>
					<Label className="highlight-color">+ Add a fill-in</Label>
				</Col>
			</Row>
			<Modal isOpen={modal} toggle={toggle}>
				<ModalHeader toggle={toggle}>
					{" "}
					<Button className="apple-blue-background " onClick={toggleNested}>
						Register New Fill In
					</Button>
				</ModalHeader>
				<ModalBody>
					<SelectNonActiveEmployee
						position={position}
						addNewEmployee={addNewEmployee}
						sortedBartenders={sortedBartenders}
						sortedBarBacks={sortedBarBacks}
						sortedCooks={sortedCooks}
						onClick={onClick}
					/>{" "}
					<ModalFooter>
						<Button className="apple-blue-background" onClick={toggleNested}>
							Register New Fill In
						</Button>

						<Button color="success" onClick={toggle}>
							Done
						</Button>
					</ModalFooter>
				</ModalBody>

				<Modal
					isOpen={nestedModal}
					toggle={toggleNested}
					onClosed={closeAll ? toggle : undefined}
				>
					<ModalHeader toggle={toggle}>Add Employee</ModalHeader>
					<Form onSubmit={handleAddEmployee}>
						<FormGroup className={style.group}>
							<Label>First Name:</Label>
							<Input
								className={style.border}
								type="text"
								name="firstName"
								onChange={handleInputChange}
								required={true}
							/>
						</FormGroup>
						<FormGroup className={style.group}>
							<Label>Last Name:</Label>
							<Input
								className={style.border}
								type="text"
								name="lastName"
								onChange={handleInputChange}
								required={true}
							/>
						</FormGroup>
						<FormGroup className={style.group}>
							<Label>Position:</Label>
							<Input
								className={style.border}
								type="text"
								name="position"
								readOnly
								value={position}
								required={true}
							/>
						</FormGroup>
						{alertMessage && (
							<div className={style.alertMessage}>{alertMessage}</div>
						)}

						<ModalFooter>
							<Button type="submit" color="primary">
								Add Employee
							</Button>{" "}
							<Button color="secondary" onClick={toggleNested}>
								Cancel
							</Button>
						</ModalFooter>
					</Form>
				</Modal>
			</Modal>
		</div>
	);
}
