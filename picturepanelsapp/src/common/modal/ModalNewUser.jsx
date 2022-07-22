import React, { useCallback, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import PropTypes from "prop-types";

import "./Modal.css";

const ModalNewUser = ({ showModal, onNewUser, onModalClose }) => {
  const [errorMessage, setErrorMessage] = useState("");

  const [formValues, setFormValues] = useState({
    userName: "",
    password: "",
    confirmPassword: "",
    displayName: "",
  });

  const onInputChange = useCallback(
    (event) => {
      setFormValues({ ...formValues, [event.target.name]: event.target.value });
    },
    [formValues]
  );

  const onModalCloseHelper = () => {
    setFormValues({ ...formValues, password: "", confirmPassword: "" });
    onModalClose();
  };

  const onNewUserClick = () => {
    setErrorMessage("");

    if (formValues.userName.length < 6) {
      setErrorMessage("Username must be at least six characters.");
      return;
    }
    if (formValues.password.length < 6) {
      setErrorMessage("Password must be at least six characters.");
      return;
    }
    if (formValues.displayName.length < 2) {
      setErrorMessage("Display name must be at least two characters.");
      return;
    }

    if (formValues.password !== formValues.confirmPassword) {
      setErrorMessage("The two passwords must match.");
      return;
    }

    onNewUser(formValues);
  };

  useEffect(() => {
    if (!showModal) {
      setErrorMessage("");
    }
  }, [showModal]);

  return (
    <Modal show={showModal} onHide={onModalCloseHelper}>
      <Modal.Header>Create a new user</Modal.Header>
      <Modal.Body>
        <div className="modalError">{errorMessage}</div>
        Username:
        <div>
          <input
            name="userName"
            className="form-control"
            value={formValues.userName}
            placeholder="username"
            autoComplete="off"
            onChange={onInputChange}
            autoFocus
          />
        </div>
        <br />
        Password:
        <div>
          <input
            type="password"
            name="password"
            className="form-control"
            placeholder="password"
            value={formValues.password}
            autoComplete="off"
            onChange={onInputChange}
          />
        </div>
        <br />
        Confirm Password:
        <div>
          <input
            type="password"
            name="confirmPassword"
            className="form-control"
            placeholder="confirm password"
            value={formValues.confirmPassword}
            autoComplete="off"
            onChange={onInputChange}
          />
        </div>
        <br />
        Display Name:
        <br />
        {'(this is what is displayed for "Uploaded By" when images you have uploaded are being played)'}
        <div>
          <input
            name="displayName"
            className="form-control"
            placeholder="display name"
            value={formValues.displayName}
            autoComplete="off"
            onChange={onInputChange}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div>
          <Button
            className="cancelButton"
            variant="secondary"
            onClick={() => {
              onModalClose();
              setFormValues({ ...formValues, password: "", confirmPassword: "" });
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onNewUserClick(formValues);
            }}
          >
            Create User
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalNewUser;

ModalNewUser.propTypes = {
  showModal: PropTypes.bool,
  onNewUser: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired,
};
