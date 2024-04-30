import Link from "next/link";
import React from "react";

export default function TokenExpired() {
	return (
		<div className="front-page">
			<div className="invalid-link">
				<h1>This link is no longer valid.😢 Please request a new one.</h1>
			</div>
			<div className="login-button-container">
				<Link className="login-button" href="/">
					Exit
				</Link>
			</div>
		</div>
	);
}
