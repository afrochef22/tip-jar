import { useState, useEffect } from "react";
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
} from "reactstrap";
import type { ChangeEvent, FormEvent } from "react";
import type { ModalProps } from "reactstrap";
import style from "./addEmployee.module.css";
import { text } from "../lib/field";
import type { Position } from "../types/models";

// The form's state. tipsCollected holds the Number and Date constructors as a
// placeholder; JSON.stringify drops them and the API ignores the field.
type NewEmployeeForm = {
	firstName: string;
	lastName: string;
	position: string[]; // values of the ticked position checkboxes
	active: boolean;
	tipsCollected: { amount: NumberConstructor; date: DateConstructor }[];
};

export function AddEmployeeModal({ position, args }: { position: Position; args?: Partial<ModalProps> }) {
	const [modal, setModal] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");
	const toggle = () => setModal(!modal);

	const [newEmployee, setNewEmployee] = useState<NewEmployeeForm>({
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
	// Update the initial position based on the passed prop
	useEffect(() => {
		if (position) {
			setNewEmployee((prevEmployee) => ({
				...prevEmployee,
				position: [position],
			}));
		}
	}, [position]);
	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		if (e.target.name === "position") {
			const selectedOptions = Array.from(
				document.querySelectorAll<HTMLInputElement>('input[name="position"]:checked'),
				(checkbox) => checkbox.value
			);
			setNewEmployee((prevEmployee) => ({
				...prevEmployee,
				position: selectedOptions,
			}));
		} else {
			setNewEmployee({ ...newEmployee, [e.target.name]: e.target.value });
		}
	};

	const router = useRouter();

	const handleAddEmployee = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();

		if (newEmployee.position.length === 0) {
			setAlertMessage("Please select at least one position.");
			return;
		}

		try {
			const response = await fetch("/api/addEmployee", {
				method: "POST",
				headers: {
					"Content-Type": "application/json", // Specify the content type
				},
				body: JSON.stringify(newEmployee),
			});

			if (response.ok) {
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
				toggle();
			} else {
				const body: unknown = await response.json().catch(() => ({}));
				setAlertMessage(text(body, "message") || "Could not add employee. Please try again.");
			}
		} catch (error) {
			console.error(error);
			setAlertMessage("Could not reach the server. Please try again.");
		}
	};

	return (
		<div>
			<div
				className={`${style.buttonContainer} ${style.background} ${style.backgroundEffect}`}
			>
				<Button
					className={`text-color ${style.addEmployeeButton} $ `}
					onClick={toggle}
				>
					Add {position}
				</Button>
			</div>
			<Modal isOpen={modal} toggle={toggle} {...args}>
				<ModalHeader toggle={toggle}>Add Employee</ModalHeader>
				<Form onSubmit={handleAddEmployee}>
					<FormGroup className={style.group}>
						<Label>First Name:</Label>
						<Input
							className={`${style.border} ${style.requiredBorder}`}
							type="text"
							name="firstName"
							onChange={handleInputChange}
							required={true}
						/>
					</FormGroup>
					<FormGroup className={style.group}>
						<Label>Last Name:</Label>
						<Input
							className={`${style.border} ${style.requiredBorder}`}
							type="text"
							name="lastName"
							onChange={handleInputChange}
							required={true}
						/>
					</FormGroup>
					<FormGroup className={style.group}>
						<Label>Position:</Label>
						<div>
							<Label check>
								<Input
									className={style.checkBox}
									type="checkbox"
									name="position"
									value="Bartender"
									onChange={handleInputChange}
									onClick={() => setAlertMessage("")}
									checked={newEmployee.position.includes("Bartender")}
								/>
								Bartender
							</Label>
							<Label check>
								<Input
									className={style.checkBox}
									type="checkbox"
									name="position"
									value="Bar Back"
									onChange={handleInputChange}
									onClick={() => setAlertMessage("")}
									checked={newEmployee.position.includes("Bar Back")}
								/>
								Bar Back
							</Label>
							<Label check>
								<Input
									className={style.checkBox}
									type="checkbox"
									name="position"
									value="Cook"
									onChange={handleInputChange}
									onClick={() => setAlertMessage("")}
									checked={newEmployee.position.includes("Cook")}
								/>
								Cook
							</Label>
							<Label check>
								<Input
									className={style.checkBox}
									type="checkbox"
									name="position"
									value="No Position"
									onChange={handleInputChange}
									onClick={() => setAlertMessage("")}
									checked={newEmployee.position.includes("No Position")}
								/>
								No Position
							</Label>
						</div>
						{alertMessage && (
							<div className={style.alertMessage}>{alertMessage}</div>
						)}
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
