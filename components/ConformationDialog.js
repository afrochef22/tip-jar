import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

const ConfirmationDialog = ({ isOpen, toggle, onConfirm }) => {
	return (
		<Modal isOpen={isOpen} toggle={toggle}>
			<ModalHeader toggle={toggle}>Confirmation</ModalHeader>
			<ModalBody>
				Are you sure you want to submit? This action cannot be undone.
			</ModalBody>
			<ModalFooter>
				<Button color="secondary" onClick={toggle}>
					Cancel
				</Button>
				<Button color="primary" onClick={onConfirm}>
					Confirm
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default ConfirmationDialog;
