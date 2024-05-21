import EmployeeTable from "./EmployeeList";
import { Container } from "reactstrap";
import style from "./EmployeeList.module.css";
import { AddEmployeeModal } from "./addEmployeeModal";

const NonPositionedEmployee = ({ employees }) => {
	return (
		<Container className={style.employeeList}>
			<AddEmployeeModal position="No Position" />

			<h2 className={` text-color `}>No Position</h2>

			<EmployeeTable employees={employees} position="No Position" />
		</Container>
	);
};

export default NonPositionedEmployee;

const Bartenders = ({ employees }) => {
	console.log(employees);
};
