import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Spinner, Button } from "reactstrap";

export default function Component() {
	const { data: session } = useSession();
	const router = useRouter();

	useEffect(() => {
		// If the user is authenticated, redirect them to the dashboard
		if (session) {
			router.push("/Dashboard");
		}
	}, [session, router]);

	const handleSignIn = async () => {
		await signIn(); // Trigger the sign-in process
	};
	if (session) {
		console.log("session", session);
		return (
			<>
				<div className="login-button-container">
					<button className="manager-login-button" onClick={() => signOut()}>
						<Spinner className="" size="sm">
							Loading...
						</Spinner>

						<span>Signing in...</span>
					</button>
				</div>
			</>
		);
	}
	return (
		<div>
			<div className="login-button-container">
				<button className="manager-login-button" onClick={handleSignIn}>
					Manager Sign in
				</button>
			</div>
		</div>
	);
}
