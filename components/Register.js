import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Link from "next/link";
import { Button, Form, FormGroup, Input, Label } from "reactstrap";
import GoogleIcon from "./GoogleIcon";
import style from "./SignIn.module.css";

export const Register = ({ employee }) => {
	const router = useRouter();
	const token = router.query.token;
	const { data: session } = useSession();

	// State variables to store form data
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState(employee.email || "");
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
		<div className={style.page}>
			<div className={style.content}>
				<Link href="/" className={style.logo}>
					TipJar
				</Link>
				<p className={style.subtitle}>
					Welcome, {employee.firstName} {employee.lastName}. Set up your sign in.
				</p>

				{error && (
					<div className={style.error} role="alert">
						{error}
					</div>
				)}
				{signedInAsSomeoneElse && (
					<div className={style.error} role="alert">
						You are signed in as <strong>{session.user.email}</strong>, but this
						link was sent to{" "}
						<strong>{employee.email || "a different address"}</strong>. To use
						Google, sign out and pick that account. Otherwise set a username and
						password below.
						<Button
							type="button"
							outline
							size="sm"
							className="mt-2 d-block"
							color="light"
							onClick={() => signOut({ redirect: false })}
						>
							Sign out
						</Button>
					</div>
				)}

				<div className={style.card}>
					<Button
						type="button"
						className={style.googleButton}
						onClick={handleSignInWithGoogle}
					>
						<GoogleIcon /> Sign in with Google
					</Button>
					<p className={style.hint}>
						Use the Google account for{" "}
						<strong>{employee.email || "the email this link was sent to"}</strong>.
					</p>

					<div className={style.divider}>or pick a username and password</div>

					<Form onSubmit={handleSubmit}>
						<FormGroup className={style.field}>
							<Label for="username" className={style.label}>
								Username
							</Label>
							<Input
								id="username"
								name="username"
								autoComplete="username"
								autoCapitalize="none"
								autoCorrect="off"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
								required
							/>
						</FormGroup>
						<FormGroup className={style.field}>
							<Label for="email" className={style.label}>
								Email
							</Label>
							<Input
								id="email"
								name="email"
								type="email"
								autoComplete="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
							/>
						</FormGroup>
						<FormGroup className={style.field}>
							<Label for="password" className={style.label}>
								Password
							</Label>
							<Input
								id="password"
								name="password"
								type="password"
								autoComplete="new-password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
							/>
						</FormGroup>
						<Button type="submit" className={style.primaryButton}>
							Register
						</Button>
					</Form>
				</div>
			</div>
		</div>
	);
};
