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
import type { ChangeEvent, FormEvent } from "react";
import style from "./addEmployee.module.css";
import style2 from "./SelectEmployee.module.css";

import SelectNonActiveEmployee from "./SelectNonActiveEmployee";
import type { Position, WorkerOption, WorkingPosition } from "../types/models";
import type { AddNewEmployee, PickEmployee } from "./SelectEmployeeDisplay";
import { stringField, text } from "../lib/field";

// The form's state.
type NewFillIn = {
	id: number;
	firstName: string;
	lastName: string;
	position: Position[];
	checked: boolean;
	workingPosition: WorkingPosition;
	tipsBroughtIn: number;
	tippedHours: number;
	tipOut: number;
	active?: boolean;
};

// A blank form. Used to start and again after each fill-in is added, so a
// second fill-in comes through ticked like the first.
const emptyFillIn = (position: WorkingPosition): NewFillIn => ({
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

export default function AddGuestEmployee({
	position,
	addNewEmployee,
	sortedBartenders,
	onClick,
	sortedBarBacks,
	sortedCooks,
}: {
	position: WorkingPosition;
	addNewEmployee: AddNewEmployee;
	onClick: PickEmployee;
	// The list for `position`; the other two aren't passed.
	sortedBartenders?: WorkerOption[];
	sortedBarBacks?: WorkerOption[];
	sortedCooks?: WorkerOption[];
}) {
	const [modal, setModal] = useState(false);
	const [nestedModal, setNestedModal] = useState(false);
	const [closeAll, setCloseAll] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");
	const [newEmployee, setNewEmployee] = useState<NewFillIn>(() => emptyFillIn(position));
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

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		setNewEmployee({
			...newEmployee,
			[e.target.name]: e.target.value,
			position: [position],
			active: false,
		});
	};

	const handleAddEmployee = async (e: FormEvent<HTMLFormElement>) => {
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
				const data: unknown = await response.json();
				const newEmployeeData: WorkerOption = {
					id: stringField(data, "insertedEmployeeId"),
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
				setNewEmployee(emptyFillIn(position));
				setAlertMessage(""); // Clear the alert message
				toggleNested();
			} else {
				const body: unknown = await response.json().catch(() => ({}));
				setAlertMessage(
					text(body, "message") || "Could not add employee. Please try again."
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
