import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

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
					Signed in as {session.user.name || session.user.email}
					<br />
				</div>
				<div className="login-button-container">
					<button className="login-button" onClick={() => signOut()}>
						Sign out
					</button>
				</div>
			</>
		);
	}
	return (
		<div>
			{/* <div className="login-button-container">
				Not signed in <br />
			</div> */}

			<div className="login-button-container">
				<button className="login-button" onClick={handleSignIn}>
					Manager Sign in
				</button>
			</div>
		</div>
	);
}
