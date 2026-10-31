import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signIn, useSession } from "next-auth/react";
import { Button, Form, FormGroup, Input, Label, Spinner } from "reactstrap";
import style from "../components/SignIn.module.css";
import GoogleIcon from "../components/GoogleIcon";
import type { FormEvent } from "react";

// NextAuth sends errors back here as ?error=<code> (pages.error in
// [...nextauth].js); credentials and email errors come back from signIn().
const ERROR_MESSAGES: Record<string, string | undefined> = {
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
const errorMessage = (code: string) =>
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

	const handleCredentials = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
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

	const handleEmail = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const email = new FormData(e.currentTarget).get("email");
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
					<p className={style.forgot}>
						<Link href="/forgot-password">Forgot password?</Link>
					</p>

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
