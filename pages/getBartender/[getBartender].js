import clientPromise from "../../lib/mongodb";
import { userRouter } from "next/router";
import { ObjectId } from "mongodb";

import React from "react";

export default function getBartender({ bartender }) {
	if (!bartender) {
		// Handle the case when bartender is not found
		return <div>Bartender not found</div>;
	}
	console.log(bartender);
	return (
		<div>
			<p key={bartender._id}>{bartender.firstName}</p>
		</div>
	);
}

export async function getServerSideProps(data) {
	const id = data.query.getBartender;

	try {
		const client = await clientPromise;
		const db = client.db("test");
		const bartenderCollection = db.collection("bartenders");
		const bartender = await bartenderCollection.findOne({
			_id: new ObjectId(id),
		});

		if (!bartender) {
			// Return a 404 status for not found
			return {
				notFound: true,
			};
		}

		return {
			props: { bartender: JSON.parse(JSON.stringify(bartender)) },
		};
	} catch (error) {
		console.error("Error fetching data:", error);
		// Return a 500 status for internal server error
		return {
			props: {
				bartender: null,
			},
		};
	}
}
