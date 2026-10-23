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
	ModalBody,
	ModalFooter,
} from "reactstrap";
import form from "./CreditTipForm.module.css";
import edit from "./TipBreakDown.module.css";
import style from "./addEmployee.module.css";

const POSITIONS = ["Bartender", "Bar Back", "Cook", "No Position"];

// Filled in from the employee each time the window opens, so Cancel throws
// away anything typed.
const fromEmployee = (data) => ({
	firstName: data.firstName ?? "",
	lastName: data.lastName ?? "",
	email: data.email ?? "",
	position: data.position ?? [],
	active: data.active !== false,
});

export function UpdateEmployeeModal({ data }) {
	const [modal, setModal] = useState(false);
	const [saveError, setSaveError] = useState("");
	const [employeeUpdate, setEmployeeUpdate] = useState(fromEmployee(data));
	const router = useRouter();

	const toggle = () => {
		if (!modal) setEmployeeUpdate(fromEmployee(data));
		setSaveError("");
		setModal(!modal);
	};

	const handleInputChange = (e) => {
		const { name, value } = e.target;
		setEmployeeUpdate((prev) => ({ ...prev, [name]: value }));
	};

	const togglePosition = (position) => {
		setEmployeeUpdate((prev) => ({
			...prev,
			position: prev.position.includes(position)
				? prev.position.filter((p) => p !== position)
				: [...prev.position, position],
		}));
	};

	const handleUpdateEmployee = async (e) => {
		e.preventDefault();
		if (employeeUpdate.position.length === 0) {
			setSaveError("Pick at least one position.");
			return;
		}

		try {
			const response = await fetch(`/api/updateEmployee/${data._id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					firstName: employeeUpdate.firstName,
					lastName: employeeUpdate.lastName,
					position: employeeUpdate.position,
					active: employeeUpdate.active,
					email: employeeUpdate.email,
				}),
			});

			if (response.ok) {
				toggle();
				router.push("/employees");
				return;
			}
			const body = await response.json().catch(() => ({}));
			setSaveError(body.error || "Could not save the changes. Please try again.");
		} catch (error) {
			console.error(error);
			setSaveError("Could not reach the server. Please try again.");
		}
	};

	return (
		<div>
			<div onClick={toggle}>✏️</div>
			<Modal isOpen={modal} toggle={toggle} centered contentClassName={edit.editModal}>
				<ModalHeader toggle={toggle} className={edit.editHeader}>
					Edit {data.firstName} {data.lastName}
				</ModalHeader>
				<Form onSubmit={handleUpdateEmployee}>
					<ModalBody className={style.editBody}>
						<FormGroup className={form.field}>
							<Label for="firstName" className={form.label}>
								First name
							</Label>
							<Input
								id="firstName"
								name="firstName"
								type="text"
								required
								value={employeeUpdate.firstName}
								onChange={handleInputChange}
							/>
						</FormGroup>
						<FormGroup className={form.field}>
							<Label for="lastName" className={form.label}>
								Last name
							</Label>
							<Input
								id="lastName"
								name="lastName"
								type="text"
								required
								value={employeeUpdate.lastName}
								onChange={handleInputChange}
							/>
						</FormGroup>
						<FormGroup className={form.field}>
							<Label for="email" className={form.label}>
								Email <span className={form.optional}>(optional)</span>
							</Label>
							<Input
								id="email"
								name="email"
								type="email"
								autoCapitalize="none"
								placeholder="name@example.com"
								value={employeeUpdate.email}
								onChange={handleInputChange}
							/>
						</FormGroup>
						<div className={form.field}>
							<div className={form.label}>Positions</div>
							<div className={style.chips}>
								{POSITIONS.map((position) => {
									const on = employeeUpdate.position.includes(position);
									return (
										<button
											key={position}
											type="button"
											aria-pressed={on}
											className={`${style.chip} ${on ? style.chipOn : ""}`}
											onClick={() => togglePosition(position)}
										>
											{on ? "✓ " : ""}
											{position}
										</button>
									);
								})}
							</div>
						</div>
						<FormGroup switch className={style.activeSwitch}>
							<Input
								type="switch"
								role="switch"
								id="active"
								checked={employeeUpdate.active}
								onChange={() =>
									setEmployeeUpdate((prev) => ({ ...prev, active: !prev.active }))
								}
							/>
							<Label check for="active">
								{employeeUpdate.active ? "Active" : "Back up"}
								<span className={style.switchHint}>
									{employeeUpdate.active
										? "Shows in the who's working list"
										: "Only shows as a fill-in"}
								</span>
							</Label>
						</FormGroup>

						{saveError && (
							<div className={`${edit.notice} ${edit.noticeDanger}`} role="alert">
								{saveError}
							</div>
						)}
					</ModalBody>
					<ModalFooter className={style.editFooter}>
						<Button type="button" className={form.backButton} onClick={toggle}>
							Cancel
						</Button>
						<Button type="submit" className={form.primaryButton}>
							Save changes
						</Button>
					</ModalFooter>
				</Form>
			</Modal>
		</div>
	);
}
