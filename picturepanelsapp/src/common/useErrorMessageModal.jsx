import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export function useErrorMessageModal() {
  const [errorMessage, setErrorMessage] = useState("");

  const onErrorModalClose = () => setErrorMessage("");

  const ErrorMessageModal = (
    <Modal show={errorMessage !== ""} centered onHide={onErrorModalClose}>
      <Modal.Body>{errorMessage}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onErrorModalClose}>
          Ok
        </Button>
      </Modal.Footer>
    </Modal>
  );

  return { ErrorMessageModal, setErrorMessage };
}
