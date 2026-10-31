import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { ObjectId } from "mongodb";
import { Button, Form, FormGroup, Input, Label, Spinner } from "reactstrap";
import clientPromise from "../../lib/mongodb";
import { reportError } from "../../lib/alert";
import { MIN_PASSWORD_LENGTH, resetTokenValid } from "../../lib/passwordReset";
import style from "../../components/SignIn.module.css";
import { text } from "../../lib/field";
import { isObjectId } from "../../lib/objectId";
import type { FormEvent } from "react";
import type { GetServerSideProps } from "next";
import type { EmployeeDoc } from "../../types/models";
import type { WithId } from "mongodb";

type Props = { valid: boolean; username: string | undefined };

export default function ResetPasswordPage({ valid, username }: Props) {
	const router = useRouter();
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [done, setDone] = useState(false);

	const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = new FormData(e.currentTarget);
		const password = form.get("password");
		if (password !== form.get("confirm")) {
			setError("The two passwords don't match.");
			return;
		}
		setError("");
		setBusy(true);
		try {
			const response = await fetch("/api/resetPassword", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ id: router.query.id, token: router.query.token, password }),
			});
			const body: unknown = await response.json().catch(() => ({}));
			if (response.ok) setDone(true);
			else setError(text(body, "error") || "Couldn't change the password. Please try again.");
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
				<p className={style.subtitle}>Choose a new password</p>

				{error && (
					<div className={style.error} role="alert">
						{error}
					</div>
				)}

				<div className={style.card}>
					{!valid ? (
						<p className={style.sent}>
							This reset link has expired or was already used.{" "}
							<Link href="/forgot-password">Request a new one.</Link>
						</p>
					) : done ? (
						<p className={style.sent}>
							Your password is changed. <Link href="/signin">Sign in</Link> with
							username <b>{username}</b>.
						</p>
					) : (
						<Form onSubmit={handleSubmit}>
							<p>
								Username: <b>{username}</b>
							</p>
							{/* Lets password managers save the new password to this username. */}
							<input type="hidden" name="username" autoComplete="username" value={username} />
							<FormGroup className={style.field}>
								<Label for="password" className={style.label}>
									New password (at least {MIN_PASSWORD_LENGTH} characters)
								</Label>
								<Input
									id="password"
									name="password"
									type="password"
									autoComplete="new-password"
									minLength={MIN_PASSWORD_LENGTH}
									required
								/>
							</FormGroup>
							<FormGroup className={style.field}>
								<Label for="confirm" className={style.label}>
									Type it again
								</Label>
								<Input
									id="confirm"
									name="confirm"
									type="password"
									autoComplete="new-password"
									minLength={MIN_PASSWORD_LENGTH}
									required
								/>
							</FormGroup>
							<Button type="submit" className={style.primaryButton} disabled={busy}>
								{busy ? <Spinner size="sm" /> : "Change password"}
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

export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
	const { id, token } = query;
	if (!isObjectId(id)) return { props: { valid: false, username: "" } };
	try {
		const employee = await (await clientPromise)
			.db("TeragramBallroom")
			.collection<EmployeeDoc>("employees")
			.findOne<WithId<Pick<EmployeeDoc, "username" | "resetTokenHash" | "resetTokenExpiration">>>(
				{ _id: new ObjectId(id) },
				{ projection: { username: 1, resetTokenHash: 1, resetTokenExpiration: 1 } }
			);
		const valid = resetTokenValid(employee, token);
		return { props: { valid, username: valid ? employee!.username : "" } };
	} catch (error) {
		await reportError("Reset password page", error);
		return { props: { valid: false, username: "" } };
	}
};
