import Bartenders from "../components/Bartenders";

import React from "react";

async function getData() {
	const res = await fetch("http://localhost:3000/api/getBartenders");

	if (!res.ok) {
		throw new Error("Failed to fetch data");
	}

	return res.json();
}

export default async function page() {
	const bartenders = await getData();
	return <Bartenders bartenders={bartenders} />;
}
