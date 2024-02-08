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
} from "reactstrap";
import style from "./addEmployee.module.css";
import style2 from "./SelectEmployee.module.css";

import { v4 as uuidv4 } from "uuid";

export default function AddGuestEmployee({ position, addNewEmployee }) {
	const [modal, setModal] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");
	const [newEmployee, setNewEmployee] = useState({
		id: 0,
		firstName: "",
		lastName: "",
		position: "",
		checked: true, // Assuming all new employees are initially checked
		workingPosition: position, // Assigning the working position
		tipsBroughtIn: 0,
		tippedHours: 0,
		tipOut: 0,
	});
	const toggle = () => setModal(!modal);

	const handleInputChange = (e) => {
		setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
	};

	function generateRandomId() {
		return uuidv4();
	}

	const handleAddEmployee = (e) => {
		e.preventDefault();
		// Generate a random ID
		const id = generateRandomId();
		// Combine first name and last name to form the label
		const label = `${newEmployee.firstName} ${newEmployee.lastName}`;
		// Create the new employee object
		const newEmployeeData = {
			id,
			label,
			position: [position],
			checked: newEmployee.checked,
			workingPosition: position,
			tipsBroughtIn: 0,
			tippedHours: 0,
			tipOut: 0,
		};
		// Pass the new employee data to the parent component
		addNewEmployee(newEmployeeData);
		// Close the modal
		toggle();
		// Reset the form fields
		setNewEmployee({
			id: 0,
			firstName: "",
			lastName: "",
			position: [""],
			checked: true,
			workingPosition: position,
			tipsBroughtIn: 0,
			tippedHours: 0,
			tipOut: 0,
		});
	};

	return (
		<div>
			<Row
				onClick={toggle}
				className={`${style2.seperationLine} ${style.clickEmployee}`}
			>
				<Col xs={8} sm={8} md={8}>
					<Label className="highlight-color">+ Fill In</Label>
				</Col>
				<Col xs={4} sm={4} md={4}>
					<div className={style2.unCheckBox}></div>
				</Col>
			</Row>
			<Modal isOpen={modal} toggle={toggle}>
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
							value={position}
							required={true}
						/>
					</FormGroup>

					<ModalFooter>
						<Button type="submit" color="primary">
							Add Employee
						</Button>{" "}
						<Button color="secondary" onClick={toggle}>
							Cancel
						</Button>
					</ModalFooter>
				</Form>
			</Modal>
		</div>
	);
}
