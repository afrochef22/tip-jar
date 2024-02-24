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

import { v4 as uuidv4 } from "uuid";
import SelectNonActiveBartender from "./SelectNonActiveBartender";

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
	};
	const toggleAll = () => {
		setNestedModal(!nestedModal);
		setCloseAll(true);
	};

	const handleInputChange = (e) => {
		console.log(e.target);
		setNewEmployee({
			...newEmployee,
			[e.target.name]: e.target.value,
			position: [position],
			active: false,
		});
	};

	function generateRandomId() {
		return uuidv4();
	}

	const handleAddEmployee = async (e) => {
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
			active: false,
			workingPosition: position,
			tipsBroughtIn: 0,
			tippedHours: 0,
			tipOut: 0,
		};
		// Pass the new employee data to the parent component
		addNewEmployee(newEmployeeData);
		// Close the modal
		toggleNested();
		// Reset the form fields
		setNewEmployee({
			firstName: "",
			lastName: "",
			position: [""],
			checked: true,
			active: false,
			workingPosition: position,
			tipsBroughtIn: 0,
			tippedHours: 0,
			tipOut: 0,
		});

		try {
			const response = await fetch("/api/addEmployee", {
				method: "POST",
				headers: {
					"Content-Type": "application/json", // Specify the content type
				},
				body: JSON.stringify(newEmployee),
			});

			if (response.ok) {
				console.log("Employee added successfully");
				router.push("/employees");
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
			} else {
				console.log("response not ok");
			}
		} catch (error) {
			console.log(error);
		} finally {
			toggleNested();
		}
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
				<ModalHeader toggle={toggle}>Select Employee</ModalHeader>
				<ModalBody>
					<SelectNonActiveBartender
						position={position}
						addNewEmployee={addNewEmployee}
						sortedBartenders={sortedBartenders}
						sortedBarBacks={sortedBarBacks}
						sortedCooks={sortedCooks}
						onClick={onClick}
					/>
					<ModalFooter>
						<Button color="success" onClick={toggleNested}>
							Register New Fill In
						</Button>

						<Button onClick={toggle}>Done</Button>
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
								value={position}
								required={true}
							/>
						</FormGroup>

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
