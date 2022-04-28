import React, { useCallback, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import PropTypes from "prop-types";

const ModalPrompt = ({ modalMessage, onModalResponse, onModalClose }) => {
  const [userInput, setUserInput] = useState("");

  const onInputChange = useCallback((event) => {
    setUserInput(event.target.value);
  }, []);

  const onModalCloseHelper = () => {
    setUserInput("");
    onModalClose();
  };

  return (
    <Modal show={modalMessage !== ""} onHide={onModalCloseHelper}>
      <Modal.Header>{modalMessage}</Modal.Header>
      <Modal.Body>
        <input name="userInput" className="form-control" value={userInput} autoComplete="off" onChange={onInputChange} autoFocus />
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={() => {
            onModalResponse(false);
            setUserInput("");
          }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            onModalResponse(userInput);
            setUserInput("");
          }}
        >
          OK
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalPrompt;

ModalPrompt.propTypes = {
  modalMessage: PropTypes.string,
  onModalResponse: PropTypes.func,
  onModalClose: PropTypes.func.isRequired,
};
