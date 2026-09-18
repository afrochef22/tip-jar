import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export const Register = ({ employee }) => {
	const router = useRouter();
	const token = router.query.token;
	const { data: session } = useSession();

	// State variables to store form data
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	// The server already validated the token before rendering this page.
	// A signed-in session whose email matches this employee means the link
	// was consumed by a Google sign-in, so move on.
	const sessionEmail = session?.user?.email?.toLowerCase() ?? null;
	const linkEmail = employee.email?.toLowerCase() ?? null;
	const signedInAsSomeoneElse = Boolean(sessionEmail && sessionEmail !== linkEmail);

	useEffect(() => {
		if (sessionEmail && sessionEmail === linkEmail) {
			router.push("/Dashboard");
		}
	}, [sessionEmail, linkEmail, router]);

	// Function to handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		try {
			const response = await fetch(`/api/updateEmployee/${employee._id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json", // Specify the content type
				},

				body: JSON.stringify({ token, username, email, password }),
			});

			if (response.ok) {
				router.push("/");
			} else if (response.status === 409) {
				setError("That username is already taken. Please choose another.");
			} else if (response.status === 401) {
				router.push("/TokenExpired");
			} else {
				setError("Registration failed. Please try again.");
			}
		} catch (error) {
			console.error(error);
			setError("Could not reach the server. Please try again.");
		}
	};

	async function handleSignInWithGoogle() {
		await signIn("google", { callbackUrl: "/Dashboard" });
	}

	return (
		<div className="container mt-5 front-page">
			<div className="row justify-content-center">
				<div className="col-md-6">
					<div className="card">
						<div className="card-header">
							<h3 className="text-center">Register</h3>
							<p>
								{employee.firstName} {employee.lastName}
							</p>
						</div>
						<div className="card-body">
							{signedInAsSomeoneElse && (
								<div className="alert alert-warning">
									You are signed in as <strong>{session.user.email}</strong>,
									but this link was sent to{" "}
									<strong>{employee.email || "a different address"}</strong>.
									To use Google, sign out and pick that account. Otherwise set
									a username and password below.
									<div className="mt-2">
										<button
											type="button"
											className="btn btn-outline-secondary btn-sm"
											onClick={() => signOut({ redirect: false })}
										>
											Sign out
										</button>
									</div>
								</div>
							)}
							<p className="small text-muted">
								Signing in with Google works with the Google account for{" "}
								<strong>{employee.email || "the email this link was sent to"}</strong>.
							</p>
							<button
								className="btn btn-success  btn-block"
								onClick={handleSignInWithGoogle}
							>
								Sign in with Google
							</button>
							<p className="mt-2">Or with username and password</p>
							{error && <p className="text-danger">{error}</p>}
							<form onSubmit={handleSubmit}>
								<div className="form-group">
									<label htmlFor="username">Username</label>
									<input
										type="text"
										className="form-control"
										id="username"
										name="username"
										placeholder="Enter username"
										value={username}
										onChange={(e) => setUsername(e.target.value)}
										required
									/>
								</div>
								<div className="form-group">
									<label htmlFor="email">Email address</label>
									<input
										type="email"
										className="form-control"
										id="email"
										name="email"
										placeholder="Enter email"
										value={email}
										onChange={(e) => setEmail(e.target.value)}
										required
									/>
								</div>
								<div className="form-group mb-3">
									<label htmlFor="password">Password</label>
									<input
										type="password"
										className="form-control"
										id="password"
										name="password"
										placeholder="Enter password"
										value={password}
										onChange={(e) => setPassword(e.target.value)}
										required
									/>
								</div>
								<button type="submit" className="btn btn-primary btn-block">
									Register
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
