import EmployeeTable from "./EmployeeList";
import { Container } from "reactstrap";
import style from "./EmployeeList.module.css";
import { AddEmployeeModal } from "./addEmployeeModal";
import type { PublicEmployee } from "../types/models";

// className is passed by pages/employees but not used.
const NonPositionedEmployee = ({ employees }: { employees: PublicEmployee[]; className?: string }) => {
	return (
		<Container className={style.employeeList}>
			<AddEmployeeModal position="No Position" />

			<h2 className={` text-color `}>No Position</h2>

			<EmployeeTable employees={employees} position="No Position" />
		</Container>
	);
};

export default NonPositionedEmployee;

