import { useState } from "react";
import { useRouter } from "next/router";

export default function addBartenderPage({}) {
	const [newBartender, setNewBartender] = useState({
		firstName: "",
		lastName: "",
	});

	const handleInputChange = (e) => {
		setNewBartender({ ...newBartender, [e.target.name]: e.target.value });
	};

	const router = useRouter();
	const handleAddBartender = async (e) => {
		e.preventDefault();
		try {
			const response = await fetch("http://localhost:3000/api/addBartender", {
				method: "POST",
				headers: {
					"Content-Type": "application/json", // Specify the content type
				},
				body: JSON.stringify(newBartender),
			});
			console.log(response);
			if (response.ok) {
				console.log("Bartender added successfully");
				router.push("http://localhost:3000/bartenders");
			} else {
				console.log("response not ok");
			}
		} catch (error) {
			console.log(error);
		}
	};

	return (
		<div>
			<div>
				<h2>Add Bartender</h2>
				<form onSubmit={handleAddBartender}>
					<label>First Name:</label>
					<input
						type="text"
						name="firstName"
						value={newBartender.firstName}
						onChange={handleInputChange}
					/>
					<label>Last Name:</label>
					<input
						type="text"
						name="lastName"
						value={newBartender.lastName}
						onChange={handleInputChange}
					/>
					{/* Add input fields for other details like age and experience */}
					<button type="submit">Add Bartender</button>
				</form>
			</div>
		</div>
	);
}
