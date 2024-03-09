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
		console.log("New Employee: ", newEmployee);
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
				console.log("data", data.insertedEmployeeId);
				// Close the modal
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

	const NonActivePostionHandler = (position) => {
		console.log(typeof position.position);
		switch (position.position) {
			case "Bartender":
				return (
					<SelectNonActiveEmployee
						position={position}
						addNewEmployee={addNewEmployee}
						sortedBartenders={sortedBartenders}
						sortedBarBacks={sortedBarBacks}
						sortedCooks={sortedCooks}
						onClick={onClick}
					/>
				);
				break;
			case "Bar Back":
				return (
					<SelectNonActiveBarBack
						position={position}
						addNewEmployee={addNewEmployee}
						sortedBarBacks={sortedBarBacks}
						onClick={onClick}
					/>
				);
				break;
			case "Cook":
				return (
					<SelectNonActiveCook
						position={position}
						addNewEmployee={addNewEmployee}
						sortedCooks={sortedCooks}
						onClick={onClick}
					/>
				);
				break;
			default:
				break;
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
					<SelectNonActiveEmployee
						position={position}
						addNewEmployee={addNewEmployee}
						sortedBartenders={sortedBartenders}
						sortedBarBacks={sortedBarBacks}
						sortedCooks={sortedCooks}
						onClick={onClick}
					/>{" "}
					<ModalFooter>
						<Button onClick={toggleNested}>Register New Fill In</Button>

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
