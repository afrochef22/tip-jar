import React, { useState } from "react";
import { FormGroup } from "reactstrap";
import Select from "react-select";
import style from "./SelectBarteder.module.css";

export default function SelectBartender({ employees }) {
	// const addWorkingBartender = (e) => {
	// 	if (e.length < props.workingBartender.length) {
	// 		const l = e.map((bartender) => bartender.value);

	// 		const bartenderToBeRemoved = props.workingBartender.filter(function (
	// 			item
	// 		) {
	// 			return !l.includes(item);
	// 		});
	// 		props.removeWorkingBartender(bartenderToBeRemoved);
	// 	} else {
	// 		for (let i = 0; i < e.length; i++) {
	// 			props.newWorkingBartender(e[i].value);
	// 		}
	// 	}
	// };

	const bartendersOptions = employees
		.filter((bartender) => bartender.position.includes("Bartender"))
		.map((bartender) => ({
			value: bartender._id,
			label: `${bartender.firstName} ${bartender.lastName}`,
		}));
	return (
		<div>
			<FormGroup className={style.backgroundColor}>
				<h2 htmlFor="exampleSelect">Who is bartending?</h2>

				<Select
					options={bartendersOptions}
					isMulti
					closeMenuOnSelect={false}
					allowSelectAll={true}
					hideSelectedOptions={false}
					placeholder="Select a bartender"
					// onChange={addWorkingBartender}
				/>
			</FormGroup>
		</div>
	);
}
