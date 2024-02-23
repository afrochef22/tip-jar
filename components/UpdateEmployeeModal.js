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
import style from "./addEmployee.module.css";

export function UpdateEmployeeModal(props, args) {
	const [modal, setModal] = useState(false);

	const toggle = () => setModal(!modal);

	const [employeeUpdate, setEmployeeUpdate] = useState({
		firstName: "",
		lastName: "",
		position: [],
		active: "",
		tipsCollected: [
			{
				amount: Number,
				date: Date,
			},
		],
	});

	const handleInputChange = (e) => {
		if (e.target.name === "position") {
			const isChecked = e.target.checked;
			const positionValue = e.target.value;

			setEmployeeUpdate((prevEmployee) => {
				let updatedPositions;

				if (isChecked) {
					// Checkbox is being selected
					updatedPositions = [...prevEmployee.position, positionValue];
				} else {
					// Checkbox is being deselected
					updatedPositions = prevEmployee.position.filter(
						(position) => position !== positionValue
					);
				}

				return {
					...prevEmployee,
					position: updatedPositions,
				};
			});
		} else if (e.target.name === "active") {
			// handle active status changes
			setEmployeeUpdate((prevEmployee) => ({
				...prevEmployee,
				active: e.target.checked, // Set the active status based on checkbox state
			}));
		} else {
			setEmployeeUpdate((prevEmployee) => ({
				...prevEmployee,
				[e.target.name]: e.target.value,
			}));
		}
	};

	useEffect(() => {
		// Set initial state when employee data changes
		setEmployeeUpdate({
			firstName: props.data.firstName,
			lastName: props.data.lastName,
			position: props.data.position, // Pre-populate positions
			active: props.data.active,
		});
	}, [props.data]);

	const router = useRouter();
	const handleUpdateEmployee = async (e) => {
		e.preventDefault();

		try {
			const response = await fetch(`/api/updateEmployee/${props.data._id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json", // Specify the content type
				},

				body: JSON.stringify({
					firstName: employeeUpdate.firstName,
					lastName: employeeUpdate.lastName,
					position: employeeUpdate.position,
					active: employeeUpdate.active,
				}),
			});

			if (response.ok) {
				console.log("Employee updated successfully");
				router.push("/employees");
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
			<div onClick={toggle}>✏️</div>
			<Modal isOpen={modal} toggle={toggle} {...args}>
				<ModalHeader toggle={toggle}>
					Edit {props.data.firstName} {props.data.lastName} info.
				</ModalHeader>
				<Form onSubmit={handleUpdateEmployee}>
					<FormGroup className={style.group}>
						<Label>First Name:</Label>
						<Input
							className={style.border}
							type="text"
							name="firstName"
							onChange={handleInputChange}
							placeholder={props.data.firstName}
						/>
					</FormGroup>
					<FormGroup className={style.group}>
						<Label>Last Name:</Label>
						<Input
							className={style.border}
							type="text"
							name="lastName"
							onChange={handleInputChange}
							placeholder={props.data.lastName}
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
									checked={employeeUpdate.position.includes("Bartender")}
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
									checked={employeeUpdate.position.includes("Bar Back")}
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
									checked={employeeUpdate.position.includes("Cook")}
								/>
								Cook
							</Label>
						</div>
					</FormGroup>
					<FormGroup className={style.group}>
						<Label>Active:</Label>
						<div>
							<Label check>
								<Input
									className={style.border}
									type="checkbox"
									name="active"
									// value="Bartender"
									onChange={handleInputChange}
									checked={employeeUpdate.active}
								/>
							</Label>
						</div>
					</FormGroup>

					<ModalFooter>
						<Button type="submit" color="primary">
							Update
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
