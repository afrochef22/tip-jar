import { useState } from "react";
import { signIn, useSession } from "next-auth/react";

export const Register = ({ employee }) => {
	// State variables to store form data
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	// Function to handle form submission
	const handleSubmit = (e) => {
		e.preventDefault();
		// You can handle form submission logic here, such as sending data to your backend
		console.log("Form submitted:", { username, email, password });
		// Clear form fields after submission
		setUsername("");
		setEmail("");
		setPassword("");
	};

	async function handleSignInWithGoogle() {
		await signIn("google");
	}

	return (
		<div className="container mt-5">
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
								<div className="form-group">
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
								<button
									className="btn btn-success  btn-block"
									onClick={handleSignInWithGoogle}
								>
									Sign in with Google
								</button>
							</form>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
