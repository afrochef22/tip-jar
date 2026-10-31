import React, { useState, memo } from "react";
import { Button, Modal, ModalHeader } from "reactstrap";
import { useRouter } from "next/router";
import CashTipForm, { showCashBreakdown } from "./CashTipForm";
import form from "./CreditTipForm.module.css";
import style from "./TipBreakDown.module.css";
import type { CashTipValues } from "./CashTipForm";

// Cash breakdowns aren't saved, so editing just reopens the breakdown with
// the new numbers.
const UpdateCashTipBreakDown = ({
	tipsCollected,
	barBacks,
	bartenders,
	barBackPercentage,
}: CashTipValues & {
	// Passed by CashTipBreakDown but not used here.
	numberOfBarBacks?: number;
	numberOfBartenders?: number;
	isBarBackHoursClicked?: string | string[];
	isBartenderHoursClicked?: string | string[];
}) => {
	const router = useRouter();
	const [modal, setModal] = useState(false);
	const toggle = () => setModal(!modal);

	const handleUpdate = (values: CashTipValues) => {
		showCashBreakdown(router, values);
		setModal(false);
	};

	return (
		<div>
			<Button className="apple-blue-background px-5" onClick={toggle}>
				Edit
			</Button>

			<Modal isOpen={modal} toggle={toggle} fullscreen contentClassName={style.editModal}>
				<ModalHeader toggle={toggle} className={style.editHeader}>
					Edit Cash Tips
				</ModalHeader>
				<div className={form.page}>
					{/* Remounts each time it opens, so it always starts from the current numbers. */}
					{modal && (
						<CashTipForm
							initial={{ tipsCollected, barBacks, bartenders, barBackPercentage }}
							submitLabel="Update"
							onSubmit={handleUpdate}
						>
							<Button type="button" className={form.backButton} onClick={toggle}>
								Cancel
							</Button>
						</CashTipForm>
					)}
				</div>
			</Modal>
		</div>
	);
};

export default memo(UpdateCashTipBreakDown);
