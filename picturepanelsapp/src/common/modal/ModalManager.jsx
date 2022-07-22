import React, { useCallback, useState } from "react";
import PropTypes from "prop-types";
import ModalContext from "./ModalContext";
import ModalMessage from "./ModalMessage";
import ModalConfirm from "./ModalConfirm";

export default function ModalManager({ children }) {
  const [modalMessage, setModalMessage] = useState();
  const [modalConfirmMessage, setModalConfirmMessage] = useState();
  const [modalConfirmResponse, setModalConfirmResponse] = useState();

  const onModalMessageClose = useCallback(() => {
    setModalMessage();
  }, []);

  const onModalConfirmClose = useCallback(() => {
    setModalConfirmMessage();
    setModalConfirmResponse();
  }, []);

  const onModalConfirmResponse = useCallback((response) => {
    setModalConfirmMessage();
    setModalConfirmResponse(response);
  }, []);

  return (
    <ModalContext.Provider value={{ modalMessage, setModalMessage, modalConfirmMessage, setModalConfirmMessage, modalConfirmResponse }}>
      <ModalMessage modalMessage={modalMessage} onModalClose={onModalMessageClose} />
      <ModalConfirm modalMessage={modalConfirmMessage} onModalResponse={onModalConfirmResponse} onModalClose={onModalConfirmClose}></ModalConfirm>
      {children}
    </ModalContext.Provider>
  );
}

ModalManager.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};
