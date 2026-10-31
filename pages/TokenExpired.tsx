import Link from "next/link";
import React from "react";
import style from "../components/SignIn.module.css";

// Where expired or already-used registration links land.
export default function TokenExpired() {
	return (
		<div className={style.page}>
			<div className={style.content}>
				<Link href="/" className={style.logo}>
					TipJar
				</Link>
				<p className={style.subtitle}>Link expired</p>

				<div className={style.card}>
					<p className={style.message}>
						This link is no longer valid. It may have expired or already been
						used.
					</p>
					<p className={style.hint}>Ask a manager to send you a new one.</p>
				</div>

				<Link href="/" className={style.back}>
					← Back to start
				</Link>
			</div>
		</div>
	);
}
