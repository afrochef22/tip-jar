import React from "react";
import Link from "next/link";
import style from "./EmployeeList.module.css";

const EmployeeTable = ({ employees, position }) => {
	// Filter active and non-active bartenders
	console.log("employees", employees, "position", position);
	const activeEmployee = employees.filter(
		(employee) =>
			employee.position.includes(position) && employee.active === true
	);

	const nonActiveEmployee = employees.filter(
		(employee) =>
			employee.position.includes(position) && employee.active === false
	);

	// Determine the maximum number of rows needed
	const maxRows = Math.max(activeEmployee.length, nonActiveEmployee.length);

	return (
		<table className={`${style.table} ${style.container} ${style.expand}`}>
			<thead className={``}>
				<tr>
					<th className={``}>
						<h4>Active</h4>
					</th>
					<th>
						{position === "No Position" ? (
							<h4>Non Active</h4>
						) : (
							<h4>Back Up</h4>
						)}
					</th>
				</tr>
			</thead>
			<tbody>
				{[...Array(maxRows)].map((_, index) => (
					<tr key={index}>
						<td>
							{activeEmployee[index] ? (
								<Link
									className="noDecoration text-color"
									href={`/getEmployee/${activeEmployee[index]._id}`}
								>
									{`${activeEmployee[index].firstName} ${activeEmployee[index].lastName}`}
								</Link>
							) : null}
						</td>
						<td>
							{nonActiveEmployee[index] ? (
								<Link
									className="noDecoration text-color"
									href={`/getEmployee/${nonActiveEmployee[index]._id}`}
								>
									{`${nonActiveEmployee[index].firstName} ${nonActiveEmployee[index].lastName}`}
								</Link>
							) : null}
						</td>
					</tr>
				))}
			</tbody>
		</table>
	);
};

export default EmployeeTable;
