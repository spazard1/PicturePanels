import { useState } from "react";

export function useModalMessage() {
  const [modalMessage, setModalMessage] = useState("");

  const onModalMessageClose = () => {
    setModalMessage("");
  };

  return [modalMessage, setModalMessage, onModalMessageClose];
}
