"use client";

import { useEffect, useState } from "react";

const TipForm = () => {
	const [bartenders, setBartenders] = useState([]);

	useEffect(() => {
		const fetchBartenders = async () => {
			const response = await fetch("/api/bartenders");
			console.log("API Response:", response);
			const json = await response.json();

			if (response.ok) {
				setBartenders(json);
			}
		};

		fetchBartenders();
	}, []);

	console.log(bartenders, "hello");

	return (
		<div>
			{bartenders &&
				bartenders.map((bartender) => {
					return <p key={bartender._id}>{bartender}</p>;
				})}
			hello
		</div>
	);
};

export default TipForm;
