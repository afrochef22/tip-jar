import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const Employees = () => {
	const [employees, setEmployees] = useState([]);

	useEffect(() => {
		const fetchEmployees = async () => {
			try {
				const response = await fetch("/api/getEmployees");
				if (!response.ok) {
					throw new Error("Failed to fetch employees");
				}
				const data = await response.json();
				setEmployees(data);
			} catch (error) {
				console.error("Error fetching employees:", error);
			}
		};

		fetchEmployees();
	}, []);

	return employees;
};

const UserName = () => {
	const { data: session } = useSession();
	const [userName, setUserName] = useState("");
	const employees = Employees();

	useEffect(() => {
		const fetchUserData = async () => {
			if (session) {
				const employeeWithEmail = employees.find(
					(employee) => employee.email === session.user.email
				);
				if (employeeWithEmail) {
					setUserName(
						`${employeeWithEmail.firstName} ${employeeWithEmail.lastName} `
					); // Assuming firstName is the field you want to display
				}
			}
		};

		fetchUserData();
	}, [session, employees]);

	return (
		<div>{session ? <h6 className="gold-color">{userName} </h6> : <></>}</div>
	);
};

export default UserName;
