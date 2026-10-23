import clientPromise from "../lib/mongodb";
import type { InferGetServerSidePropsType, GetServerSideProps } from "next";
import LoginBtn from "../components/LoginBtn";

import Link from "next/link";
import style from "../components/Home.module.css";
import { reportError } from "../lib/alert";
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
		await reportError("Home page", e);
		return {
			props: { isConnected: false },
		};
	}
};

export default function Home({
	isConnected,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
	return (
		<div className={style.page}>
			<div className={style.content}>
				<h1 className={style.logo}>TipJar</h1>
				<div className={style.buttons}>
					<LoginBtn className={style.secondary} />
					<Link href="/SelectWorkingEmployee" className={`btn ${style.primary}`}>
						Employees Enter
					</Link>
				</div>
			</div>
		</div>
	);
}
