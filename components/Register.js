import { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";

export const Register = ({ employee }) => {
	console.log(employee);
	const router = useRouter();
	const token = router.query.token;
	const { data: session } = useSession();

	// State variables to store form data
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	useEffect(() => {
		// Check if token is expired
		const now = new Date();
		const expirationTime = new Date(employee.tokenExpiration);
		if (session) {
			router.push("/Dashboard");
		}
		if (now > expirationTime) {
			// Token expired, redirect user or display error
			router.push("/TokenExpired");
		}
		if (token !== employee.token) {
			router.push("/TokenExpired");
		}
	}, [session]);

	// Function to handle form submission
	const handleSubmit = async (e) => {
		e.preventDefault();
		// You can handle form submission logic here, such as sending data to your backend
		console.log("Form submitted:", { username, email, password });
		// Clear form fields after submission
		setUsername("");
		setEmail("");
		setPassword("");
		e.preventDefault();

		try {
			const response = await fetch(`/api/updateEmployee/${employee._id}`, {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json", // Specify the content type
				},

				body: JSON.stringify({
					username,
					email,
					password,
					firstSignInDate: new Date(),
				}),
			});

			if (response.ok) {
				console.log("Employee updated successfully");
				router.push("/");
			} else {
				console.log("response not ok");
			}
		} catch (error) {
			console.log(error);
		}
	};

	async function handleSignInWithGoogle() {
		await signIn("google");
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
							<button
								className="btn btn-success  btn-block"
								onClick={handleSignInWithGoogle}
							>
								Sign in with Google
							</button>
							<p className="mt-2">Or with username and password</p>
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
								<button type="submit " className="btn btn-primary btn-block">
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
