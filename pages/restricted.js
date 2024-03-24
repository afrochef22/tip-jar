import { getServerSession } from "next-auth/next";
import { useRouter } from "next/router";

export default async function restricted() {
	const router = useRouter();
	const session = await getServerSession();
	if (!session || !session.user) {
		router.push("/");
		return null; // Ensure that no content is rendered before redirection
	}

	return (
		<div>
			this is a protected route.
			<br />
			You will only see this if you are authenticated
		</div>
	);
}
