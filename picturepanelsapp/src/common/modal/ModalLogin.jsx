import React, { useCallback, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import PropTypes from "prop-types";

import "./Modal.css";

const ModalLogin = ({ showModal, onLogin, onModalClose }) => {
  const [formValues, setFormValues] = useState({
    userName: localStorage.getItem("userName") ?? "",
    password: "",
  });

  const onInputChange = useCallback(
    (event) => {
      setFormValues({ ...formValues, [event.target.name]: event.target.value });
    },
    [formValues]
  );

  const onModalCloseHelper = () => {
    setFormValues({ ...formValues, password: "" });
    onModalClose();
  };

  useEffect(() => {
    if (!showModal) {
      setFormValues({
        userName: localStorage.getItem("userName") ?? "",
        password: "",
      });
    }
  }, [showModal]);

  return (
    <Modal show={showModal} onHide={onModalCloseHelper}>
      <Modal.Header>Login to Picture Panels</Modal.Header>
      <Modal.Body>
        Username:
        <div>
          <input
            name="userName"
            className="form-control"
            value={formValues.userName}
            placeholder="username"
            autoComplete="off"
            onChange={onInputChange}
            autoFocus={!formValues.userName}
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
            autoFocus={!!formValues.userName}
          />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button
          className="cancelButton"
          variant="secondary"
          onClick={() => {
            onModalClose();
            setFormValues({ ...formValues, password: "" });
          }}
        >
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            onLogin(formValues);
          }}
        >
          Login
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ModalLogin;

ModalLogin.propTypes = {
  showModal: PropTypes.bool,
  onLogin: PropTypes.func.isRequired,
  onModalClose: PropTypes.func.isRequired,
};
