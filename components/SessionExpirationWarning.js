import { useEffect, useState } from "react";
import {
	useSession,
	signOut,
	getSession,
	refreshSession,
} from "next-auth/react";
import { mutate } from "swr"; // Import mutate from SWR
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

const SessionExpirationWarning = (args) => {
	const { data: session, expires } = useSession();
	const [showWarning, setShowWarning] = useState(false);
	const [modal, setModal] = useState(false);

	const toggle = () => setModal(!modal);

	useEffect(() => {
		const checkSessionExpiration = async () => {
			const session = await getSession();
			if (session) {
				const expirationTimeUTC = new Date(session.expires);
				const currentTime = new Date();
				const timeUntilExpiration = expirationTimeUTC - currentTime;
				const threshold = 5 * 60 * 1000; // 5 minutes before expiration
				if (timeUntilExpiration <= threshold && timeUntilExpiration > 0) {
					// Show the warning modal
					setShowWarning(true);
				}
			}
		};

		const intervalId = setInterval(checkSessionExpiration, 10000); // Check session every 10 seconds

		return () => clearInterval(intervalId);
	}, []);

	// useEffect(() => {
	// 	const checkSession = async () => {
	// 		const session = await getSession();

	// 		if (session) {
	// 			const timeUntilExpiration =
	// 				new Date(session.expires).getTime() - new Date().getTime();
	// 			const shouldShowWarning =
	// 				timeUntilExpiration > 0 && timeUntilExpiration < 30 * 1000; // Show warning 30 sec before expiration
	// 			// setShowWarning(shouldShowWarning);

	// 			const expirationTimeUTC = new Date(session.expires);
	// 			const currentTime = new Date();
	// 			const options = {
	// 				timeZone: "America/Los_Angeles",
	// 				timeZoneName: "short",
	// 			};
	// 			const expirationTimePST = expirationTimeUTC.toLocaleString(
	// 				"en-US",
	// 				options
	// 			);
	// 			const currentTimePST = currentTime.toLocaleString("en-US", options);
	// 			console.log(
	// 				`expirationTimeUTC ${expirationTimePST} <= ${currentTimePST} currentTime"`,
	// 				expirationTimeUTC <= currentTime
	// 			);
	// 			if (expirationTimeUTC <= currentTime) {
	// 				// Session has expired, log out the user
	// 				await signOut();
	// 				console.log("User has been logged out due to session expiration.");
	// 			}
	// 		}
	// 	};

	// 	checkSession();
	// 	const interval = setInterval(checkSession, 10000); // Check session every 10 seconds

	// 	return () => clearInterval(interval);
	// }, []);

	const checkSessionExpiration = async () => {
		const session = await getSession();
		if (session) {
			const expirationTimeUTC = new Date(session.expires);
			const currentTime = new Date();
			if (expirationTimeUTC <= currentTime) {
				// Session has expired, log out the user
				await signOut();
				console.log("User has been logged out due to session expiration.");
			}
		}
	};

	// Set up a timer to run the checkSessionExpiration function periodically
	const sessionCheckInterval = 60000; // Check every minute (adjust as needed)
	const intervalId = setInterval(checkSessionExpiration, sessionCheckInterval);

	// Clear the interval when the component unmounts or when not needed anymore
	// For example, you can clear it when the user logs out
	// clearInterval(intervalId);

	const handleStaySignedIn = async () => {
		try {
			// Trigger a refresh of the session data
			await mutate(); // This will re-fetch the session data);
			setShowWarning(false); // Hide the warning message
			toggle();
		} catch (error) {
			console.error("Error refreshing session:", error);
		}
	};

	const handleSignOut = () => {
		// Sign the user out
		signOut();
	};

	return (
		<div>
			{/* <Button onClick={toggle}>Add Employee</Button> */}

			<Modal isOpen={modal || showWarning} toggle={toggle} {...args}>
				{" "}
				<ModalHeader toggle={toggle}>
					Your session is about to expire. Do you want to stay signed in?
				</ModalHeader>
				<Form>
					<ModalFooter>
						<Button onClick={handleStaySignedIn}>Stay Signed In</Button>{" "}
						<Button onClick={handleSignOut}>Sign Out</Button>
					</ModalFooter>
				</Form>
			</Modal>
		</div>
	);
};

export default SessionExpirationWarning;
