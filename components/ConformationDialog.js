import React from "react";
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from "reactstrap";

export const ConfirmationDialog = ({ isOpen, toggle, onConfirm }) => {
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

export const DeleteDialog = ({ isOpen, toggle, onConfirm }) => {
	return (
		<Modal isOpen={isOpen} toggle={toggle}>
			<ModalHeader toggle={toggle}>Confirmation</ModalHeader>
			<ModalBody>
				Are you sure you want to delete? All data will be lost. This action
				cannot be undone.
			</ModalBody>
			<ModalFooter>
				<Button color="secondary" onClick={toggle}>
					Cancel
				</Button>
				<Button color="danger" onClick={onConfirm}>
					Delete
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export const CustomAlertModal = ({ isOpen, toggle, message }) => {
	return (
		<Modal isOpen={isOpen} toggle={toggle}>
			<ModalBody>{message}</ModalBody>
			<ModalFooter>
				<Button color="secondary" onClick={toggle}>
					ok
				</Button>
			</ModalFooter>
		</Modal>
	);
};
