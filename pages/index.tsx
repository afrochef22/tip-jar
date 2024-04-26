import clientPromise from "../lib/mongodb";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import LoginBtn from "../components/LoginBtn";

import Link from "next/link";
type ConnectionStatus = {
	isConnected: boolean;
};

export const getServerSideProps: GetServerSideProps<
	ConnectionStatus
> = async () => {
	try {
		await clientPromise;
		// `await clientPromise` will use the default database passed in the MONGODB_URI
		// However you can use another database (e.g. myDatabase) by replacing the `await clientPromise` with the following code:
		//
		// `const client = await clientPromise`
		// `const db = client.db("myDatabase")`
		//
		// Then you can execute queries against your database like so:
		// db.find({}) or any of the MongoDB Node Driver commands

		return {
			props: { isConnected: true },
		};
	} catch (e) {
		console.error(e);
		return {
			props: { isConnected: false },
		};
	}
};

export default function Home({
	isConnected,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<div className="front-page">
			<div className="logo-container">
				<h1 className="logo-text">TipJar</h1>
			</div>
			<LoginBtn />
			<div className="login-button-container">
				<Link className="login-button" href="/SelectWorkingEmployee">
					Employees Enter
				</Link>
			</div>
		</div>
	);
}
