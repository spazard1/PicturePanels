import { useState } from "react";

export function useModalMessage() {
  const [modalMessage, setModalMessage] = useState("");

  const onModalClose = () => {
    setModalMessage("");
  };

  return { modalMessage, setModalMessage, onModalClose };
}
