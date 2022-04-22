import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import PropTypes from "prop-types";

const ModalYesNo = ({ modalMessage, onModalResponse, onModalClose }) => {
  return (
    <Modal show={modalMessage !== ""} centered onHide={onModalClose}>
      <Modal.Body>{modalMessage}</Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => onModalResponse(false)}>
          No
        </Button>
        <Button variant="primary" onClick={() => onModalResponse(true)}>
          Yes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalYesNo;

ModalYesNo.propTypes = {
  modalMessage: PropTypes.string,
  onModalResponse: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired,
};
