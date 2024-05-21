import EmployeeTable from "./EmployeeList";
import { Container } from "reactstrap";
import style from "./EmployeeList.module.css";
import { AddEmployeeModal } from "./addEmployeeModal";

const Cooks = ({ employees }) => {
	return (
		<Container className={style.employeeList}>
			<AddEmployeeModal position="Cook" />

			<h2 className={` text-color `}>Cooks</h2>

			<EmployeeTable employees={employees} position="Cook" />
		</Container>
	);
};

export default Cooks;
