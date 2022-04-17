import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import PropTypes from "prop-types";

const ErrorMessageModal = ({ errorMessage }) => {
  const [displayedErrorMessage, setDisplayedErrorMessage] = useState("");

  const onErrorModalClose = () => setDisplayedErrorMessage("");

  useEffect(() => {
    if (errorMessage) {
      setDisplayedErrorMessage(errorMessage);
    }
  }, [errorMessage]);

  return (
    <Modal show={displayedErrorMessage !== ""} centered onHide={onErrorModalClose}>
      <Modal.Body>{displayedErrorMessage}</Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={onErrorModalClose}>
          Ok
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ErrorMessageModal;

ErrorMessageModal.propTypes = {
  errorMessage: PropTypes.string,
};
