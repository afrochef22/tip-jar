import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { Spinner, Button } from "reactstrap";

// Manager sign-in button on the start page. Already signed in? Go straight to
// the Dashboard.
export default function LoginBtn({ className }) {
	const { data: session } = useSession();
	const router = useRouter();

	useEffect(() => {
		if (session) {
			router.push("/Dashboard");
		}
	}, [session, router]);

	if (session) {
		return (
			<Button className={className} disabled>
				<Spinner size="sm" /> Signing in…
			</Button>
		);
	}
	return (
		<Button
			className={className}
			onClick={() => signIn(undefined, { callbackUrl: "/Dashboard" })}
		>
			Manager Sign in
		</Button>
	);
}
