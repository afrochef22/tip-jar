import EmployeeTable from "./EmployeeList";
import { Container } from "reactstrap";
import style from "./EmployeeList.module.css";
import { AddEmployeeModal } from "./addEmployeeModal";
import type { PublicEmployee } from "../types/models";

const Bartenders = ({ employees }: { employees: PublicEmployee[] }) => {

	return (
		<Container className={style.employeeList}>
			<AddEmployeeModal position="Bartender" />
			<h2 className={` text-color `}>Bartenders</h2>

			<EmployeeTable employees={employees} position="Bartender" />
		</Container>
	);
};

export default Bartenders;
