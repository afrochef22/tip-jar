import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import { Button, Form, FormGroup, Input, Label, Spinner } from "reactstrap";
import style from "../components/SignIn.module.css";

// NextAuth sends errors back here as ?error=<code> (pages.error in
// [...nextauth].js); credentials and email errors come back from signIn().
const ERROR_MESSAGES = {
	CredentialsSignin: "Wrong username or password.",
	AccessDenied:
		"That account isn't set up for TipJar. Ask a manager to add your email.",
	Verification:
		"That sign-in link has expired or was already used. Request a new one.",
	OAuthAccountNotLinked:
		"That email already signs in another way. Use the method you used before.",
	EmailSignin: "Couldn't send the sign-in email. Please try again.",
	SessionRequired: "Please sign in to continue.",
};
const errorMessage = (code) =>
	code ? ERROR_MESSAGES[code] || "Sign in failed. Please try again." : "";

export default function SignInPage() {
	const router = useRouter();
	const { status } = useSession();
	const callbackUrl =
		typeof router.query.callbackUrl === "string"
			? router.query.callbackUrl
			: "/Dashboard";

	const [busy, setBusy] = useState(""); // which button is working
	const [error, setError] = useState("");
	const [emailSent, setEmailSent] = useState(false);

	useEffect(() => {
		if (typeof router.query.error === "string") {
			setError(errorMessage(router.query.error));
		}
	}, [router.query.error]);

	// Already signed in: go where they were headed.
	useEffect(() => {
		if (status === "authenticated") router.replace(callbackUrl);
	}, [status, callbackUrl, router]);

	const handleCredentials = async (e) => {
		e.preventDefault();
		const formData = new FormData(e.target);
		setError("");
		setBusy("credentials");
		const result = await signIn("credentials", {
			username: formData.get("username"),
			password: formData.get("password"),
			redirect: false,
			callbackUrl,
		});
		if (result?.ok && !result.error) {
			// Full load so middleware sees the new session cookie.
			window.location.assign(result.url || callbackUrl);
			return;
		}
		setError(errorMessage(result?.error || "CredentialsSignin"));
		setBusy("");
	};

	const handleGoogle = () => {
		setError("");
		setBusy("google");
		signIn("google", { callbackUrl });
	};

	const handleEmail = async (e) => {
		e.preventDefault();
		const email = new FormData(e.target).get("email");
		setError("");
		setBusy("email");
		const result = await signIn("email", { email, redirect: false, callbackUrl });
		setBusy("");
		if (result?.ok && !result.error) {
			setEmailSent(true);
		} else {
			setError(errorMessage(result?.error || "EmailSignin"));
		}
	};

	return (
		<div className={style.page}>
			<div className={style.content}>
				<Link href="/" className={style.logo}>
					TipJar
				</Link>
				<p className={style.subtitle}>Manager sign in</p>

				{error && (
					<div className={style.error} role="alert">
						{error}
					</div>
				)}

				<div className={style.card}>
					<Form onSubmit={handleCredentials}>
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
								autoComplete="current-password"
								required
							/>
						</FormGroup>
						<Button
							type="submit"
							className={style.primaryButton}
							disabled={!!busy}
						>
							{busy === "credentials" ? <Spinner size="sm" /> : "Sign in"}
						</Button>
					</Form>

					<div className={style.divider}>or</div>

					<Button
						type="button"
						className={style.googleButton}
						onClick={handleGoogle}
						disabled={!!busy}
					>
						{busy === "google" ? (
							<Spinner size="sm" />
						) : (
							<>
								<GoogleIcon /> Sign in with Google
							</>
						)}
					</Button>

					<div className={style.divider}>or</div>

					{emailSent ? (
						<p className={style.sent}>
							Check your email for a sign-in link. You can close this page.
						</p>
					) : (
						<Form onSubmit={handleEmail}>
							<FormGroup className={style.field}>
								<Label for="email" className={style.label}>
									Email me a sign-in link
								</Label>
								<Input
									id="email"
									name="email"
									type="email"
									autoComplete="email"
									placeholder="you@example.com"
									required
								/>
							</FormGroup>
							<Button
								type="submit"
								outline
								className={style.secondaryButton}
								disabled={!!busy}
							>
								{busy === "email" ? <Spinner size="sm" /> : "Send link"}
							</Button>
						</Form>
					)}
				</div>

				<Link href="/" className={style.back}>
					← Back
				</Link>
			</div>
		</div>
	);
}

function GoogleIcon() {
	return (
		<svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
			<path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.6 13.3l7.9 6.1C12.4 13.7 17.7 9.5 24 9.5z" />
			<path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z" />
			<path fill="#FBBC05" d="M10.5 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.5 0 20.1 0 24s1 7.5 2.6 10.7l7.9-6.1z" />
			<path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.8-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.4 2.3-6.3 0-11.6-4.2-13.5-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z" />
		</svg>
	);
}
