import Link from "next/link";
import React from "react";
import style from "../components/SignIn.module.css";

export default function NotFound() {
	return (
		<div className={style.page}>
			<div className={style.content}>
				<p className={style.subtitle}>Page not found</p>
				<div className={style.card}>
					<p className={style.message}>
						We couldn&apos;t find that page. The link may be old or mistyped.
					</p>
					<Link href="/" className={`btn ${style.primaryButton}`}>
						Go to the start page
					</Link>
				</div>
			</div>
		</div>
	);
}
