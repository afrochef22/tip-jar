import { useEffect, useState } from "react";
import { useSession, signOut, getSession } from "next-auth/react";
import { Form, Button, Modal, ModalHeader, ModalFooter } from "reactstrap";

const WARNING_THRESHOLD_MS = 5 * 60 * 1000; // show the warning 5 minutes out
const CHECK_INTERVAL_MS = 30 * 1000; // poll twice a minute

const SessionExpirationWarning = (args) => {
	const { data: session, update } = useSession();
	const [showWarning, setShowWarning] = useState(false);

	useEffect(() => {
		if (!session) {
			setShowWarning(false);
			return;
		}

		const checkSessionExpiration = async () => {
			const current = await getSession();
			if (!current) {
				setShowWarning(false);
				return;
			}
			const timeUntilExpiration = new Date(current.expires).getTime() - Date.now();

			if (timeUntilExpiration <= 0) {
				await signOut({ callbackUrl: "/" });
				return;
			}
			setShowWarning(timeUntilExpiration <= WARNING_THRESHOLD_MS);
		};

		checkSessionExpiration();
		const intervalId = setInterval(checkSessionExpiration, CHECK_INTERVAL_MS);
		return () => clearInterval(intervalId);
	}, [session]);

	const dismiss = () => setShowWarning(false);

	const handleStaySignedIn = async () => {
		try {
			// Re-fetches and re-signs the session, extending its expiry.
			await update();
			dismiss();
		} catch (error) {
			console.error("Error refreshing session:", error);
		}
	};

	const handleSignOut = () => {
		signOut({ callbackUrl: "/" });
	};

	return (
		<Modal isOpen={showWarning} toggle={dismiss} {...args}>
			<ModalHeader toggle={dismiss}>
				Your session is about to expire. Do you want to stay signed in?
			</ModalHeader>
			<Form>
				<ModalFooter>
					<Button onClick={handleStaySignedIn}>Stay Signed In</Button>{" "}
					<Button onClick={handleSignOut}>Sign Out</Button>
				</ModalFooter>
			</Form>
		</Modal>
	);
};

export default SessionExpirationWarning;
