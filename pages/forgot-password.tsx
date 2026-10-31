import React, { useState } from "react";
import Link from "next/link";
import { Button, Form, FormGroup, Input, Label, Spinner } from "reactstrap";
import style from "../components/SignIn.module.css";
import { text } from "../lib/field";
import type { FormEvent } from "react";

export default function ForgotPasswordPage() {
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [sent, setSent] = useState(false);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const login = new FormData(e.currentTarget).get("login");
		setError("");
		setBusy(true);
		try {
			const response = await fetch("/api/forgotPassword", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ login }),
			});
			const body: unknown = await response.json().catch(() => ({}));
			if (response.ok) setSent(true);
			else setError(text(body, "error") || "Couldn't send the email. Please try again.");
		} catch {
			setError("Could not reach the server. Please try again.");
		}
		setBusy(false);
	};

	return (
		<div className={style.page}>
			<div className={style.content}>
				<Link href="/" className={style.logo}>
					TipJar
				</Link>
				<p className={style.subtitle}>Forgot password</p>

				{error && (
					<div className={style.error} role="alert">
						{error}
					</div>
				)}

				<div className={style.card}>
					{sent ? (
						<p className={style.sent}>
							If that account exists, we emailed a link to choose a new
							password. It expires in 1 hour. Check your spam folder if it
							doesn&apos;t show up.
						</p>
					) : (
						<Form onSubmit={handleSubmit}>
							<FormGroup className={style.field}>
								<Label for="login" className={style.label}>
									Your username or email
								</Label>
								<Input
									id="login"
									name="login"
									autoComplete="username"
									autoCapitalize="none"
									autoCorrect="off"
									required
								/>
							</FormGroup>
							<Button type="submit" className={style.primaryButton} disabled={busy}>
								{busy ? <Spinner size="sm" /> : "Email me a reset link"}
							</Button>
						</Form>
					)}
				</div>

				<Link href="/signin" className={style.back}>
					← Back to sign in
				</Link>
			</div>
		</div>
	);
}
