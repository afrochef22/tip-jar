import clientPromise from "../lib/mongodb";
import Bartenders from "../components/Bartenders";

import React from "react";

export default function BartendersPage({ bartenders }) {
	return <Bartenders bartenders={bartenders} />;
}

export async function getServerSideProps() {
	try {
		const client = await clientPromise;
		const db = client.db("test");

		const bartenders = await db
			.collection("bartenders")
			.find({})
			.sort()
			.limit(20)
			.toArray();

		return {
			props: { bartenders: JSON.parse(JSON.stringify(bartenders)) },
		};
	} catch (err) {
		console.error(err);
	}
}
