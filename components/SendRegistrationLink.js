import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { Button } from "reactstrap";
import { CustomAlertModal } from "./ConformationDialog";
import { useState } from "react";

const GenerateRegistrationToken = async (employee) => {
	const token = uuidv4();

	const expiryTime = new Date();
	expiryTime.setDate(expiryTime.getDate() + 7);

	const toggleConfirmation = (id) => {
		setConfirmationStates({
			...confirmationStates,
			[id]: !confirmationStates[id],
		});
	};
	const toggle = () => setShowConfirmation(!showConfirmation);
	console.log("employee._id", typeof employee._id);
	try {
		const response = await fetch(`/api/updateEmployee/${employee._id}`, {
			method: "PATCH",
			headers: {
				"Content-Type": "application/json", // Specify the content type
			},

			body: JSON.stringify({
				token: token,
				tokenExpiration: expiryTime,
			}),
		});

		if (response.ok) {
			console.log("Employee updated successfully");
		} else {
			console.log("response not ok");
		}
	} catch (error) {
		console.log(error);
	}

	return token;
};

const SendRegistrationLink = ({ employee }) => {
	const [isOpen, setIsOpen] = useState(false);
	const toggleModal = () => setIsOpen(!isOpen);
	const [showConfirmation, setShowConfirmation] = useState(false);
	const [confirmationStates, setConfirmationStates] = useState({});
	const [alertMessage, setAlertMessage] = useState("");
	const sendEmail = async () => {
		const registrationToken = await GenerateRegistrationToken(employee);
		try {
			await axios.post("/api/sendEmail", {
				to: employee.email,
				employee: employee, // Include the employee data in the request body
				registrationToken: registrationToken,
			});
			console.log("Email sent successfully");
			setAlertMessage("Email sent successfully");
			toggleModal();
		} catch (error) {
			console.error("Error sending email:", error);
			if (!employee.email) {
				setAlertMessage("Enter an email for the employee and try again. ");
				toggleModal();
			}
		}
	};

	return (
		<>
			<Button className="login-button" block onClick={sendEmail}>
				Send Registration Link
			</Button>
			<CustomAlertModal
				isOpen={isOpen}
				toggle={toggleModal}
				message={alertMessage}
			/>
		</>
	);
};

export default SendRegistrationLink;
