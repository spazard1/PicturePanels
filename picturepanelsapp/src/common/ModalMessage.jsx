import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import PropTypes from "prop-types";

const ModalMessage = ({ modalMessage, onModalMessageClose }) => {
  return (
    <Modal show={modalMessage !== ""} centered onHide={onModalMessageClose}>
      <Modal.Body>{modalMessage}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onModalMessageClose}>
          Ok
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalMessage;

ModalMessage.propTypes = {
  modalMessage: PropTypes.string,
  onModalMessageClose: PropTypes.func.isRequired,
};
