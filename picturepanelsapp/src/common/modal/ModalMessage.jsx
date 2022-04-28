import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import PropTypes from "prop-types";

const ModalMessage = ({ modalMessage, onModalClose }) => {
  return (
    <Modal show={modalMessage !== ""} onHide={onModalClose}>
      <Modal.Body>{modalMessage}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onModalClose}>
          Ok
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalMessage;

ModalMessage.propTypes = {
  modalMessage: PropTypes.string,
  onModalClose: PropTypes.func.isRequired,
};
