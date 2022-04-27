import { useState } from "react";

export function useModal() {
  const [modalMessage, setModalMessage] = useState("");

  const onModalClose = () => {
    setModalMessage("");
  };

  return [modalMessage, setModalMessage, onModalClose];
}
