import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { Button } from "reactstrap";

const GenerateRegistrationToken = async (employee) => {
	const token = uuidv4();

	const expiryTime = new Date();
	expiryTime.setDate(expiryTime.getDate() + 7);

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
	const sendEmail = async () => {
		const registrationToken = await GenerateRegistrationToken(employee);
		try {
			await axios.post("/api/sendEmail", {
				to: employee.email,
				employee: employee, // Include the employee data in the request body
				registrationToken: registrationToken,
			});
			console.log("Email sent successfully");
		} catch (error) {
			console.error("Error sending email:", error);
		}
	};

	return <Button onClick={sendEmail}>Send Registration Link</Button>;
};

export default SendRegistrationLink;
