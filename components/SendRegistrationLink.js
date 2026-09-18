import axios from "axios";
import { Button } from "reactstrap";
import { CustomAlertModal } from "./ConformationDialog";
import { useState } from "react";

const SendRegistrationLink = ({ employee }) => {
	const [isOpen, setIsOpen] = useState(false);
	const [sending, setSending] = useState(false);
	const [alertMessage, setAlertMessage] = useState("");
	const toggleModal = () => setIsOpen(!isOpen);

	const sendEmail = async () => {
		if (!employee.email) {
			setAlertMessage("Enter an email for the employee and try again.");
			setIsOpen(true);
			return;
		}
		setSending(true);
		try {
			await axios.post("/api/sendEmail", { employeeId: employee._id });
			setAlertMessage("Email sent successfully");
		} catch (error) {
			console.error("Error sending email:", error);
			setAlertMessage(
				error.response?.data?.error || "Failed to send email. Try again."
			);
		} finally {
			setSending(false);
			setIsOpen(true);
		}
	};

	return (
		<>
			<Button className="login-button" block onClick={sendEmail} disabled={sending}>
				{sending ? "Sending..." : "Send Registration Link"}
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
