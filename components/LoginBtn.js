import { useSession, signIn, signOut } from "next-auth/react";

export default function Component() {
	const { data: session } = useSession();
	if (session) {
		console.log(session);
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
			<div className="login-button-container">
				Not signed in <br />
			</div>

			<div className="login-button-container">
				<button className="login-button" onClick={() => signIn()}>
					Manager Sign in
				</button>
			</div>
		</div>
	);
}
