"use client";
import { navigate } from "next/navigation";

const DeleteBartenderButton = ({ id }) => {
	console.log(typeof id);

	const handleDelete = async () => {
		console.log(`Deleting bartender with id: ${id}`);
		try {
			const response = await fetch(`/api/removeBartender/${id}`, {
				method: "DELETE",
			});

			if (response.ok) {
				console.log("Bartender deleted successfully");
				navigate("/bartenders");
			} else {
				console.error("Failed to delete Bartender");
			}
		} catch (error) {
			console.error("Error deleting bartender:", error);
		}
	};

	return <button onClick={handleDelete}>Delete</button>;
};

export default DeleteBartenderButton;
