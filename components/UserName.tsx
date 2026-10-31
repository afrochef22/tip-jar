import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { field, isList } from "../lib/field";

// The /api/getEmployees response, read with field() since the browser doesn't
// check its shape.
const Employees = (enabled: boolean) => {
	const [employees, setEmployees] = useState<unknown[]>([]);

	useEffect(() => {
		if (!enabled) return;
		const fetchEmployees = async () => {
			try {
				const response = await fetch("/api/getEmployees");
				if (!response.ok) {
					throw new Error("Failed to fetch employees");
				}
				const data: unknown = await response.json();
				if (!isList(data)) throw new TypeError("Expected a list of employees");
				setEmployees(data);
			} catch (error) {
				console.error("Error fetching employees:", error);
			}
		};

		fetchEmployees();
	}, [enabled]);

	return employees;
};

const UserName = () => {
	const { data: session } = useSession();
	const [userName, setUserName] = useState("");
	const employees = Employees(Boolean(session));

	useEffect(() => {
		const fetchUserData = async () => {
			if (session) {
				const employeeWithEmail = employees.find(
					(employee) => field(employee, "email") === session.user.email
				);
				if (employeeWithEmail) {
					setUserName(
						`${field(employeeWithEmail, "firstName")} ${field(employeeWithEmail, "lastName")} `
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
