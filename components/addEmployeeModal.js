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
} from "reactstrap";
import style from "./addEmployee.module.css";

export function AddEmployeeModal(args) {
	const [modal, setModal] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");

	const toggle = () => setModal(!modal);

	const [newEmployee, setNewEmployee] = useState({
		firstName: "",
		lastName: "",
		position: [],
		tipsCollected: [
			{
				amount: Number,
				date: Date,
			},
		],
	});
	const handleInputChange = (e) => {
		if (e.target.name === "position") {
			const selectedOptions = Array.from(
				document.querySelectorAll('input[name="position"]:checked'),
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
	const handleAddEmployee = async (e) => {
		e.preventDefault();

		// if (
		// 	!newEmployee.firstName ||
		// 	!newEmployee.lastName ||
		// 	newEmployee.position.length === 0
		// ) {
		// 	alert("Please fill in all fields and select at least one position.");
		// 	return;
		// }
		if (newEmployee.position.length === 0) {
			setAlertMessage("Please select at least one position.");
			return;
		}

		try {
			const response = await fetch("http://localhost:3000/api/addEmployee", {
				method: "POST",
				headers: {
					"Content-Type": "application/json", // Specify the content type
				},
				body: JSON.stringify(newEmployee),
			});

			if (response.ok) {
				console.log("Employee added successfully");
				router.push("http://localhost:3000/employees");
				setNewEmployee({
					firstName: "",
					lastName: "",
					position: [],
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
			toggle();
		}
	};

	return (
		<div>
			<Button className="text-color" onClick={toggle}>
				Add Employee
			</Button>
			<Modal isOpen={modal} toggle={toggle} {...args}>
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
						<div>
							<Label check>
								<Input
									className={style.border}
									type="checkbox"
									name="position"
									value="Bartender"
									onChange={handleInputChange}
									onClick={() => setAlertMessage("")}
								/>
								Bartender
							</Label>
							<Label check>
								<Input
									className={style.border}
									type="checkbox"
									name="position"
									value="Bar Back"
									onChange={handleInputChange}
									onClick={() => setAlertMessage("")}
								/>
								Bar Back
							</Label>
							<Label check>
								<Input
									className={style.border}
									type="checkbox"
									name="position"
									value="Cook"
									onChange={handleInputChange}
									onClick={() => setAlertMessage("")}
								/>
								Cook
							</Label>
						</div>
						{alertMessage && (
							<div className={style.alertMessage}>{alertMessage}</div>
						)}
					</FormGroup>

					<ModalFooter>
						<Button type="submit" color="primary">
							Add Bartender
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
