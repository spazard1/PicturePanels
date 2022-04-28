import React from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import PropTypes from "prop-types";

import "./Modal.css";

const ModalConfirm = ({ modalMessage, onModalResponse, onModalClose }) => {
  return (
    <Modal show={modalMessage !== ""} onHide={onModalClose}>
      <Modal.Body>{modalMessage}</Modal.Body>
      <Modal.Footer>
        <Button className="cancelButton" variant="secondary" onClick={() => onModalResponse(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onModalResponse(true)}>
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalConfirm;

ModalConfirm.propTypes = {
  modalMessage: PropTypes.string,
  onModalResponse: PropTypes.func,
  onModalClose: PropTypes.func.isRequired,
};
