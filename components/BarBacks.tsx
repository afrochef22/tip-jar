import EmployeeTable from "./EmployeeList";
import { Container } from "reactstrap";
import style from "./EmployeeList.module.css";
import { AddEmployeeModal } from "./addEmployeeModal";
import type { PublicEmployee } from "../types/models";

const BarBacks = ({ employees }: { employees: PublicEmployee[] }) => {
	return (
		<Container className={style.employeeList}>
			<AddEmployeeModal position="Bar Back" />

			<h2 className={` text-color `}>Bar Backs</h2>

			<EmployeeTable employees={employees} position="Bar Back" />
		</Container>
	);
};

export default BarBacks;
