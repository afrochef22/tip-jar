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
import style from "./addBartender.module.css";

export function AddBartenderModal(args) {
	const [modal, setModal] = useState(false);

	const toggle = () => setModal(!modal);

	const [newBartender, setNewBartender] = useState({
		firstName: "",
		lastName: "",
	});

	const handleInputChange = (e) => {
		setNewBartender({ ...newBartender, [e.target.name]: e.target.value });
	};

	const router = useRouter();
	const handleAddBartender = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch("http://localhost:3000/api/addBartender", {
				method: "POST",
				headers: {
					"Content-Type": "application/json", // Specify the content type
				},
				body: JSON.stringify(newBartender),
			});
			console.log(response);
			if (response.ok) {
				console.log("Bartender added successfully");
				router.push("http://localhost:3000/bartenders");
			} else {
				console.log("response not ok");
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div>
			<Button className="text-color" onClick={toggle}>
				Add Bartender
			</Button>
			<Modal isOpen={modal} toggle={toggle} {...args}>
				<ModalHeader toggle={toggle}>Add Bartender</ModalHeader>
				<Form onSubmit={handleAddBartender}>
					<FormGroup className={style.group}>
						<Label col-2>First Name:</Label>
						<Input
							className={style.border}
							col-6
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
					<ModalFooter>
						<Button type="submit" color="primary" onClick={toggle}>
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
